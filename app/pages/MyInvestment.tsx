import type { NextPage } from "next";
import Head from "next/head";
import NavigationTabs from "../components/NavigationTabs";
import Disclaimer from "../components/Disclaimer";
import PoweredBy from "../components/PoweredBy";
import Footer from "../components/Footer";
import useFetchPortfolioData from "../hooks/useFetchPortfolioData";
import useFetchMyInvestmentData from "../hooks/useFetchMyInvestmentData";
import useFetchInvestmentsLogs from "../hooks/useFetchInvestmentsLogs";
import { InvestForm } from "../components/InvestForm";
import { RedeemForm } from "../components/RedeemForm";
import { useAccount } from "wagmi";
import TxIcon from "../assets/TxIcon";

const MyInvestment: NextPage = () => {
  const { investmentData, loading, error } = useFetchMyInvestmentData();
  const { logs, loadingLogs, logsError, totalUSDCCost, totalPMTAcquired } =
    useFetchInvestmentsLogs();
  const { PMTTokenValue } = useFetchPortfolioData();
  const { isConnected } = useAccount();

  const { balanceOf, userInvestment } = investmentData;

  const renderInvestmentData = () => {
    if (!isConnected) return <div>Please connect your wallet</div>;
    if (loading) return <div className="text-2xl font-bold">Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const userInvestmentValue = userInvestment
      ? `USDC ${(userInvestment / 10 ** 12).toFixed(2)}`
      : "No investment found";

    const formattedBalance = balanceOf
      ? `${(balanceOf / 10 ** 18).toFixed(2)} PMT`
      : "";

    return (
      <>
        <div className="text-2xl font-bold">{userInvestmentValue}</div>
        <div className="text-md">{formattedBalance}</div>
      </>
    );
  };

  const renderHistoryTable = () => {
    if (!isConnected)
      return (
        <tr>
          <td colSpan={5} className="pt-2">
            Please connect your wallet
          </td>
        </tr>
      );
    if (loadingLogs)
      return (
        <tr>
          <td colSpan={5} className="pt-2">
            Loading logs...
          </td>
        </tr>
      );
    if (logsError)
      return (
        <tr>
          <td colSpan={5}>Error loading logs: {logsError.message}</td>
        </tr>
      );
    if (logs.length === 0)
      return (
        <tr>
          <td colSpan={5} className="pt-2">
            No logs found.
          </td>
        </tr>
      );

    return logs
      .sort((a, b) => Number(b.blockNumber - a.blockNumber))
      .map((log, index) => (
        <tr key={index} className="text-sm border-b border-gray-200">
          <td>{log.blockNumber.toString()}</td>
          <td>{log.eventName === "Invested" ? "Invest" : "Redeem"}</td>
          <td>
            {(
              Number(log.args.tokensMinted || log.args.tokensBurned) / 1e18
            ).toFixed(2)}
          </td>
          <td>{(Number(log.args.usdcAmount) / 1e6).toFixed(2)} USDC</td>
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
      ));
  };

  const calculateUnrealizedGain = () => {
    if (!isConnected) {
      return <div>Please connect your wallet</div>;
    }
    if (loadingLogs) {
      return <div className="text-2xl font-bold">Loading...</div>;
    }
    if (totalPMTAcquired === null || !PMTTokenValue) {
      return <div className="text-2xl font-bold">No investment found</div>;
    }

    if (totalUSDCCost === 0) {
      return <div className="text-2xl font-bold">USDC 0.00</div>;
    }

    const currentHoldingsValue = (PMTTokenValue * (balanceOf || 0)) / 1e24;

    const unrealizedGain =
      currentHoldingsValue === 0
        ? 0
        : currentHoldingsValue - totalUSDCCost / 1e6;

    return (
      <div className="text-2xl font-bold">USDC {unrealizedGain.toFixed(2)}</div>
    );
  };

  const calculateUnrealizedGainPercent = () => {
    if (
      !isConnected ||
      loadingLogs ||
      !PMTTokenValue ||
      totalPMTAcquired === null
    ) {
      return "";
    }

    if (totalUSDCCost === 0 || totalPMTAcquired === 0) {
      return "0.00%";
    }

    const currentHoldingsValue = PMTTokenValue * (balanceOf || 0);

    const unrealizedGainPercent =
      currentHoldingsValue === 0
        ? 0
        : (currentHoldingsValue / 1e18 / totalUSDCCost - 1) * 100;

    return `${unrealizedGainPercent.toFixed(2)}%`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>My Investment - Automated Portfolio Manager</title>
        <meta
          name="description"
          content="Detailed view of my investment in the Automated Portfolio Manager"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="flex-grow">
        <div className="max-w-4xl p-4 mx-auto bg-white sm:p-6">
          <NavigationTabs />
          <Disclaimer />
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="text-gray-600 text-md">My investment</div>
              {renderInvestmentData()}
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-gray-600">Unrealized gain (loss)</div>
              <div>{calculateUnrealizedGain()}</div>
              <div className="text-md">{calculateUnrealizedGainPercent()}</div>
            </div>
          </div>

          {/* Faucet Link Section */}
          <div className="p-4 mt-4 mb-6 bg-white border rounded-lg">
            <h3 className="font-semibold text-gray-600 text-md">
              Need USDC to invest?
            </h3>
            <p className="text-sm text-gray-600">
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Get testnet USDC for Ethereum Sepolia
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-6 border rounded-lg">
            {isConnected ? (
              <div className="flex flex-col w-full md:flex-row">
                <div className="w-full md:w-1/2">
                  <InvestForm />
                </div>
                <div className="w-full md:w-1/2">
                  <RedeemForm />
                </div>
              </div>
            ) : (
              <div>Please connect your wallet above</div>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <div className="mb-4 font-semibold text-md">History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3">Block #</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">PMT tokens</th>
                    <th className="py-3">Value (USDC)</th>
                    <th className="py-3">Tx</th>
                  </tr>
                </thead>
                <tbody>{renderHistoryTable()}</tbody>
              </table>
            </div>
          </div>
          {/* Powered By Chainlink */}
          <PoweredBy />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyInvestment;
