const ethers = await import("npm:ethers@6.10.0");

if (!secrets.cryptoCompareKey) {
  throw Error(
    "CRYPTOCOMPARE_API_KEY environment variable not set for CryptoCompare API. Get a free key from https://min-api.cryptocompare.com/"
  );
} else if (!secrets.marketDataToken) {
  throw Error(
    "MARKETDATA_API_KEY environment variable not set for Market Data API. Get a free key from https://www.marketdata.app"
  );
}

// Function to parse API data into the required format
function parseData(response) {
  return {
    concentrationVarScore: parseFloat(response.concentrationVar.score),
    largetxsVarScore: parseFloat(response.largetxsVar.score),
    addressesNetGrowthScore: parseFloat(response.addressesNetGrowth.score),
    inOutVarScore: parseFloat(response.inOutVar.score),
  };
}

// Calculate final sentiment score based on weights
// From CryptoCompare: score_threshold_bearish: 0.25
// From CryptoCompare: score_threshold_bullish: 0.75
function calculateFinalSentimentScore(data) {
  return (
    (data.concentrationVarScore * 0.3 +
      data.largetxsVarScore * 0.1 +
      data.addressesNetGrowthScore * 0.3 +
      data.inOutVarScore * 0.3) *
    1e4 // scaling factor to get a 4-digit integer score
  );
}

// Execute API requests concurrently and process responses
const btcTradingSignalsRequest = Functions.makeHttpRequest({
  url: `https://min-api.cryptocompare.com/data/tradingsignals/intotheblock/latest`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Apikey ${secrets.cryptoCompareKey}`,
  },
  params: {
    fsym: "BTC",
  },
});

const ethTradingSignalsRequest = Functions.makeHttpRequest({
  url: `https://min-api.cryptocompare.com/data/tradingsignals/intotheblock/latest`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Apikey ${secrets.cryptoCompareKey}`,
  },
  params: {
    fsym: "ETH",
  },
});

const GvzRequest = Functions.makeHttpRequest({
  url: `https://api.marketdata.app/v1/indices/quotes/GVZ/`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secrets.marketDataToken}`,
  },
});

const [btcTradingSignalsResponse, ethTradingSignalsResponse, GvzResponse] =
  await Promise.all([
    btcTradingSignalsRequest,
    ethTradingSignalsRequest,
    GvzRequest,
  ]);

if (
  btcTradingSignalsResponse.data.Response !== "Success" ||
  ethTradingSignalsResponse.data.Response !== "Success"
) {
  console.error("Error fetching trading signals");
  return;
} else if (GvzResponse.data.s !== "ok") {
  console.error("Error fetching GVZ data");
  return;
}

const btcData = parseData(btcTradingSignalsResponse.data.Data);
const ethData = parseData(ethTradingSignalsResponse.data.Data);

const BTCFinalSentimentScore = calculateFinalSentimentScore(btcData);
const ETHFinalSentimentScore = calculateFinalSentimentScore(ethData);
const GVZLastValue = GvzResponse.data.last[0];

console.log("BTC Final Sentiment Score:", Math.round(BTCFinalSentimentScore));
console.log("ETH Final Sentiment Score:", Math.round(ETHFinalSentimentScore));
console.log("GVZ Last Value:", Math.round(GVZLastValue * 100));

// ABI encoding of the final sentiment scores
const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
  ["uint256", "uint256", "uint256"],
  [
    Math.round(BTCFinalSentimentScore),
    Math.round(ETHFinalSentimentScore),
    Math.round(GVZLastValue * 100),
  ]
);

return ethers.getBytes(encoded);
