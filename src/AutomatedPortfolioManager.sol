// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {AutomationRegistrarInterface, RegistrationParams} from "./interfaces/AutomationRegistrarInterface.sol";
import {AssetValueCalculator} from "./AssetValueCalculator.sol";
import {IOffchainDataFetcher} from "./interfaces/IOffchainDataFetcher.sol";
import {IMimicToken} from "./interfaces/IMimicToken.sol";

contract AutomatedPortfolioManager is ERC20, Ownable, AutomationCompatibleInterface, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error PortfolioManager__MismatchedAssetsLength(); // Arrays of assets and allocations have different lengths
    error PortfolioManager__TotalAllocationMustBe100(); // The sum of all asset allocations must equal 100%
    error PortfolioManager__InvalidIndex(); // The provided index is out of bounds for the asset array
    error PortfolioManager__EmptyAssetsArray(); // The asset array is empty
    error PortfolioManager__InsufficientAllowance(); // The contract lacks sufficient allowance to transfer USDC
    error PortfolioManager__NoUsdcBalanceToWithdraw(); // No USDC balance available for withdrawal
    error PortfolioManager__InsufficientLinkBalance(uint256 available, uint256 required);
    error PortfolioManager__LinkApprovalFailed(); // Failed to approve LINK spending for registration
    error PortfolioManager__NoInvestmentFound(); // No investments have been made in the portfolio
    error PortfolioManager__InvalidPercentage(); // Redemption percentage is invalid (must be between 0 and 100%, represented by 1e6)
    error PortfolioManager__InsufficientTokensForRedemption(); // Not enough portfolio tokens for redemption
    error PortfolioManager__ApprovalFailed(string assetName); // Failed to approve token transfer for an asset
    error PortfolioManager__AssetPurchaseFailed(string assetName, string reason); // Asset purchase failed
    error PortfolioManager__AssetSaleFailed(string assetName); // Asset sale failed
    error PortfolioManager__InvalidSentimentScore(); // Invalid sentiment score received
    error PortfolioManager__InvalidGVZValue(); // Invalid GVZ value received
    error PortfolioManager__NotAllowedCaller(address caller, address owner, address upkeepContract);

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event CustomUpkeepRegistered(uint256 upkeepID, address contractAddress, address admin);
    event PortfolioRebalanced(
        uint256 indexed newMimicXAUAllocation,
        uint256 indexed newMimicBTCAllocation,
        uint256 indexed newMimicETHAllocation
    );
    event Invested(address indexed investor, uint256 indexed usdcAmount, uint256 indexed tokensMinted);
    event Redeemed(address indexed investor, uint256 indexed usdcAmount, uint256 indexed tokensBurned);

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /* ---------- Contracts ---------- */
    IERC20 internal i_usdc;
    LinkTokenInterface internal i_link;
    AutomationRegistrarInterface internal i_registrar;
    IOffchainDataFetcher public i_offChainDataFetcher; // Fetch BTC and ETH sentiment scores, and GVZ value

    /* ---------- Price Feeds ---------- */
    AggregatorV3Interface public s_priceFeedXAU = AggregatorV3Interface(0xC5981F461d74c46eB4b0CF3f4Ec79f025573B0Ea);
    AggregatorV3Interface public s_priceFeedBTC = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
    AggregatorV3Interface public s_priceFeedETH = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

    /* ---------- Portfolio ----------- */
    struct Asset {
        string assetName;
        address tokenAddress;
        AggregatorV3Interface priceFeed;
        uint256 currentAllocation; // In percentage, scaled by 1e6 (e.g., 50% = 500000)
    }

    struct Investor {
        uint256 investedAmount; // in USDC, with 6 decimals
        uint256 redemeedAmount; // in USDC, with 6 decimals
            // Add any other investor-related data...
    }

    Asset[] public s_assets;
    mapping(address => Investor) public s_investors;

    /* ---------- Constants ---------- */
    uint256 private constant WEIGHT_SCALE_6 = 1e6;
    uint256 private constant WEIGHT_SCALE_18 = 1e18;
    uint256 private constant HUNDRED_PERCENT = WEIGHT_SCALE_6; // 100% scaled by 1e6
    uint256 private constant TWO_PERCENT = 20000; // 2% scaled by 1e6
    uint256 private constant INIT_TOKEN_PER_USD = 1e12; // 1e18 (Portfolio Token decimals) / 1e6 (USDC decimals)
    int256 private constant SCORE_DIFF_IMPACT_FACTOR = 10000; // Factor to adjust asset allocations based on sentiment score changes (e.g., 10000 = 1%)
    uint256 private constant GVZ_HIGH_VOL_THRESHOLD = 2000; // GVZ value threshold for high volatility

    /* ---------- Portfolio Value and Rebalancing ---------- */
    uint256 public s_totalInvestedInUsdc; // in USDC, with 6 decimals
    uint256 public s_totalRedeemedInUsdc; // in USDC, with 6 decimals
    uint256 public s_lastRebalanceTimestamp; // Last time the portfolio was rebalanced (Unix timestamp)

    /* ---------- Sentiment and Volatility Data ---------- */
    uint256 public s_lastBtcScore; // Latest fetched sentiment score for BTC
    uint256 public s_lastEthScore; // Latest fetched sentiment score for ETH
    uint256 public s_lastGvz; // Latest fetched GVZ value

    /* ---------- Chainlink Automation ---------- */
    uint256 private s_upkeepID; // ID assigned to the registered upkeep by the Chainlink Automation Registrar
    uint96 private constant INIT_UPKEEP_FUNDING_AMOUNT = 2e18; // 2 LINK for initial upkeep funding
    address public s_forwarderUpkeepContract; // Address of the upkeep contract for Chainlink Automation

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Set initial assets and configurations.
     * @param _offChainDataFetcher The address of the off-chain data fetcher contract used for fetching sentiment scores and GVZ values.
     * Initializes the USDC token address and sets up predefined assets with their initial allocations.
     * The assets, Mimic Tokens mimicking the prices of XAU, BTC, and ETH via Chainlink price feeds,
     * are added with hard-coded addresses for educational purposes on Ethereum's Sepolia network.
     * Sets the initial rebalance timestamp to the current block timestamp.
     */
    constructor(address _offChainDataFetcher) ERC20("PortfolioManagerToken", "PMT") Ownable() {
        i_usdc = IERC20(0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238); // hardcoded for Sepolia
        i_offChainDataFetcher = IOffchainDataFetcher(_offChainDataFetcher);
        i_link = LinkTokenInterface(0x779877A7B0D9E8603169DdbD7836e478b4624789); // hardcoded for Sepolia
        i_registrar = AutomationRegistrarInterface(0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976); // hardcoded for Sepolia

        s_assets.push(Asset("MimicXAU", 0xb809576570dD4d9c33f5a6F370Fb542968be5804, s_priceFeedXAU, 400000)); // initial 40% gold allocation
        s_assets.push(Asset("MimicBTC", 0x263699bc60C44477e5AcDfB1726BA5E89De9134B, s_priceFeedBTC, 300000)); // initial 30% BTC allocation
        s_assets.push(Asset("MimicETH", 0x0F542B5D65aa3c29e6046DD219B27AE00b8371b0, s_priceFeedETH, 300000)); // initial 30% ETH allocation

        s_lastRebalanceTimestamp = block.timestamp; // Set the initial rebalance timestamp
    }

    /**
     * @notice Reverts if called by anyone other than the contract owner or automation registry.
     */
    modifier onlyAllowed() {
        if (msg.sender != owner() && msg.sender != s_forwarderUpkeepContract) {
            revert PortfolioManager__NotAllowedCaller(msg.sender, owner(), s_forwarderUpkeepContract);
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                           REBALANCING LOGIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Calculates new allocations for BTC, ETH, and Gold based on recent sentiment scores and gold market volatility (GVZ).
     * This function adjusts the allocations of BTC and ETH dynamically based on their sentiment score changes and the
     * gold volatility index (GVZ). It aims to reallocate investment more towards gold when market volatility (GVZ) is high,
     * and adjust BTC and ETH allocations based on their respective sentiment scores.
     *
     * @notice This function is for educational purposes and serves as an example of how one might
     * dynamically adjust asset allocations based on external data inputs. It is not intended as financial advice.
     *
     * @return newAllocations Array of new suggested allocations for Gold, BTC, and ETH, scaled by 1e6 (e.g., 50% = 500000).
     * @return newFetchedData Array of the latest fetched data used in calculations, including sentiment scores for BTC, ETH, and GVZ values.
     */
    function calculateAllocations() public view returns (uint256[] memory, uint256[] memory) {
        // Get the latest sentiment scores for BTC and ETH, and the latest GVZ value
        uint256[] memory latestData = i_offChainDataFetcher.getLastResponse();

        _validateExternalData(latestData);

        uint256 newBtcScore = latestData[0];
        uint256 newEthScore = latestData[1];
        uint256 newGvz = latestData[2];

        // Calculate score differences (momentum)
        int256 btcScoreDiff = int256(newBtcScore) - int256(s_lastBtcScore);
        int256 ethScoreDiff = int256(newEthScore) - int256(s_lastEthScore);

        // Adjust BTC and ETH allocations based on score differences
        int256 newBtcSuggestedAllocation = int256(s_assets[1].currentAllocation); // Start with current allocation for BTC
        int256 newEthSuggestedAllocation = int256(s_assets[2].currentAllocation); // Start with current allocation for ETH
        if (btcScoreDiff > 0) {
            newBtcSuggestedAllocation += (newBtcSuggestedAllocation * btcScoreDiff) / SCORE_DIFF_IMPACT_FACTOR; // Increase BTC if score increased
        } else if (btcScoreDiff < 0) {
            newBtcSuggestedAllocation -= (newBtcSuggestedAllocation * (-btcScoreDiff)) / SCORE_DIFF_IMPACT_FACTOR; // Decrease BTC if score decreased
        }
        if (ethScoreDiff > 0) {
            newEthSuggestedAllocation += (newEthSuggestedAllocation * ethScoreDiff) / SCORE_DIFF_IMPACT_FACTOR; // Increase ETH if score increased
        } else if (ethScoreDiff < 0) {
            newEthSuggestedAllocation -= (newEthSuggestedAllocation * (-ethScoreDiff)) / SCORE_DIFF_IMPACT_FACTOR; // Decrease ETH if score decreased
        }

        // Adjust gold allocation based on BTC and ETH changes and GVZ value
        int256 newXauSuggestedAllocation =
            int256(HUNDRED_PERCENT) - newBtcSuggestedAllocation - newEthSuggestedAllocation; // Initial gold allocation
        if (newGvz > GVZ_HIGH_VOL_THRESHOLD) {
            newXauSuggestedAllocation += int256(HUNDRED_PERCENT / 100); // Increase gold allocation by 1% if GVZ is high
            // Distribute the 1% decrease equally from BTC and ETH
            newBtcSuggestedAllocation -= int256(HUNDRED_PERCENT / 200); // 0.5%
            newEthSuggestedAllocation -= int256(HUNDRED_PERCENT / 200); // 0.5%
        }

        // Normalize the allocations to ensure they total exactly 100%
        int256 totalAllocation = newXauSuggestedAllocation + newBtcSuggestedAllocation + newEthSuggestedAllocation;
        if (totalAllocation != int256(HUNDRED_PERCENT)) {
            int256 adjustment = (int256(HUNDRED_PERCENT) - totalAllocation) / 3; // Spread out the main difference
            int256 remainder = (int256(HUNDRED_PERCENT) - totalAllocation) % 3; // Calculate remainder to be distributed

            newXauSuggestedAllocation += adjustment;
            newBtcSuggestedAllocation += adjustment;
            newEthSuggestedAllocation += adjustment;

            // Distribute the remainder one by one to ensure exact 1000000 (100%) total
            if (remainder != 0) {
                if (remainder > 0) {
                    // If positive, increment allocations slightly
                    newXauSuggestedAllocation += 1;
                    if (remainder > 1) newBtcSuggestedAllocation += 1;
                } else {
                    // If negative, decrement allocations slightly
                    newXauSuggestedAllocation -= 1;
                    if (remainder < -1) newBtcSuggestedAllocation -= 1;
                }
            }
        }

        // Prepare the return values
        // Array of new suggested allocations
        uint256[] memory newAllocations = new uint256[](3);
        newAllocations[0] = uint256(newXauSuggestedAllocation);
        newAllocations[1] = uint256(newBtcSuggestedAllocation);
        newAllocations[2] = uint256(newEthSuggestedAllocation);

        // Array of newly fetched data
        uint256[] memory newFetchedData = new uint256[](3);
        newFetchedData[0] = newBtcScore;
        newFetchedData[1] = newEthScore;
        newFetchedData[2] = newGvz;

        return (newAllocations, newFetchedData);
    }

    /**
     * @notice Retrieves all necessary data to assess the need for rebalancing the portfolio and to perform the rebalancing.
     * This function aggregates data on current and suggested asset allocations, calculates the differences in token amounts needed,
     * and prepares the details for potentially performing the rebalancing.
     *
     * @dev This function fetches updated allocation suggestions, compares them to current holdings, and computes the exact changes
     * needed in terms of token quantities. This includes calculating the USD value of the new allocations based on current market prices
     * and determining whether assets need to be bought or sold to meet the new allocations.
     *
     * @return currentAlloc The current allocations of assets in the portfolio as percentages scaled by 1e6 (e.g., 50% = 500000).
     * @return newAllocations The suggested new allocations of assets in the portfolio as percentages scaled by 1e6.
     * @return tokensDifference The difference in the number of tokens needed for each asset compared to current holdings, indicating how many
     *         tokens should be bought (+) or sold (-).
     * @return newFetchedData Array of newly fetched external data used for the calculations, typically including current market prices
     *         or other financial indicators.
     */
    function getRebalancingData()
        public
        view
        returns (uint256[] memory, uint256[] memory, int256[] memory, uint256[] memory)
    {
        // Preparing all data to assess the need for rebalancing
        // and to perform the rebalancing if needed

        // 1. Fetch the latest target asset allocations and external data
        (uint256[] memory newAllocations, uint256[] memory newFetchedData) = calculateAllocations();

        // 2. Retrieve the current asset allocations in the portfolio
        (, uint256[] memory currentAlloc) = getCurrentAllocations();

        // 3. Retrieve the total value of the portfolio in USD
        uint256 totalPortfolioValue = getTotalPortfolioUsdcValue();

        // 4. Determine the USD value of each asset needed to achieve the target allocations
        uint256 newAllocLength = newAllocations.length;
        uint256[] memory tokensPriceInUsd = new uint256[](newAllocLength);
        for (uint256 i = 0; i < newAllocLength; i++) {
            tokensPriceInUsd[i] = AssetValueCalculator.getAssetPriceInUsdc6Dec(s_assets[i].priceFeed);
        }

        // 5. Calculate the number of tokens required for each asset to reach the target value
        uint256[] memory tokensNeeded = new uint256[](newAllocLength);
        for (uint256 i = 0; i < newAllocLength; i++) {
            tokensNeeded[i] =
                (((WEIGHT_SCALE_18 * newAllocations[i] / HUNDRED_PERCENT) * totalPortfolioValue) / tokensPriceInUsd[i]);
        }

        // 6. Get the current holdings of each asset token
        uint256[] memory currentTokens = new uint256[](newAllocLength);
        for (uint256 i = 0; i < newAllocLength; i++) {
            currentTokens[i] = IERC20(s_assets[i].tokenAddress).balanceOf(address(this));
        }

        // 7. Calculate the difference in tokens needed (positive for buy, negative for sell)
        int256[] memory tokensDifference = new int256[](newAllocLength);
        for (uint256 i = 0; i < newAllocLength; i++) {
            tokensDifference[i] = int256(tokensNeeded[i]) - int256(currentTokens[i]);
        }

        // 8. Return the data required for rebalancing decisions and execution
        return (currentAlloc, newAllocations, tokensDifference, newFetchedData);
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Allows an investor to invest USDC and receive PortfolioManager tokens in return.
     * @dev The invested USDC is used to purchase the underlying assets of the portfolio based on their target allocations.
     * @param usdcAmount The amount of USDC to invest (in 6 decimals).
     * @dev Reverts with `PortfolioManager__InsufficientAllowance` if the contract does not have sufficient allowance to transfer USDC on behalf of the investor.
     * @dev Reverts with errors from `_calculateTokensToMint` or `_purchaseAssets` if those functions encounter issues.
     */
    function invest(uint256 usdcAmount) external nonReentrant {
        // Ensure the contract has enough allowance to transfer USDC on behalf of the investor
        if (i_usdc.allowance(msg.sender, address(this)) < usdcAmount) {
            revert PortfolioManager__InsufficientAllowance();
        }

        // Transfer USDC from the investor to the contract
        i_usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Calculate the number of tokens to mint
        uint256 tokensToMint = _calculateTokensToMint(usdcAmount);
        _mint(msg.sender, tokensToMint);

        // Update investor record and total invested amount
        s_investors[msg.sender].investedAmount += usdcAmount;
        s_totalInvestedInUsdc += usdcAmount;

        // Buy the underlying assets based on the target allocation
        // Purchase the underlying assets
        _purchaseAssets(usdcAmount);

        emit Invested(msg.sender, usdcAmount, tokensToMint);
    }

    /**
     * @notice Redeems a percentage of the caller's portfolio holdings for USDC.
     * @param percentage The percentage of the investor's holdings to redeem, scaled by 1e6 (e.g., 500000 for 50%).
     * @dev Calculates the redemption amount in USDC based on the specified percentage, burns the corresponding tokens,
     * and transfers the USDC to the investor.
     * - Validates the input percentage is within a valid range (0 < percentage <= 100).
     * - Burns the proportional tokens from the investor's balance.
     * - Sells assets proportionally to the redeemed tokens and transfers the resultant USDC to the investor.
     * - Updates the investor's redeemed amount and the total USDC redeemed by the contract.
     * @dev Reverts if the percentage is zero or exceeds 100, or if the USDC transfer fails.
     */
    function redeem(uint256 percentage) external nonReentrant {
        if (percentage == 0 || percentage > HUNDRED_PERCENT) {
            revert PortfolioManager__InvalidPercentage();
        }

        uint256 ownershipShare = getOwnershipShare(msg.sender);
        uint256 effectiveRedemptionPercentage = (ownershipShare * percentage) / HUNDRED_PERCENT;

        // Burn the proportional tokens from the investor's balance
        uint256 userTokenBalance = balanceOf(msg.sender);
        uint256 tokensToBurn = (userTokenBalance * percentage) / HUNDRED_PERCENT;
        if (tokensToBurn > userTokenBalance) {
            revert PortfolioManager__InsufficientTokensForRedemption();
        }
        _burn(msg.sender, tokensToBurn);

        // Sell assets and calculate the USDC amount to be redeemed
        uint256 usdcRedeemedAmount = _sellAssetsAndCalculateRedemptionAmount(effectiveRedemptionPercentage);

        // Update investor record and total redeemed amount
        s_investors[msg.sender].redemeedAmount += usdcRedeemedAmount;
        s_totalRedeemedInUsdc += usdcRedeemedAmount;

        // Transfer the redeemed USDC to the investor
        i_usdc.safeTransfer(msg.sender, usdcRedeemedAmount);

        emit Redeemed(msg.sender, usdcRedeemedAmount, tokensToBurn);
    }

    /*//////////////////////////////////////////////////////////////
                             AUTOMATION RELATED
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registers this contract for Chainlink Automation and funds it with LINK for upkeep costs.
     * @dev Self-registers the contract with the Chainlink Automation network, setting up conditions for automated upkeep.
     * It requires enough LINK tokens in the contract for the registration fee. This function sets up the initial parameters
     * for the upkeep, approves the necessary LINK tokens for the Automation Registrar, and then calls the registrar to register
     * the upkeep. It reverts if there's insufficient LINK balance or if LINK token approval fails.
     * Emits a `CustomUpkeepRegistered` event upon successful registration.
     * @return upkeepID The ID assigned to the registered upkeep by the Chainlink Automation Registrar.
     */
    function selfRegisterAndFundForConditionalUpkeep() external onlyOwner returns (uint256) {
        RegistrationParams memory params = RegistrationParams({
            name: "Automated Portfolio Upkeep",
            encryptedEmail: "0x", // Leave as 0x if not using email notifications
            upkeepContract: address(this), // This contract's address
            gasLimit: 1000000, // Adjust based on your `performUpkeep` gas usage
            adminAddress: owner(), // Owner's address for upkeep management
            triggerType: 0, // Use 0 for conditional-based triggers
            checkData: "0x", // Optional: data for `checkUpkeep`
            triggerConfig: "0x", // Not used for time-based triggers
            offchainConfig: "0x", // Placeholder for future use
            amount: INIT_UPKEEP_FUNDING_AMOUNT // The initial funding amount in LINK (In WEI) - Ensure this is less than or equal to the allowance granted to the Automation Registrar
        });

        // Ensure the contract has enough LINK to cover the registration fee
        uint256 linkBalance = i_link.balanceOf(address(this));
        if (linkBalance < params.amount) {
            revert PortfolioManager__InsufficientLinkBalance(linkBalance, params.amount);
        }

        // Approve the Chainlink Automation Registrar to use the contract's LINK tokens
        bool approvalSuccess = i_link.approve(address(i_registrar), params.amount);
        if (!approvalSuccess) {
            revert PortfolioManager__LinkApprovalFailed();
        }

        // Call the `registerUpkeep` function on the Chainlink Automation Registrar
        uint256 upkeepID = i_registrar.registerUpkeep(params);

        // Store the returned upkeepID if needed for future reference
        s_upkeepID = upkeepID;

        emit CustomUpkeepRegistered(upkeepID, address(this), owner());

        return upkeepID;
    }

    /**
     * @notice Sets the address of the Chainlink Automation Upkeep Forwarder contract.
     */
    function setAutomationUpkeepForwarderContract(address _forwarderUpkeepContract) external onlyOwner {
        s_forwarderUpkeepContract = _forwarderUpkeepContract;
    }

    /**
     * @notice Checks if the portfolio needs rebalancing based on current and suggested asset allocations.
     * @dev This function is called by Chainlink Automation to determine if an action is required.
     * @param /*checkData A byte array sent when the upkeep was registered, unused in this function.
     * @return upkeepNeeded A boolean indicating if rebalancing is needed based on asset allocation differences.
     * @return performData A byte-encoded array containing the new allocations, tokens differences, and fetched data for assets.
     *
     * `checkUpkeep` evaluates the portfolio's current allocations against the newly suggested allocations to determine
     * if the differences exceed a specified threshold (TWO_PERCENT). If any asset's allocation differs by more than the
     * threshold, the function flags that upkeep is needed and prepares the necessary data for `performUpkeep` to act upon.
     */
    function checkUpkeep(bytes calldata /* checkData */ )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        (
            uint256[] memory currentAllocations,
            uint256[] memory newAllocations,
            int256[] memory tokensDifference,
            uint256[] memory newFetchedData
        ) = getRebalancingData();

        for (uint256 i = 0; i < currentAllocations.length; i++) {
            // Calculate the absolute difference
            uint256 diff = currentAllocations[i] >= newAllocations[i]
                ? currentAllocations[i] - newAllocations[i]
                : newAllocations[i] - currentAllocations[i];

            if (diff > TWO_PERCENT) {
                upkeepNeeded = true;
                performData = abi.encode(newAllocations, tokensDifference, newFetchedData);
                break;
            }
        }
    }

    /**
     * @notice Executes the necessary trades to rebalance the portfolio according to new asset allocations.
     * @dev Called by Chainlink Automation, when `checkUpkeep` indicates rebalancing is needed.
     * @param performData Encoded data containing new asset allocations, tokens differences, and updated sentiment scores.
     *
     * `performUpkeep` uses the provided `performData` to adjust the portfolio's asset allocations. This function:
     * - Decodes the provided data to get new allocations, tokens differences, and the latest fetched data.
     * - Updates asset allocations to reflect new targets.
     * - Updates internal state with the latest market sentiment scores and GVZ values.
     * - Performs asset trades to align the actual portfolio with the intended allocations, handling both sales and purchases:
     *   1. Sells assets where the token difference indicates an excess.
     *   2. Buys assets where the token difference indicates a shortfall.
     * This sequential approach ensures that the necessary USDC is available from sales to fund subsequent purchases.
     */
    function performUpkeep(bytes calldata performData) external override onlyAllowed {
        // Decode the latest allocations, tokens difference, and fetched data
        (uint256[] memory newAllocations, int256[] memory tokensDifference, uint256[] memory newFetchedData) =
            abi.decode(performData, (uint256[], int256[], uint256[]));

        // Update all asset allocations
        _updateAllAssetAllocations(newAllocations);

        // Update the latest sentiment scores and GVZ value
        s_lastBtcScore = newFetchedData[0];
        s_lastEthScore = newFetchedData[1];
        s_lastGvz = newFetchedData[2];

        // Update the last rebalance timestamp
        s_lastRebalanceTimestamp = block.timestamp;

        // Rebalance the portfolio by buying/selling assets to match the new allocations
        // @dev In a real scenario, assets could be swapped, but for simplicity, we sell and buy them separately
        // First, sell assets to accumulate USDC
        uint256 tokensDifferenceLength = tokensDifference.length;
        for (uint256 i = 0; i < tokensDifferenceLength; i++) {
            if (tokensDifference[i] < 0) {
                _sellSingleAsset(i, uint256(-tokensDifference[i]));
            }
        }

        // Then, use the accumulated USDC to buy assets
        for (uint256 i = 0; i < tokensDifferenceLength; i++) {
            if (tokensDifference[i] > 0) {
                _buySingleAsset(i, uint256(tokensDifference[i]));
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                          GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Calculates the total USD value of all assets held by the portfolio using current market prices (with Chainlink Data Feeds).
    function getTotalPortfolioUsdcValue() public view returns (uint256 totalValue) {
        uint256 assetsLength = s_assets.length;
        for (uint256 i = 0; i < assetsLength; i++) {
            totalValue += AssetValueCalculator.getHeldAssetValueInUsdc6Dec(
                s_assets[i].tokenAddress, s_assets[i].priceFeed, address(this)
            );
        }
    }

    /// @notice Returns the current value of one portfolio token (PMT) in USD, scaled to 6 decimal places.
    function tokenValueInUsdc6Dec() public view returns (uint256) {
        return (getTotalPortfolioUsdcValue() * WEIGHT_SCALE_18) / totalSupply();
    }

    /**
     * @notice Calculates the ownership percentage of an investor based on their token holdings, scaled to 6 decimal places.
     * @param investorAddress The address of the investor.
     * @return The ownership share as a percentage of the total supply, scaled to 6 decimal places.
     */
    function getOwnershipShare(address investorAddress) public view returns (uint256) {
        if (totalSupply() == 0) {
            revert PortfolioManager__NoInvestmentFound();
        }
        return (balanceOf(investorAddress) * WEIGHT_SCALE_6) / totalSupply();
    }

    /**
     * @notice Retrieves the name and current allocation percentage of an asset based on its index in the portfolio.
     * @param index The index of the asset in the array of portfolio assets.
     * @return The name of the asset and its current allocation as a percentage, scaled to 6 decimal places.
     * @dev Reverts with `PortfolioManager__InvalidIndex` if the provided index is out of bounds.
     */
    function getSingleAssetAllocation(uint256 index) public view returns (string memory, uint256) {
        if (index >= s_assets.length) {
            revert PortfolioManager__InvalidIndex();
        }
        return (s_assets[index].assetName, s_assets[index].currentAllocation);
    }

    /**
     * @notice Retrieves the names and current allocation percentages of all assets in the portfolio.
     * @return assetNames An array of asset names.
     * @return allocations An array of current allocations for each asset, scaled to 6 decimal places.
     * @dev Reverts with `PortfolioManager__EmptyAssetsArray` if the asset array is empty.
     */
    function getCurrentAllocations() public view returns (string[] memory, uint256[] memory) {
        if (s_assets.length == 0) {
            revert PortfolioManager__EmptyAssetsArray();
        }

        string[] memory assetNames = new string[](s_assets.length);
        uint256[] memory allocations = new uint256[](s_assets.length);

        for (uint256 i = 0; i < s_assets.length; i++) {
            assetNames[i] = s_assets[i].assetName;
            allocations[i] = s_assets[i].currentAllocation;
        }

        return (assetNames, allocations);
    }

    /*//////////////////////////////////////////////////////////////
                           OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Allows the contract owner to withdraw all USDC from the contract.
    function withdrawUsdc() external onlyOwner {
        uint256 usdcBalance = i_usdc.balanceOf(address(this));

        if (usdcBalance == 0) {
            revert PortfolioManager__NoUsdcBalanceToWithdraw();
        }

        i_usdc.transfer(owner(), usdcBalance);
    }

    /// @dev Updates the address of the OffchainDataFetcher contract.
    function updateOffchainDataFetcher(address _offchainDataFetcher) external onlyOwner {
        i_offChainDataFetcher = IOffchainDataFetcher(_offchainDataFetcher);
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Calculates the amount of tokens to mint for a given USDC investment, based on the current token price orinitial pricing if no tokens have been issued yet.
    function _calculateTokensToMint(uint256 usdcAmount) internal view returns (uint256) {
        if (totalSupply() == 0) {
            return usdcAmount * INIT_TOKEN_PER_USD;
        } else {
            return (usdcAmount * WEIGHT_SCALE_18 / tokenValueInUsdc6Dec());
        }
    }

    /// @dev Buys a specified amount of an asset token after ensuring sufficient USDC allowance, adjusting the allowance if necessary.
    function _buySingleAsset(uint256 assetIndex, uint256 tokenAmount) internal {
        address tokenAddress = s_assets[assetIndex].tokenAddress;
        uint256 tokenPrice6Dec = AssetValueCalculator.getAssetPriceInUsdc6Dec(s_assets[assetIndex].priceFeed);

        // check current USDC allowance and increase if needed
        uint256 currentAllowance = i_usdc.allowance(address(this), tokenAddress);
        uint256 usdcAllowanceRequired = (tokenPrice6Dec * tokenAmount / WEIGHT_SCALE_18) + 1;

        if (currentAllowance < usdcAllowanceRequired) {
            bool success = i_usdc.approve(tokenAddress, usdcAllowanceRequired);
            if (!success) {
                revert PortfolioManager__ApprovalFailed(s_assets[assetIndex].assetName);
            }
        }

        IMimicToken(tokenAddress).buyMimicTokenWithTokenAmount(tokenAmount);
    }

    /// @dev Sells a specified amount of an asset token in exchange for USDC.
    function _sellSingleAsset(uint256 assetIndex, uint256 tokenAmount) internal {
        address tokenAddress = s_assets[assetIndex].tokenAddress;

        IMimicToken(tokenAddress).sellMimicTokenForUSDC(tokenAmount);
    }

    /**
     * @notice Purchases a portion of each asset based on their target allocations and the total USDC amount invested.
     * @dev This internal function is used during the investment process to allocate the invested USDC into the different assets of the portfolio.
     * @param usdcAmount The total amount of USDC to be invested.
     * @dev This function assumes that the `s_assets` array contains valid MimicToken addresses.
     * @dev Reverts with `PortfolioManager__ApprovalFailed` if token approval fails.
     * @dev Reverts with `PortfolioManager__AssetPurchaseFailed` if the token purchase fails.
     */
    function _purchaseAssets(uint256 usdcAmount) internal {
        uint256 assetsLength = s_assets.length;
        for (uint256 i = 0; i < assetsLength; i++) {
            uint256 targetAmount = (usdcAmount * s_assets[i].currentAllocation) / HUNDRED_PERCENT;

            bool success = i_usdc.approve(s_assets[i].tokenAddress, targetAmount);
            if (!success) {
                revert PortfolioManager__ApprovalFailed(s_assets[i].assetName);
            }

            try IMimicToken(s_assets[i].tokenAddress).buyMimicTokenWithUSDCAmount(targetAmount) {}
            catch Error(string memory reason) {
                revert PortfolioManager__AssetPurchaseFailed(s_assets[i].assetName, reason);
            } catch (bytes memory) {
                revert PortfolioManager__AssetPurchaseFailed(s_assets[i].assetName, "Unknown error");
            }
        }
    }

    /**
     * @dev Sells a percentage of all held asset tokens based on the effectiveRedemptionPercentage, calculates and aggregates the USDC received from each sale.
     * @param effectiveRedemptionPercentage The percentage of each asset token to be sold, scaled by 1e6 (e.g., 50% = 500000).
     * @return usdcRedeemedAmount The total USDC amount received from selling the asset tokens.
     */
    function _sellAssetsAndCalculateRedemptionAmount(uint256 effectiveRedemptionPercentage)
        internal
        returns (uint256 usdcRedeemedAmount)
    {
        usdcRedeemedAmount = 0;
        uint256 assetsLength = s_assets.length;
        for (uint256 i = 0; i < assetsLength; i++) {
            IMimicToken mimicToken = IMimicToken(s_assets[i].tokenAddress);
            uint256 totalMimicTokensToSell =
                effectiveRedemptionPercentage * mimicToken.balanceOf(address(this)) / HUNDRED_PERCENT;

            uint256 currentAllowance = mimicToken.allowance(address(this), address(mimicToken));
            if (currentAllowance < totalMimicTokensToSell) {
                mimicToken.approve(address(mimicToken), totalMimicTokensToSell);
            }

            try mimicToken.sellMimicTokenForUSDC(totalMimicTokensToSell) returns (uint256 usdcAmount) {
                usdcRedeemedAmount += usdcAmount;
            } catch {
                revert PortfolioManager__AssetSaleFailed(s_assets[i].assetName);
            }
        }
    }

    /**
     * @dev Updates the allocation percentages for each asset in the portfolio based on the new allocations provided.
     * @param newAllocations Array of new allocation percentages for each asset, scaled by 1e6 (e.g., 50% = 500000).
     * @dev Reverts if the length of newAllocations does not match the number of assets, or if the total allocation does not sum to 100%.
     */
    function _updateAllAssetAllocations(uint256[] memory newAllocations) internal {
        _validateAllocationArrayLength(newAllocations);
        _validateTotalAllocation(newAllocations);

        for (uint256 i = 0; i < newAllocations.length; i++) {
            s_assets[i].currentAllocation = newAllocations[i];
        }

        emit PortfolioRebalanced(newAllocations[0], newAllocations[1], newAllocations[2]);
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Ensures the length of the new target allocations matches the number of managed assets.
    function _validateAllocationArrayLength(uint256[] memory newTargetAllocations) internal view {
        if (newTargetAllocations.length != s_assets.length) {
            revert PortfolioManager__MismatchedAssetsLength();
        }
    }

    /// @dev Verifies that the sum of new target allocations equals 100%, scaled by `WEIGHT_SCALE_6`.
    function _validateTotalAllocation(uint256[] memory newTargetAllocations) internal pure {
        uint256 totalAllocation = 0;
        for (uint256 i = 0; i < newTargetAllocations.length; i++) {
            totalAllocation += newTargetAllocations[i];
        }
        if (totalAllocation != 1 * WEIGHT_SCALE_6) {
            revert PortfolioManager__TotalAllocationMustBe100();
        }
    }

    function _validateExternalData(uint256[] memory data) internal pure {
        (uint256 btcScore, uint256 ethScore, uint256 gvz) = (data[0], data[1], data[2]);

        if (btcScore < 0 || btcScore > 9999 || ethScore < 0 || ethScore > 9999) {
            revert PortfolioManager__InvalidSentimentScore();
        }

        if (gvz < 0 || gvz > 9999) {
            revert PortfolioManager__InvalidGVZValue();
        }
    }
}
