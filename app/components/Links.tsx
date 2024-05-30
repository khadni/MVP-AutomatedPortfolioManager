import React from "react";
import { portfolioManagerConfig } from "../src/portfolioManagerConfig";
import deployedOffchainDataFetcher from "../../output/deployedOffchainDataFetcher.json";

const Links = () => {
  return (
    <div className="p-4 mt-4 bg-white border rounded-lg shadow">
      <div className="mb-4 font-semibold text-md">Links</div>
      <div className="mb-2 text-sm font-semibold text-center text-gray-700">
        Deployed contracts on Ethereum Sepolia
      </div>
      <div className="grid grid-cols-1 gap-4 pb-6 mt-6 md:grid-cols-2">
        <ul className="pl-1 text-sm text-center">
          <li className="mb-2">
            <a
              href={`https://sepolia.etherscan.io/address/${portfolioManagerConfig.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              AutomatedPortfolioManager
            </a>
          </li>
          <li>
            <a
              href={`https://sepolia.etherscan.io/address/${deployedOffchainDataFetcher.offchainDataFetcher}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              OffchainDataFetcher
            </a>
          </li>
        </ul>
        <ul className="pl-1 text-sm text-center">
          <li className="mb-1">
            <a
              href="https://sepolia.etherscan.io/address/0xb809576570dD4d9c33f5a6F370Fb542968be5804#code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              mXAU Token
            </a>
            <span className="text-xs"> (*)</span>
          </li>
          <li className="mb-1">
            <a
              href="https://sepolia.etherscan.io/address/0x263699bc60C44477e5AcDfB1726BA5E89De9134B#code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              mWBTC Token
            </a>
            <span className="text-xs"> (*)</span>
          </li>
          <li className="mb-1">
            <a
              href="https://sepolia.etherscan.io/address/0x0F542B5D65aa3c29e6046DD219B27AE00b8371b0#code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              mETH Token
            </a>
            <span className="text-xs"> (*)</span>
          </li>
          <li className="flex items-center justify-center mb-2">
            <span className="text-xs">(*) powered by Chainlink Data Feeds</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Links;
