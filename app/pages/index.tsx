// Index page code with the added links section
import type { NextPage } from "next";
import Head from "next/head";
import NavigationTabs from "../components/NavigationTabs";
import ChainlinkLinks from "../components/ChainlinkLinks";
import Footer from "../components/Footer";
import useFetchPortfolioData from "../hooks/useFetchPortfolioData";
import useFetchRebalancingLogs from "../hooks/useFetchRebalancingLogs";
import TxIcon from "../assets/TxIcon";

const Home: NextPage = () => {
  const {
    portfolioValue,
    PMTTokenValue,
    PMTTotalSupply,
    MimicXAUAlloc,
    MimicBTCAlloc,
    MimicETHAlloc,
    isPending,
  } = useFetchPortfolioData();

  const { logs, loadingLogs } = useFetchRebalancingLogs();

  const formattedPMTTokenValue =
    PMTTokenValue !== null
      ? `${(PMTTokenValue / 1e6).toFixed(2)}`
      : "Unavailable";

  const pmtTokenValueNum = PMTTokenValue !== null ? PMTTokenValue / 1e6 : null;

  const historicalReturn =
    pmtTokenValueNum !== null
      ? `${((pmtTokenValueNum - 1) * 100).toFixed(2)}%`
      : "Unavailable";

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
        <div className="max-w-4xl p-4 mx-auto bg-white sm:p-6">
          <NavigationTabs />
          {/* Portfolio and Token Value */}
          <div className="grid grid-cols-1 gap-2 mb-4 sm:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Portfolio total value</div>
              <div className="text-2xl font-bold">
                {isPending ? <span>Loading...</span> : `USDC ${portfolioValue}`}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">
                Portfolio historical return
              </div>
              <div className="text-2xl font-bold">
                {isPending ? <span>Loading...</span> : `${historicalReturn}`}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Token (PMT) value</div>
              <div className="text-2xl font-bold">
                {isPending ? (
                  <span>Loading...</span>
                ) : (
                  `USDC ${formattedPMTTokenValue}`
                )}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">PMT in circulation</div>
              <div className="text-2xl font-bold">
                {isPending ? <span>Loading...</span> : PMTTotalSupply}
              </div>
            </div>
          </div>
          {/* Current Portfolio Assets */}
          <div className="p-4 mb-4 border rounded-lg">
            <div className="mb-4 font-semibold text-md">
              Current Portfolio Asset Allocations
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          {/* Important Links Section */}
          <ChainlinkLinks />
          {/* Rebalancing History Table */}
          <div className="p-4 border rounded-lg">
            <div className="mb-4 font-semibold text-md">
              Portfolio Rebalancing History
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
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
                      <td colSpan={3} className="pt-2 text-center">
                        Loading logs...
                      </td>
                    </tr>
                  ) : logs.length > 0 ? (
                    logs
                      .sort((a, b) => Number(b.blockNumber - a.blockNumber))
                      .map((log, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 text-center">
                            {log.blockNumber.toString()}
                          </td>
                          <td className="py-2 text-center">
                            {log.args
                              .map(
                                (arg: string) =>
                                  (parseFloat(arg) / 1e4).toFixed(2) + "%"
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
                      <td colSpan={3} className="pt-2 text-center">
                        No logs found.
                      </td>
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
