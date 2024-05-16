import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import NavigationTabs from "../components/NavigationTabs";
import Footer from "../components/Footer";
import useFetchPortfolioData from "../hooks/useFetchPortfolioData";
import useFetchLogs from "../hooks/useFetchLogs";
import TxIcon from "../assets/TxIcon";

const Home: NextPage = () => {
  const {
    portfolioValue,
    PMTTokenValue,
    PMTTotalSupply,
    MimicXAUAlloc,
    MimicBTCAlloc,
    MimicETHAlloc,
    error,
    isPending,
  } = useFetchPortfolioData();

  const { logs, loadingLogs, logsError } = useFetchLogs();

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Automated Portfolio Manager</title>
        <meta
          name="description"
          content="Chainlink Quickstart - Automated Portfolio Manager"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="flex-grow">
        <div className="max-w-4xl p-6 mx-auto bg-white">
          <div className="flex justify-center mb-24">
            <ConnectButton />
          </div>
          {/* Navigation Tabs */}
          <NavigationTabs />
          {/* Portfolio and Token Value */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="text-gray-600 text-md">Portfolio total value</div>
              <div className="text-2xl font-bold">
                {isPending ? <span>Loading...</span> : `USDC ${portfolioValue}`}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-gray-600">Portfolio token (PMT) value</div>
              <div className="text-2xl font-bold">
                {isPending ? <span>Loading...</span> : `USDC ${PMTTokenValue}`}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-gray-600">PMT in circulation</div>
              <div className="text-2xl font-bold">
                {isPending ? <span>Loading...</span> : PMTTotalSupply}
              </div>
            </div>
          </div>
          {/* Current Portfolio Assets */}
          <div className="p-4 mb-6 border rounded-lg">
            <div className="mb-4 font-semibold text-md">
              Current Portfolio Asset Allocations
            </div>
            <div className="grid grid-cols-3">
              {isPending ? (
                <div>Loading...</div>
              ) : (
                [
                  { name: "Mimic Gold", alloc: MimicXAUAlloc },
                  { name: "Mimic WBTC", alloc: MimicBTCAlloc },
                  { name: "Mimic ETH", alloc: MimicETHAlloc },
                ].map((asset) => (
                  <div key={asset.name} className="text-center">
                    <div className="mb-2 font-semibold text-gray-600">
                      {asset.name}
                    </div>
                    <div>
                      {portfolioValue && asset.alloc
                        ? `USDC ${(
                            (Number(portfolioValue) * Number(asset.alloc)) /
                            100
                          ).toFixed(2)} (${asset.alloc}%)`
                        : "Unavailable"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Rebalancing History Table */}
          <div className="p-4 mb-6 border rounded-lg">
            <div className="mb-4 font-semibold text-md">
              Portfolio Rebalancing History
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3">Block #</th>
                    <th className="py-3">
                      Allocations
                      <div className="text-xs font-light">
                        (mGold / mWBTC / mETH)
                      </div>
                    </th>
                    <th className="py-3">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={3}>Loading logs...</td>
                    </tr>
                  ) : logs.length > 0 ? (
                    logs.map((log, index) => (
                      <tr
                        key={index}
                        className="text-sm border-b border-gray-200"
                      >
                        <td className="py-2">{log.blockNumber.toString()}</td>
                        <td className="py-2">
                          {log.args
                            .map(
                              (arg: string) =>
                                (parseFloat(arg) / 10000).toFixed(2) + "%"
                            )
                            .join(" / ")}
                        </td>
                        <td className="py-2 text-center">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${log.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <TxIcon />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
