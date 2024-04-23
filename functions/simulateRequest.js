const fs = require("fs");
const path = require("path");
const {
  SecretsManager,
  simulateScript,
  buildRequestCBOR,
  ReturnType,
  decodeResult,
  Location,
  CodeLanguage,
} = require("@chainlink/functions-toolkit");
const automatedFunctionsConsumerAbi =
  require("../out/OffchainDataFetcher.sol/OffchainDataFetcher.json").abi;
const ethers = require("ethers");
require("@chainlink/env-enc").config();

const consumerAddress = JSON.parse(
  fs.readFileSync("./output/deployedContracts.json", "utf8")
).offchainDataFetcher; // fetch the deployed OffChainDataFetcher contract address
const subscriptionId = 2291; // REPLACE this with your subscription ID

const simulateRequest = async () => {
  // hardcoded for Ethereum Sepolia
  const routerAddress = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
  const donId = "fun-ethereum-sepolia-1";
  const gatewayUrls = [
    "https://01.functions-gateway.testnet.chain.link/",
    "https://02.functions-gateway.testnet.chain.link/",
  ];
  const explorerUrl = "https://sepolia.etherscan.io";

  // Initialize functions settings
  const source = fs
    .readFileSync(path.resolve(__dirname, "sourceBis.js"))
    .toString();

  const args = ["1", "bitcoin", "btc-bitcoin"];
  const secrets = { apiKey: process.env.COINMARKETCAP_API_KEY };
  const slotIdNumber = 0; // slot ID where to upload the secrets
  const expirationTimeMinutes = 1440; // expiration time in minutes of the secrets
  const gasLimit = 300000;

  // Initialize ethers signer and provider to interact with the contracts onchain
  const privateKey = process.env.PRIVATE_KEY; // fetch PRIVATE_KEY
  if (!privateKey)
    throw new Error(
      "private key not provided - check your environment variables"
    );

  const rpcUrl = process.env.RPC_URL_SEPOLIA;

  if (!rpcUrl)
    throw new Error(`rpcUrl not provided  - check your environment variables`);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);

  ///////// START SIMULATION ////////////

  console.log("Start simulation...");

  const response = await simulateScript({
    source: source,
    args: args,
    bytesArgs: [], // bytesArgs - arguments can be encoded off-chain to bytes.
    secrets: secrets,
  });

  console.log("Simulation result", response);
  const errorString = response.errorString;
  if (errorString) {
    console.log(`❌ Error during simulation: `, errorString);
  } else {
    const returnType = ReturnType.uint256;
    const responseBytesHexstring = response.responseBytesHexstring;
    if (ethers.utils.arrayify(responseBytesHexstring).length > 0) {
      const decodedResponse = decodeResult(
        response.responseBytesHexstring,
        returnType
      );
      console.log(`✅ Decoded response to ${returnType}: `, decodedResponse);
    }
  }
};

simulateRequest().catch((e) => {
  console.error(e);
  process.exit(1);
});
