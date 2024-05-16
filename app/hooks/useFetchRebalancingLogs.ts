import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem, stringify } from "viem";
import { sepolia } from "wagmi/chains";
import { portfolioManagerConfig } from "../src/abis";

const useFetchRebalancingLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        });

        const fetchedLogs = await publicClient.getLogs({
          address: portfolioManagerConfig.address,
          event: parseAbiItem(
            "event PortfolioRebalanced(uint256 indexed, uint256 indexed, uint256 indexed)"
          ),
          fromBlock: BigInt(5916208), // Adjust the starting block to your contract deployment block
        });

        // console.log(stringify(fetchedLogs));
        setLogs(fetchedLogs);
      } catch (err) {
        // Error type checking
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

  return { logs, loadingLogs, logsError };
};

export default useFetchRebalancingLogs;
