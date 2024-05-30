import deployedConfig from "../../output/deployedPortfolioManager.json";

export const portfolioManagerConfig = {
  address: deployedConfig.PortfolioManager as `0x${string}`,
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_offChainDataFetcher",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [{ internalType: "string", name: "assetName", type: "string" }],
      name: "PortfolioManager__ApprovalFailed",
      type: "error",
    },
    {
      inputs: [
        { internalType: "string", name: "assetName", type: "string" },
        { internalType: "string", name: "reason", type: "string" },
      ],
      name: "PortfolioManager__AssetPurchaseFailed",
      type: "error",
    },
    {
      inputs: [{ internalType: "string", name: "assetName", type: "string" }],
      name: "PortfolioManager__AssetSaleFailed",
      type: "error",
    },
    { inputs: [], name: "PortfolioManager__EmptyAssetsArray", type: "error" },
    {
      inputs: [],
      name: "PortfolioManager__InsufficientAllowance",
      type: "error",
    },
    {
      inputs: [
        { internalType: "uint256", name: "available", type: "uint256" },
        { internalType: "uint256", name: "required", type: "uint256" },
      ],
      name: "PortfolioManager__InsufficientLinkBalance",
      type: "error",
    },
    {
      inputs: [],
      name: "PortfolioManager__InsufficientTokensForRedemption",
      type: "error",
    },
    { inputs: [], name: "PortfolioManager__InvalidGVZValue", type: "error" },
    { inputs: [], name: "PortfolioManager__InvalidIndex", type: "error" },
    { inputs: [], name: "PortfolioManager__InvalidPercentage", type: "error" },
    {
      inputs: [],
      name: "PortfolioManager__InvalidSentimentScore",
      type: "error",
    },
    { inputs: [], name: "PortfolioManager__LinkApprovalFailed", type: "error" },
    {
      inputs: [],
      name: "PortfolioManager__MismatchedAssetsLength",
      type: "error",
    },
    { inputs: [], name: "PortfolioManager__NoInvestmentFound", type: "error" },
    {
      inputs: [],
      name: "PortfolioManager__NoUsdcBalanceToWithdraw",
      type: "error",
    },
    {
      inputs: [
        { internalType: "address", name: "caller", type: "address" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "upkeepContract", type: "address" },
      ],
      name: "PortfolioManager__NotAllowedCaller",
      type: "error",
    },
    {
      inputs: [],
      name: "PortfolioManager__TotalAllocationMustBe100",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "upkeepID",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "contractAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "admin",
          type: "address",
        },
      ],
      name: "CustomUpkeepRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "investor",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "usdcAmount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokensMinted",
          type: "uint256",
        },
      ],
      name: "Invested",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "newMimicXAUAllocation",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "newMimicBTCAllocation",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "newMimicETHAllocation",
          type: "uint256",
        },
      ],
      name: "PortfolioRebalanced",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "investor",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "usdcAmount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokensBurned",
          type: "uint256",
        },
      ],
      name: "Redeemed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "calculateAllocations",
      outputs: [
        { internalType: "uint256[]", name: "", type: "uint256[]" },
        { internalType: "uint256[]", name: "", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      name: "checkUpkeep",
      outputs: [
        { internalType: "bool", name: "upkeepNeeded", type: "bool" },
        { internalType: "bytes", name: "performData", type: "bytes" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "subtractedValue", type: "uint256" },
      ],
      name: "decreaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCurrentAllocations",
      outputs: [
        { internalType: "string[]", name: "", type: "string[]" },
        { internalType: "uint256[]", name: "", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "investorAddress", type: "address" },
      ],
      name: "getOwnershipShare",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getRebalancingData",
      outputs: [
        { internalType: "uint256[]", name: "", type: "uint256[]" },
        { internalType: "uint256[]", name: "", type: "uint256[]" },
        { internalType: "int256[]", name: "", type: "int256[]" },
        { internalType: "uint256[]", name: "", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
      name: "getSingleAssetAllocation",
      outputs: [
        { internalType: "string", name: "", type: "string" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getTotalPortfolioUsdcValue",
      outputs: [
        { internalType: "uint256", name: "totalValue", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "i_offChainDataFetcher",
      outputs: [
        {
          internalType: "contract IOffchainDataFetcher",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "addedValue", type: "uint256" },
      ],
      name: "increaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "usdcAmount", type: "uint256" },
      ],
      name: "invest",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "performData", type: "bytes" }],
      name: "performUpkeep",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "percentage", type: "uint256" },
      ],
      name: "redeem",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "s_assets",
      outputs: [
        { internalType: "string", name: "assetName", type: "string" },
        { internalType: "address", name: "tokenAddress", type: "address" },
        {
          internalType: "contract AggregatorV3Interface",
          name: "priceFeed",
          type: "address",
        },
        { internalType: "uint256", name: "currentAllocation", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_forwarderUpkeepContract",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "s_investors",
      outputs: [
        { internalType: "uint256", name: "investedAmount", type: "uint256" },
        { internalType: "uint256", name: "redemeedAmount", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_lastBtcScore",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_lastEthScore",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_lastGvz",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_lastRebalanceTimestamp",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_priceFeedBTC",
      outputs: [
        {
          internalType: "contract AggregatorV3Interface",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_priceFeedETH",
      outputs: [
        {
          internalType: "contract AggregatorV3Interface",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_priceFeedXAU",
      outputs: [
        {
          internalType: "contract AggregatorV3Interface",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_totalInvestedInUsdc",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_totalRedeemedInUsdc",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "selfRegisterAndFundForConditionalUpkeep",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_forwarderUpkeepContract",
          type: "address",
        },
      ],
      name: "setAutomationUpkeepForwarderContract",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "tokenValueInUsdc6Dec",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_offchainDataFetcher",
          type: "address",
        },
      ],
      name: "updateOffchainDataFetcher",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "withdrawUsdc",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
} as const;
