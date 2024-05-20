import React from "react";
import { portfolioManagerConfig } from "../src/portfolioManagerConfig";
import ChainlinkFunctionsLogo from "../assets/ChainlinkFunctionsLogo";
import ChainlinkAutomationLogo from "../assets/ChainlinkAutomationLogo";

const ChainlinkLinks = () => {
  return (
    <div className="p-4 mb-4 bg-white border rounded-lg shadow">
      <div className="mb-4 font-semibold text-md">Links</div>
      <div className="mb-2 text-sm font-semibold text-center text-gray-700">
        Deployed contracts on Ethereum Sepolia
      </div>
      <ul className="pl-1 text-sm text-center">
        <li>
          <a
            href={`https://sepolia.etherscan.io/address/${portfolioManagerConfig.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Automated Portfolio Manager
          </a>
        </li>
        <li>
          <a
            href="https://sepolia.etherscan.io/address/0x90f1C06EA294ce2246b14a4C48a80A2e2830d5E7#code"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            OffchainDataFetcher
          </a>
        </li>
      </ul>
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
        <div>
          <div className="flex items-center mb-2 md:justify-center">
            <div className="mr-3">
              <ChainlinkAutomationLogo />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              Chainlink Automation
            </h3>
          </div>
          <ul className="pl-1 text-sm text-center">
            <li>
              <a
                href="https://automation.chain.link/sepolia/64159323189921786672647921773966883001841989688860098233415913457408266292103"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Automated Portfolio Manager Upkeep
              </a>
            </li>
            <li>
              <a
                href="https://automation.chain.link/sepolia/79537681464623932209779944926166351590028205447141399131407393178650221347248"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View OffchainDataFetcher Upkeep
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="flex items-center mb-2 md:justify-center">
            <div className="mr-3">
              <ChainlinkFunctionsLogo />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              Chainlink Functions
            </h3>
          </div>
          <ul className="pl-1 text-sm text-center">
            <li>
              <a
                href="https://functions.chain.link/sepolia/2291"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View OffchainDataFetcher Functions Subscription
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChainlinkLinks;
