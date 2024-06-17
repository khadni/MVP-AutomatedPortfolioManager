import type { NextPage } from "next";
import Head from "next/head";
import NavigationTabs from "../components/NavigationTabs";
import Links from "../components/Links";
import Disclaimer from "../components/Disclaimer";
import PoweredBy from "../components/PoweredBy";
import Footer from "../components/Footer";
import useFetchPortfolioData from "../hooks/useFetchPortfolioData";
import useFetchRebalancingLogs from "../hooks/useFetchRebalancingLogs";
import TxIcon from "../assets/TxIcon";
import InfoIcon from "../assets/InfoIcon";

const Home: NextPage = () => {
  const {
    portfolioValue,
    PMTTokenValue,
    PMTTotalSupply,
    MimicXAUAlloc,
    MimicBTCAlloc,
    MimicETHAlloc,
    OffChainRebalancingData,
    isPending,
  } = useFetchPortfolioData();

  const { logs, loadingLogs } = useFetchRebalancingLogs();

  const formattedPMTTokenValue =
    PMTTokenValue !== null
      ? `USDC ${(PMTTokenValue / 1e6).toFixed(2)}`
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
          <Disclaimer />
          {/* Portfolio and Token Value */}
          <div className="grid grid-cols-1 gap-2 mb-4 sm:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Portfolio total value</div>
              <div className="text-2xl font-bold">
                {isPending ? (
                  <span>Loading...</span>
                ) : (
                  `USDC ${portfolioValue ?? 0}`
                )}
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
                  `${formattedPMTTokenValue}`
                )}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">PMT in circulation</div>
              <div className="text-2xl font-bold">
                {isPending ? <span>Loading...</span> : PMTTotalSupply ?? 0}
              </div>
            </div>
          </div>
          {/* Current Portfolio Assets */}
          <div className="p-4 mb-4 border rounded-lg">
            <div className="mb-4 font-semibold text-md">
              Current Portfolio Asset Allocations
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              {isPending ? (
                <div>Loading...</div>
              ) : (
                [
                  { name: "Mimic Gold (mXAU)", alloc: MimicXAUAlloc },
                  { name: "Mimic WBTC (mWBTC)", alloc: MimicBTCAlloc },
                  { name: "Mimic ETH (mETH)", alloc: MimicETHAlloc },
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
          {/* Offchain Rebalancing Data */}
          <div className="p-4 mb-4 border rounded-lg">
            <div className="flex items-center mb-4 space-x-2">
              <h3 className="font-semibold text-md">
                Latest Offchain Rebalancing Data
              </h3>
              <div className="relative flex items-center group">
                <span className="hidden w-5 h-5 text-gray-500 cursor-pointer fill-current group-hover:opacity-100 md:inline-block">
                  <InfoIcon />
                </span>
                <div className="absolute z-10 hidden w-64 p-4 ml-5 -mt-3 text-xs text-gray-900 transition-opacity duration-300 ease-in-out bg-gray-100 border border-gray-300 rounded shadow-lg opacity-0 group-hover:block group-hover:opacity-100">
                  These offchain values are{" "}
                  <a
                    href="https://github.com/khadni/MVP-AutomatedPortfolioManager/tree/main/functions"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    fetched and computed using Chainlink Functions
                  </a>{" "}
                  and they{" "}
                  <a
                    href="https://github.com/khadni/MVP-AutomatedPortfolioManager/blob/fc9945e57be340dfb1342b3c26fac27ffd3128b3/src/AutomatedPortfolioManager.sol#L162"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    determine the current asset allocations
                  </a>{" "}
                  of the portfolio.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              {[
                {
                  id: "btc",
                  name: "BTC Computed Sentiment Score",
                  index: 0,
                  tooltip: (
                    <ul className="space-y-2 font-normal text-left list-disc">
                      <li>
                        Raw Trading Signals fetched from{" "}
                        <a
                          href="https://min-api.cryptocompare.com/documentation?key=TradingSignals&cat=tradingSignalsIntoTheBlockLatest"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          CryptoCompare
                        </a>
                      </li>
                      <li>
                        Computed Sentiment Score is{" "}
                        <a
                          href="https://github.com/khadni/MVP-AutomatedPortfolioManager/blob/fc9945e57be340dfb1342b3c26fac27ffd3128b3/functions/source.js#L26"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          calculated offchain using Chainlink Functions
                        </a>
                      </li>
                    </ul>
                  ),
                },
                {
                  id: "eth",
                  name: "ETH Computed Sentiment Score",
                  index: 1,
                  tooltip: (
                    <ul className="space-y-2 font-normal text-left list-disc">
                      <li>
                        Raw Trading Signals fetched from{" "}
                        <a
                          href="https://min-api.cryptocompare.com/documentation?key=TradingSignals&cat=tradingSignalsIntoTheBlockLatest"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          CryptoCompare
                        </a>
                      </li>
                      <li>
                        Computed Sentiment Score is{" "}
                        <a
                          href="https://github.com/khadni/MVP-AutomatedPortfolioManager/blob/fc9945e57be340dfb1342b3c26fac27ffd3128b3/functions/source.js#L26"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          calculated offchain using Chainlink Functions
                        </a>
                      </li>
                    </ul>
                  ),
                },
                {
                  id: "gvz",
                  name: "GVZ (Gold Volatility Index)",
                  index: 2,
                  tooltip: (
                    <ul className="space-y-2 font-normal text-left list-disc">
                      <li>
                        GVZ index fetched from{" "}
                        <a
                          href="https://www.marketdata.app/docs/api/indices/quotes"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          MarketData
                        </a>
                      </li>
                      <li>
                        Read more about the{" "}
                        <a
                          href="https://www.forex.com/ie/news-and-analysis/gvz-index/#:~:text=The%20GVZ%20index%20is%20a,instead%20of%20the%20S%26P%20500."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          GVZ index
                        </a>
                      </li>
                    </ul>
                  ),
                },
              ].map((item) => (
                <div key={item.id} className="text-center">
                  <div className="flex justify-center mb-2 font-semibold text-gray-600">
                    {item.name}
                    <div className="relative flex items-center ml-2 group">
                      <span className="hidden w-5 h-5 text-gray-500 cursor-pointer fill-current md:inline-block">
                        <InfoIcon />
                      </span>
                      <div className="absolute z-10 hidden w-64 p-4 ml-5 -mt-3 text-xs text-gray-900 transition-opacity duration-300 ease-in-out bg-gray-100 border border-gray-300 rounded shadow-lg opacity-0 group-hover:block group-hover:opacity-100">
                        {item.tooltip}
                      </div>
                    </div>
                  </div>
                  <div>
                    {OffChainRebalancingData
                      ? `${OffChainRebalancingData[item.index] / 1e4}`
                      : "Unavailable"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Rebalancing History Table */}
          <div className="p-4 border rounded-lg">
            <div className="mb-4 font-semibold text-md">
              Portfolio Rebalancing History (Last 10 Days)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3">Block #</th>
                    <th className="py-3">
                      Allocations
                      <div className="text-xs font-light">
                        (
                        <a
                          href={
                            "https://sepolia.etherscan.io/address/0xb809576570dD4d9c33f5a6F370Fb542968be5804#code"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          mGold
                        </a>{" "}
                        /{" "}
                        <a
                          href={
                            "https://sepolia.etherscan.io/address/0x263699bc60C44477e5AcDfB1726BA5E89De9134B#code"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          mWBTC
                        </a>{" "}
                        /
                        <a
                          href={
                            "https://sepolia.etherscan.io/address/0x0F542B5D65aa3c29e6046DD219B27AE00b8371b0#code"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          mETH
                        </a>
                        )
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
          {/* Important Links Section */}
          <Links />
          {/* Powered By Chainlink */}
          <PoweredBy />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
