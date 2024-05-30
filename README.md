# Automated Portfolio Manager

## Overview

The Automated Portfolio Manager automatically rebalances an investment portfolio using real-time data from off-chain sources. This contract adjusts asset allocations within a portfolio based on dynamic market conditions, sentiment scores, and volatility indicators such as the Gold Volatility Index (GVZ). It provides a modern approach to digital assets management.

## Objectives

The example contract supports dynamic asset management using tokens that adhere to the ERC20 standard. For this demonstration, Mimic Tokens representing gold (mXAU), Wrapped Bitcoin (mWBTC), and Ethereum (mETH) are used as the underlying assets. These tokens are automatically bought or sold to mirror changes in crypto market sentiment and gold volatility (GVZ) to ensure the portfolio adjusts to evolving market conditions. This functionality demonstrates how blockchain and Chainlink technologies can be used to create a dynamic investment strategy that adapts to global financial movements in real-time.

**Note**: In a real-world use case, you can integrate the portfolio rebalancing mechanism with any DeFi protocol, such as a swapping mechanism, investments in ERC-4626 vaults, etc.

![Automated Portfolio Manager - Concept](/app/assets/automated-portfolio-manager-concept.webp)

⚠️ **Disclaimer:**

- This tutorial represents an example of using a Chainlink product or service and is provided to help you understand how to interact with Chainlink's systems and services so that you can integrate them into your own. This template is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, has not been audited, and may be missing key checks or error handling to make the usage of the product more clear. Do not use the code in this example in a production environment without completing your own audits and application of best practices. Neither Chainlink Labs, the Chainlink Foundation, nor Chainlink node operators are responsible for unintended outputs that are generated due to errors in code.

- The rebalancing strategy and logic outlined in this tutorial are solely for educational purposes and have not been backtested. This content is not meant to be financial advice and should not be interpreted as such. The example is intended to demonstrate the potential of Chainlink products. Users are strongly advised to perform their own due diligence before making any financial decisions.

## Table of Content

