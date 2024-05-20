import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { portfolioManagerConfig } from "../src/portfolioManagerConfig";
import { useAccount } from "wagmi";

interface MyInvestmentData {
  balanceOf: number | null;
  ownershipShare: number | null;
  totalPortfolioUsdcValue: number | null;
  userInvestment: number | null;
}

const useFetchMyInvestmentData = () => {
  const { address } = useAccount();
  const [investmentData, setInvestmentData] = useState<MyInvestmentData>({
    balanceOf: null,
    ownershipShare: null,
    totalPortfolioUsdcValue: null,
    userInvestment: null,
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
    if (!isPending && data) {
      const balanceOf = data[0]?.result ? Number(data[0].result) : null;
      const ownershipShare = data[1]?.result ? Number(data[1].result) : null;
      const totalPortfolioUsdcValue = data[2]?.result
        ? Number(data[2].result)
        : null;

      const userInvestment =
        ownershipShare && totalPortfolioUsdcValue
          ? ownershipShare * totalPortfolioUsdcValue
          : null;

      setInvestmentData({
        balanceOf,
        ownershipShare,
        totalPortfolioUsdcValue,
        userInvestment,
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
