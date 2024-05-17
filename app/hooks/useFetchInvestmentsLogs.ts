import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { sepolia } from "wagmi/chains";
import { portfolioManagerConfig } from "../src/abis";

const useFetchInvestmentsLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<Error | null>(null);
  const [totalUSDCCost, setTotalUSDCCost] = useState(0);
  const [totalPMTAcquired, setTotalPMTAcquired] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      let localTotalUSDCCost = 0;
      let localTotalPMTAcquired = 0;

      try {
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        });

        const fetchedLogs = await publicClient.getLogs({
          address: portfolioManagerConfig.address,
          events: [
            parseAbiItem(
              "event Invested(address indexed investor, uint256 indexed usdcAmount, uint256 indexed tokensMinted)"
            ),
            parseAbiItem(
              "event Redeemed(address indexed investor, uint256 indexed usdcAmount, uint256 indexed tokensBurned)"
            ),
          ],
          fromBlock: BigInt(5916208), // Adjust the starting block to your contract deployment block
        });

        fetchedLogs.forEach((log) => {
          const tokensMinted =
            log.eventName === "Invested"
              ? Number(log.args["tokensMinted"]) / 1e18
              : 0;
          const tokensBurned =
            log.eventName === "Redeemed"
              ? Number(log.args["tokensBurned"]) / 1e18
              : 0;
          const usdcAmount = Number(log.args["usdcAmount"]) / 1e6;

          if (log.eventName === "Invested") {
            localTotalUSDCCost += usdcAmount;
            localTotalPMTAcquired += tokensMinted;
          } else if (log.eventName === "Redeemed") {
            const averageCostPerToken =
              localTotalUSDCCost / localTotalPMTAcquired;
            const redeemedUSDValue = tokensBurned * averageCostPerToken;
            localTotalUSDCCost -= redeemedUSDValue;
            localTotalPMTAcquired -= tokensBurned;
          }
        });

        setLogs(fetchedLogs);
        setTotalUSDCCost(localTotalUSDCCost);
        setTotalPMTAcquired(localTotalPMTAcquired);
      } catch (err) {
        if (err instanceof Error) {
          setLogsError(err);
        } else {
          setLogsError(new Error("An unknown error occurred"));
        }
        console.error("Error fetching logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, []);

  return { logs, loadingLogs, logsError, totalUSDCCost, totalPMTAcquired };
};

export default useFetchInvestmentsLogs;
