const fs = require("fs");
const path = require("path");
const {
  SecretsManager,
  simulateScript,
  buildRequestCBOR,
  ReturnType,
  decodeResult,
  Location,
  createGist,
  deleteGist,
  CodeLanguage,
} = require("@chainlink/functions-toolkit");
const automatedFunctionsConsumerAbi =
  require("../out/OffchainDataFetcher.sol/OffchainDataFetcher.json").abi;
const ethers = require("ethers");
require("dotenv").config();

const consumerAddress = JSON.parse(
  fs.readFileSync("./output/deployedOffchainDataFetcher.json", "utf8")
).offchainDataFetcher; // fetch the deployed OffChainDataFetcher contract address
const subscriptionId = 2291; // REPLACE this with your subscription ID

const updateRequest = async () => {
  // hardcoded for Ethereum Sepolia
  const routerAddress = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
  const donId = "fun-ethereum-sepolia-1";
  const explorerUrl = "https://sepolia.etherscan.io";

  // Initialize functions settings
  const source = fs
    .readFileSync(path.resolve(__dirname, "source.js"))
    .toString();

  const args = [];
  const secrets = {
    cryptoCompareKey: process.env.CRYPTOCOMPARE_API_KEY,
    marketDataToken: process.env.MARKETDATA_TOKEN,
  };
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
  if (response.responseBytesHexstring) {
    console.log("Response Bytes Hex String:", response.responseBytesHexstring);
  } else {
    console.log("No Response Bytes Hex String Found");
  }

  const errorString = response.errorString;
  if (errorString) {
    console.log(`❌ Error during simulation: `, errorString);
  } else {
    const returnType = ReturnType.bytes;
    const responseBytesHexstring = response.responseBytesHexstring;
    if (ethers.utils.arrayify(responseBytesHexstring).length > 0) {
      const decodedResponse = decodeResult(
        response.responseBytesHexstring,
        returnType
      );
      console.log(`✅ Decoded response to ${returnType}: `, decodedResponse);
    }
  }

  //////// MAKE REQUEST ////////
  console.log("\nMake request...");

  // Handle secrets encryption and gist creation
  console.log("\nEncrypting secrets and creating gist...");
  const secretsManager = new SecretsManager({
    signer,
    functionsRouterAddress: routerAddress,
    donId,
  });
  await secretsManager.initialize();
  const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);
  const githubApiToken = process.env.GITHUB_API_TOKEN;
  if (!githubApiToken)
    throw new Error(
      "GitHub API token not provided - check your environment variables"
    );
  const gistURL = await createGist(
    githubApiToken,
    JSON.stringify(encryptedSecretsObj)
  );
  console.log(`✅ Gist created at ${gistURL}`);

  // Encrypt the URL of the gist containing the secrets
  const encryptedSecretsUrls = await secretsManager.encryptSecretsUrls([
    gistURL,
  ]);

  // Prepare for making the request
  const automatedFunctionsConsumer = new ethers.Contract(
    consumerAddress,
    automatedFunctionsConsumerAbi,
    signer
  );
  const transaction = await automatedFunctionsConsumer.updateRequest(
    buildRequestCBOR({
      codeLocation: Location.Inline,
      codeLanguage: CodeLanguage.JavaScript,
      secretsLocation: Location.Remote,
      source,
      encryptedSecretsReference: encryptedSecretsUrls,
      args,
      bytesArgs: [],
    }),
    subscriptionId,
    gasLimit,
    ethers.utils.formatBytes32String(donId)
  );

  console.log(`\nTransaction submitted. Hash: ${transaction.hash}`);
  console.log(
    `Check the transaction on the explorer: ${explorerUrl}/tx/${transaction.hash}`
  );

  // Listen for the transaction to be mined and handle the response
  try {
    const receipt = await transaction.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    // Optionally delete the gist if no longer needed
    // console.log(`Deleting gist...`);
    // await deleteGist(githubApiToken, gistURL);
    // console.log(`Gist deleted successfully.`);
  } catch (error) {
    console.error(`Error processing transaction: ${error}`);
    // Consider retry logic or cleanup here
  }
};

updateRequest().catch((e) => {
  console.error(e);
  process.exit(1);
});