- [Requirements](#requirements)
- [Project setup](#setup)
- [`OffchainDataFetcher` deployment and setup](#offchaindatafetcher-deployment-and-setup)
- [`AutomatedPortfolioManager` deployment and setup](#automatedportfoliomanager-deployment-and-setup)
- [Run the dApp locally](#run-the-dapp-locally)

## Requirements

- **Git**: Make sure you have Git installed. You can check your current version by running `git --version` in your terminal and download the latest version from the official [Git website](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) if necessary.
- **Nodejs** and **npm**: [Install the latest release of Node.js 20](https://nodejs.org/en/download/). **Note**: To ensure you are running the correct version in a terminal, type `node -v`.

  ```bash
  node -v
  v20.11.0
  ```

- **RPC URL**: You need a Remote Procedure Call (RPC) URL for the Ethereum Sepolia network. You can obtain one by creating an account on [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/) and setting up an Ethereum Sepolia project.
- **Private key**: You need the private key of the account that will deploy and interact with the contracts. If you use MetaMask, follow the instructions to [Export a Private Key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key).
- **Testnet funds**: This guide requires testnet ETH, LINK, and USDC on Ethereum Sepolia.
  - Get Sepolia testnet ETH and LINK at [faucets.chain.link](https://faucets.chain.link/sepolia).
  - Get Sepolia testnet USDC at [faucet.circle.com](https://faucet.circle.com).
- **Etherscan API Key**: An API key to verify your deployed contracts on the Etherscan block explorer.
- **CryptoCompare API key**: You need an API key to fetch BTC and ETH [trading signals](https://min-api.cryptocompare.com/documentation?key=TradingSignals&cat=tradingSignalsIntoTheBlockLatest) from CryptoCompare. Get one for free at [CryptoCompare](https://min-api.cryptocompare.com/).
- **MarketData token**: You need a valid token from MarketData to fetch the [GVZ index](https://www.forex.com/ie/news-and-analysis/gvz-index/) value. [Create a free account](https://dashboard.marketdata.app/marketdata/signup) and generate a token.
- **Chainlink Functions subscription**: A Chainlink Functions subscription is required for this guide. If you do not already have a subscription, you can create one using the [Chainlink Functions UI](https://functions.chain.link/).

## Setup

1. Clone the repository and install all front-end dependencies:

   ```bash
   git clone https://github.com/khadni/MVP-AutomatedPortfolioManager.git
   cd MVP-AutomatedPortfolioManager/app
   npm install
   ```

1. Navigate to the root folder and install all back-end dependencies:

   ```bash
   cd ..
   npm install
   ```

1. Copy the `.env.example` file to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

1. Run `source .env` to make your environment variables available in your terminal session.

   ```bash
   source .env
   ```

1. Run `forge compile` to update dependencies in the `lib` folder.

   ```bash
   forge compile
   ```

   Expect an output similar to the following in your terminal:

   ```bash
   [⠔] Compiling...
   [⠰] Compiling 54 files with 0.8.19
   [⠔] Solc 0.8.19 finished in 1.82s
   Compiler run successful!
   ```

## `OffchainDataFetcher` deployment and setup

### Deploy the contract

Run the following script to deploy your `OffchainDataFetcher` contract on Ethereum Sepolia:

```bash
forge script script/DeployOffChainDataFetcher.s.sol --rpc-url $RPC_URL_SEPOLIA --private-key $PRIVATE_KEY --broadcast --verify -vvvv
```

### Add the contract to your Functions subscription and configure it

1. Open the `functions/updateRequestDon.js` script and update the `subscriptionId` variable with your Chainlink Functions subscription ID.

1. Fund your Functions subscription with at least 5 testnet LINK ([Chainlink Functions UI](https://functions.chain.link/)).

1. Run the following script to update the `OffchainDataFetcher` Functions request with [DON-hosted Secrets](https://docs.chain.link/chainlink-functions/resources/secrets):

   ```bash
   node functions/updateRequestDon.js
   ```

   Expect output similar to the following in your terminal:

   ```bash
   Make request...
   Upload encrypted secret to gateways https://01.functions-gateway.testnet.chain.link/,https://02.functions-gateway.testnet.chain.link/. slotId 1. Expiration in minutes: 4320

   ✅ Secrets uploaded properly to gateways https://01.functions-gateway.testnet.chain.link/,https://02.functions-gateway.testnet.chain.link/! Gateways response:  { version: 1717010963, success: true }

   ✅ Automated Functions request settings updated! Transaction hash 0xfaafcfcbb42163679681d189af6e777b36df4ec7a6d2cf14aea6fe220be0899e - Check the explorer https://sepolia.etherscan.io/tx/0xfaafcfcbb42163679681d189af6e777b36df4ec7a6d2cf14aea6fe220be0899e
   ```

   **Note**: On testnets, DON-hosted secrets have a maximum Time to Live (TTL) of 72 hours. If you need to extend the TTL beyond this period, consider using [secrets hosted in your own GitHub gists](https://docs.chain.link/chainlink-functions/tutorials/api-use-secrets-gist) for your requests. For this approach, include your `GITHUB_API_TOKEN` in your `.env` file and use the `updateRequestGists.js` script instead of `updateRequestDon.js`.

1. Add your `OffChainDataFetcher` contract as a consumer in your Functions subscription ([Chainlink Functions UI](https://functions.chain.link/)). **Note**: You can find your deployed `OffchainDataFetcher` contract address in `output/deployedOffchainDataFetcher.json`.

### Create a Time-based upkeep

1. Register an upkeep to call the `sendRequestCBOR` function on your `OffchainDataFetcher` contract daily:

   - Go to the [Chainlink Automation UI](https://automation.chain.link/).
   - Create a Time-based upkeep that targets the `sendRequestCBOR` function.
   - To run the upkeep daily at 3 AM UTC, use the following CRON expression: `0 3 * * *`.
   - Set the gas limit to `1000000`.
   - Fund your upkeep with 5 testnet LINK.

   **Note**: You can find your deployed `OffchainDataFetcher` contract address in `output/deployedOffchainDataFetcher.json`.

1. Configure your contract so only the upkeep contract (and your admin account, which deployed the contract) can call the `sendRequestCBOR` function. This security measure is important to prevent anyone from calling several times `sendRequestCBOR` and draining your Functions subscription balance.

   - Go to [Etherscan](https://sepolia.etherscan.io).
   - Enter your `OffchainDataFetcher` contract address in the search bar. **Note**: This address is available in `output/deployedOffchainDataFetcher.json`.
   - Select the `Contract` section, then click on the `Write Contract` tab.
   - Connect your admin account, which is the wallet you used to deploy the contract.
   - Call the `setAutomationCronContract` function with the `Upkeep address` as the input parameter. **Note**: You can find the `Upkeep address` in the Details section of your upkeep in the [Automation UI](https://automation.chain.link/).

## `AutomatedPortfolioManager` deployment and setup

### Deploy the contract

Run the following script to deploy your `AutomatedPortfolioManager` contract on Ethereum Sepolia:

```bash
forge script script/DeployAutomatedPortfolioManager.s.sol --rpc-url $RPC_URL_SEPOLIA --private-key $PRIVATE_KEY --broadcast --verify -vvvv
```

### Create a custom upkeep

1. Go to the [Chainlink Automation UI](https://automation.chain.link/).

1. Create a new Custom logic upkeep with a starting balance of 5 testnet LINK. **Note**: You can find your deployed `AutomatedPortfolioManager` contract address in `output/deployedPortfolioManager.json`.

1. Configure your contract so only the upkeep contract (and your admin account, which deployed the contract) can call the `performUpkeep` function. This security measure is important to prevent anyone from calling several times `performUpkeep` and draining your Automation balance.

   - Go to [Etherscan](https://sepolia.etherscan.io).
   - Enter your `AutomatedPortfolioManager` contract address in the search bar. **Note**: This address is available in `output/deployedPortfolioManager.json`.
   - Select the `Contract` section, then click on the `Write Contract` tab.
   - Connect your admin account, which is the wallet you used to deploy the contract.
   - In the function inputs, enter the `Forwarder address` into the `setAutomationUpkeepForwarderContract` function. **Note**: You can find the `Forwarder address` in the Details section of your upkeep in the [Automation UI](https://automation.chain.link/).

## Run the dApp locally

1. Navigate to the `app` folder:

   ```bash
   cd app
   ```

1. Run the dApp locally:

   ```bash
   npm run dev
   ```

1. Navigate to `http://localhost:3000` with your favorite browser.

1. Change tab to `My Investment`.

1. Connect your wallet.

1. Enter the amount of testnet USDC you want to invest and click `Invest`.

**Note**: The initial assets allocation is 40% mXAU, 30% mWBTC, and 30% mETH. You can wait until the next scheduled time-based upkeep at 3 AM UTC to fetch the latest data and make it available in your `OffchainDataFetcherContract`. Your custom upkeep will then automatically rebalance the portfolio. Alternatively, you can call the `sendRequestCBOR` function on your `OffchainDataFetcherContract` on Etherscan with your admin account to initiate the first rebalance.
