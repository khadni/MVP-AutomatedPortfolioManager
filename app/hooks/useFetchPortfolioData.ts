import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { portfolioManagerConfig } from "../src/portfolioManagerConfig";

interface PortfolioData {
  portfolioValue: string | null;
  PMTTokenValue: number | null;
  PMTTotalSupply: string | null;
  MimicXAUAlloc: string | null;
  MimicBTCAlloc: string | null;
  MimicETHAlloc: string | null;
  OffChainRebalancingData: number[] | null;
}

const useFetchPortfolioData = () => {
  const { data, error, isPending } = useReadContracts({
    contracts: [
      {
        ...portfolioManagerConfig,
        functionName: "getTotalPortfolioUsdcValue",
      },
      {
        ...portfolioManagerConfig,
        functionName: "tokenValueInUsdc6Dec",
      },
      {
        ...portfolioManagerConfig,
        functionName: "totalSupply",
      },
      {
        ...portfolioManagerConfig,
        functionName: "getCurrentAllocations",
      },
      {
        ...portfolioManagerConfig,
        functionName: "calculateAllocations",
      },
    ],
  });

  const [formattedData, setFormattedData] = useState<PortfolioData>({
    portfolioValue: null,
    PMTTokenValue: null,
    PMTTotalSupply: null,
    MimicXAUAlloc: null,
    MimicBTCAlloc: null,
    MimicETHAlloc: null,
    OffChainRebalancingData: null,
  });

  useEffect(() => {
    if (data) {
      const portfolioVal = data[0]?.result ? BigInt(data[0].result) : null;
      const PMTTokenVal = data[1]?.result ? BigInt(data[1].result) : null;
      const PMTTotalSup = data[2]?.result ? BigInt(data[2].result) : null;

      const allocations =
        data[3]?.result && Array.isArray(data[3].result[1])
          ? data[3].result[1].map((value) => BigInt(value))
          : [null, null, null];

      const offChainRebalancingData =
        data[4]?.result && Array.isArray(data[4].result[1])
          ? data[4].result[1].map((value) => Number(value))
          : null;

      setFormattedData({
        portfolioValue:
          portfolioVal !== null
            ? (Number(portfolioVal) / 10 ** 6).toFixed(2)
            : null,
        PMTTokenValue: PMTTokenVal !== null ? Number(PMTTokenVal) : null,
        PMTTotalSupply:
          PMTTotalSup !== null
            ? (Number(PMTTotalSup) / 10 ** 18).toFixed(2)
            : null,
        MimicXAUAlloc:
          allocations[0] !== null
            ? (Number(allocations[0]) / 10 ** 4).toFixed(2)
            : null,
        MimicBTCAlloc:
          allocations[1] !== null
            ? (Number(allocations[1]) / 10 ** 4).toFixed(2)
            : null,
        MimicETHAlloc:
          allocations[2] !== null
            ? (Number(allocations[2]) / 10 ** 4).toFixed(2)
            : null,
        OffChainRebalancingData: offChainRebalancingData,
      });
    }
  }, [data]);

  return { ...formattedData, error, isPending };
};

export default useFetchPortfolioData;
