import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import useFetchMyInvestmentData from "../hooks/useFetchMyInvestmentData";
import NavigationTabs from "../components/NavigationTabs";
import Footer from "../components/Footer";
import { useAccount } from "wagmi";

const MyInvestment: NextPage = () => {
  const { investmentData, loading, error } = useFetchMyInvestmentData();
  const { isConnected } = useAccount();

  const renderInvestmentData = () => {
    if (!isConnected) return <div>Please connect your account</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const { balanceOf, ownershipShare, totalPortfolioUsdcValue } =
      investmentData;

    const userInvestmentValue =
      ownershipShare && totalPortfolioUsdcValue
        ? `$ ${(
            parseFloat(ownershipShare) * parseFloat(totalPortfolioUsdcValue)
          ).toFixed(2)}`
        : "Data unavailable";

    const formattedBalance = balanceOf
      ? `${parseFloat(balanceOf).toFixed(2)} PMT`
      : "Unavailable PMT";

    return (
      <>
        <div className="text-2xl font-bold">{userInvestmentValue}</div>
        <div className="text-md">{formattedBalance}</div>
      </>
    );
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
        <div className="max-w-4xl p-6 mx-auto bg-white">
          <div className="flex justify-center mb-24">
            <ConnectButton />
          </div>
          <NavigationTabs />

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="text-gray-600 text-md">My investment</div>
              {renderInvestmentData()}
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-gray-600">Unrealized gain (loss)</div>
              <div className="text-2xl font-bold">$366.73</div>
              <div className="text-md">3.19%</div>
            </div>
          </div>

          <div className="flex justify-center mb-6 space-x-4">
            <button className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
              INVEST
            </button>
            <button className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
              REDEEM
            </button>
          </div>

          <div className="p-4 mb-6 border rounded-lg">
            <div className="mb-4 font-semibold text-md">History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3">Date</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">PMT tokens</th>
                    <th className="py-3">Value (USDC)</th>
                    <th className="py-3">Tx</th>
                  </tr>
                </thead>
                <tbody>{/* Rows generated from data */}</tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyInvestment;