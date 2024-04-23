// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IExtendedERC20 is IERC20 {
    function decimals() external view returns (uint8);
}

library AssetValueCalculator {
    /**
     * @notice Calculates the total USD value (with 6 decimals) of a specific token held by a given address.
     * @dev This function fetches the token balance, retrieves the latest price from the price feed, and performs necessary decimal adjustments.
     * @param tokenAddress The address of the ERC20 token contract.
     * @param priceFeed The address of the Chainlink price feed for the token.
     * @param contractAddress The address holding the tokens.
     * @return The total USD value of the tokens held by the contract, expressed with 6 decimals.
     */
    function getHeldAssetValueInUsd6Dec(address tokenAddress, AggregatorV3Interface priceFeed, address contractAddress)
        external
        view
        returns (uint256)
    {
        IExtendedERC20 token = IExtendedERC20(tokenAddress);
        uint256 tokenBalance = token.balanceOf(contractAddress);
        (, int256 price,,,) = priceFeed.latestRoundData();

        uint256 feedDecimals = priceFeed.decimals();
        uint256 tokenDecimals = token.decimals();
        uint256 usdcDecimals = 6; // USDC uses 6 decimals

        // Convert the price from the feed's decimals to the token's decimals
        uint256 priceAdjustedForTokenDecimals = uint256(price) * (10 ** tokenDecimals) / (10 ** feedDecimals);

        // Calculate asset value in the token's decimals
        uint256 assetValueInTokenDecimals = tokenBalance * priceAdjustedForTokenDecimals / (10 ** tokenDecimals);

        // Adjust the asset value to USDC's decimals
        uint256 assetValueInUsd = assetValueInTokenDecimals * (10 ** usdcDecimals) / (10 ** tokenDecimals);

        return assetValueInUsd;
    }

    /**
     * @notice Retrieves the current price of a token in USD (with 6 decimals) from its corresponding Chainlink price feed.
     * @dev This function fetches the latest price data from the price feed and applies necessary decimal adjustments.
     * @param tokenAddress The address of the ERC20 token contract.
     * @param priceFeed The address of the Chainlink price feed for the token.
     * @return The current price of the token in USD, expressed with 6 decimals.
     */
    function getAssetPriceInUsd6Dec(address tokenAddress, AggregatorV3Interface priceFeed)
        external
        view
        returns (uint256)
    {
        IExtendedERC20 token = IExtendedERC20(tokenAddress);
        (, int256 price,,,) = priceFeed.latestRoundData();

        uint256 feedDecimals = priceFeed.decimals();
        uint256 tokenDecimals = token.decimals();
        uint256 usdcDecimals = 6; // USDC uses 6 decimals

        // Convert the price from the feed's decimals to the token's decimals
        uint256 priceAdjustedForTokenDecimals = uint256(price) * (10 ** tokenDecimals) / (10 ** feedDecimals);

        // Adjust the asset value to USDC's decimals
        uint256 assetValueInUsd6Dec = priceAdjustedForTokenDecimals * (10 ** usdcDecimals) / (10 ** tokenDecimals);

        return assetValueInUsd6Dec;
    }

    /**
     * @notice Fetches the latest price from a Chainlink price feed.
     * @dev This function interacts with the price feed contract to retrieve the most recent price data.
     * @param priceFeed The address of the Chainlink price feed.
     * @return The latest price value from the price feed.
     */
    function getPriceFromPriceFeed(AggregatorV3Interface priceFeed) external view returns (uint256) {
        (, int256 price,,,) = priceFeed.latestRoundData();
        return uint256(price);
    }
}
