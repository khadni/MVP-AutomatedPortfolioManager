import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { portfolioManagerConfig } from "../src/abis";
import { useAccount } from "wagmi";

interface MyInvestmentData {
  balanceOf: string | null;
  ownershipShare: string | null;
  totalPortfolioUsdcValue: string | null;
}

const useFetchMyInvestmentData = () => {
  const { address } = useAccount();
  const [investmentData, setInvestmentData] = useState<MyInvestmentData>({
    balanceOf: null,
    ownershipShare: null,
    totalPortfolioUsdcValue: null,
  });
  const [loading, setLoading] = useState(false);

  const { data, error, isPending } = useReadContracts({
    contracts: address
      ? [
          {
            ...portfolioManagerConfig,
            functionName: "balanceOf",
            args: [address],
          },
          {
            ...portfolioManagerConfig,
            functionName: "getOwnershipShare",
            args: [address],
          },
          {
            ...portfolioManagerConfig,
            functionName: "getTotalPortfolioUsdcValue",
          },
        ]
      : [],
  });

  useEffect(() => {
    // console.log("Fetching data for address:", address);
    if (!isPending && data) {
      // console.log("Raw contract data:", data);
      const balanceOf = data[0]?.result
        ? (Number(data[0].result.toString()) / 10 ** 18).toFixed(2)
        : null;
      const ownershipShare = data[1]?.result
        ? (Number(data[1].result.toString()) / 10 ** 6).toFixed(2)
        : null;
      const totalPortfolioUsdcValue = data[2]?.result
        ? (Number(data[2].result.toString()) / 10 ** 6).toFixed(2)
        : null;

      setInvestmentData({
        balanceOf,
        ownershipShare,
        totalPortfolioUsdcValue,
      });
    }

    if (error) {
      console.error("Error fetching investment data:", error);
    }
    setLoading(isPending);
  }, [data, error, isPending, address]);

  return { investmentData, loading, error };
};

export default useFetchMyInvestmentData;
