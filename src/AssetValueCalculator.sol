// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

// IExtendedERC20 extends the basic ERC-20 interface to include the decimals() function.
// This interface assumes that the decimals() function is implemented by the token contract.
// Note that in the ERC-20 standard, implementing decimals() is optional and might not be present in all ERC-20 tokens.
interface IExtendedERC20 is IERC20 {
    function decimals() external view returns (uint8);
}

library AssetValueCalculator {
    error AssetValueCalculator__PriceFeedError();
    error AssetValueCalculator__StalePriceFeed();

    uint256 private constant USDC_DECIMALS = 6;

    // Hardcoded value for the feeds used in this quickstart, on Ethereum Sepolia.
    // Refer to the docs: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=#sepolia-testnet
    uint256 private constant ASSET_HEARTBEAT_INTERVAL = 3600; // 1 hour heartbeat for BTC/USD, ETH/USD, and XAU/USD
    uint256 private constant USDC_HEARTBEAT_INTERVAL = 86400; // 24 hours heartbeat for USDC/USD

    address private constant USDC_USD_FEED = 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E; // USDC/USD price feed address on Ethereum Sepolia

    /**
     * @notice Calculates the total USDC value (with 6 decimals) of a specific token held by a given address.
     * @dev Assumes the token implements a `decimals()` method as defined in IExtendedERC20. Fetches asset price in USD, then converts it using the USDC/USD price feed.
     * Checks for non-negative price, non-zero round ID, freshness of asset price data, and freshness of USDC/USD price data.
     * If any price data is stale, negative, or the round ID is zero, the function will revert.
     * @param tokenAddress The address of the ERC20 token contract complying with IExtendedERC20.
     * @param assetPriceFeed The address of the Chainlink price feed for the token.
     * @param contractAddress The address holding the tokens.
     * @return The total USDC value of the tokens held by the contract, expressed with 6 decimals.
     */
    function getHeldAssetValueInUsdc6Dec(
        address tokenAddress,
        AggregatorV3Interface assetPriceFeed,
        address contractAddress
    ) external view returns (uint256) {
        AggregatorV3Interface usdcPriceFeed = AggregatorV3Interface(USDC_USD_FEED);
        IExtendedERC20 token = IExtendedERC20(tokenAddress);
        uint256 tokenBalance = token.balanceOf(contractAddress);
        (uint80 assetRoundId, int256 assetPrice,, uint256 assetUpdatedAt,) = assetPriceFeed.latestRoundData();
        if (assetPrice <= 0 || assetRoundId == 0) {
            revert AssetValueCalculator__PriceFeedError();
        }
        if (assetUpdatedAt < block.timestamp - ASSET_HEARTBEAT_INTERVAL) {
            revert AssetValueCalculator__StalePriceFeed();
        }

        (uint80 usdcRoundId, int256 usdcPrice,, uint256 usdcUpdatedAt,) = usdcPriceFeed.latestRoundData();
        if (usdcPrice <= 0 || usdcRoundId == 0) {
            revert AssetValueCalculator__PriceFeedError();
        }
        if (usdcUpdatedAt < block.timestamp - USDC_HEARTBEAT_INTERVAL) {
            revert AssetValueCalculator__StalePriceFeed();
        }

        uint256 feedDecimals = assetPriceFeed.decimals();
        uint256 usdcDecimals = usdcPriceFeed.decimals();
        uint256 priceInUsdDecimals = Math.mulDiv(uint256(assetPrice), 10 ** USDC_DECIMALS, 10 ** feedDecimals);
        uint256 priceInUsdc = Math.mulDiv(priceInUsdDecimals, 10 ** usdcDecimals, uint256(usdcPrice));

        return Math.mulDiv(tokenBalance, priceInUsdc, 10 ** token.decimals());
    }

    /**
     * @notice Retrieves the current price of a token in USDC (with 6 decimals) from its corresponding Chainlink price feed and the USDC/USD feed.
     * @dev Fetches the latest price data from the price feed, applies necessary decimal adjustments, and adjusts it according to the current USDC/USD rate.
     * Reverts if the price data is stale (older than 1 hour), the price is non-positive, or the round ID is zero.
     * @param assetPriceFeed The address of the Chainlink price feed for the asset.
     * @return The current price of the asset in USDC, expressed with 6 decimals.
     */
    function getAssetPriceInUsdc6Dec(AggregatorV3Interface assetPriceFeed) external view returns (uint256) {
        AggregatorV3Interface usdcPriceFeed = AggregatorV3Interface(USDC_USD_FEED);
        (uint80 usdcRoundId, int256 usdcPrice,, uint256 usdcUpdatedAt,) = usdcPriceFeed.latestRoundData();
        if (usdcPrice <= 0 || usdcRoundId == 0) {
            revert AssetValueCalculator__PriceFeedError();
        }
        if (usdcUpdatedAt < block.timestamp - USDC_HEARTBEAT_INTERVAL) {
            revert AssetValueCalculator__StalePriceFeed();
        }

        (, int256 assetPrice,, uint256 assetUpdatedAt,) = assetPriceFeed.latestRoundData();
        if (assetUpdatedAt < block.timestamp - ASSET_HEARTBEAT_INTERVAL) {
            revert AssetValueCalculator__StalePriceFeed();
        }
        if (assetPrice <= 0) {
            revert AssetValueCalculator__PriceFeedError();
        }

        uint256 feedDecimals = assetPriceFeed.decimals();
        uint256 priceInUsdDecimals = Math.mulDiv(uint256(assetPrice), 10 ** USDC_DECIMALS, 10 ** feedDecimals);
        uint256 usdcDecimals = usdcPriceFeed.decimals();
        return Math.mulDiv(priceInUsdDecimals, 10 ** usdcDecimals, uint256(usdcPrice));
    }

    /**
     * @notice Fetches the latest price from a Chainlink price feed and converts it to USDC.
     * @dev Retrieves the most recent price data, ensuring it is not stale. Converts the price to USDC using the USDC/USD price feed.
     * Reverts if data from either feed is stale, the price is non-positive, or if the round ID is zero.
     * @param assetPriceFeed The address of the Chainlink price feed for the asset.
     * @return The latest price value from the asset price feed, adjusted to USDC.
     */
    function getUsdcPriceFromPriceFeed(AggregatorV3Interface assetPriceFeed) external view returns (uint256) {
        AggregatorV3Interface usdcPriceFeed = AggregatorV3Interface(USDC_USD_FEED);
        (uint80 usdcRoundId, int256 usdcPrice,, uint256 usdcUpdatedAt,) = usdcPriceFeed.latestRoundData();
        if (usdcUpdatedAt < block.timestamp - USDC_HEARTBEAT_INTERVAL || usdcRoundId == 0 || usdcPrice <= 0) {
            revert AssetValueCalculator__PriceFeedError();
        }

        (uint80 assetRoundId, int256 assetPrice,, uint256 assetUpdatedAt,) = assetPriceFeed.latestRoundData();
        if (assetUpdatedAt < block.timestamp - ASSET_HEARTBEAT_INTERVAL || assetRoundId == 0 || assetPrice <= 0) {
            revert AssetValueCalculator__StalePriceFeed();
        }

        uint256 feedDecimals = assetPriceFeed.decimals();
        uint256 priceInUsdDecimals = Math.mulDiv(uint256(assetPrice), 10 ** USDC_DECIMALS, 10 ** feedDecimals);
        uint256 usdcDecimals = usdcPriceFeed.decimals();
        return Math.mulDiv(priceInUsdDecimals, 10 ** usdcDecimals, uint256(usdcPrice));
    }
}
