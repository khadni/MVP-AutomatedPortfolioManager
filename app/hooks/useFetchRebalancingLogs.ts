import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { sepolia } from "wagmi/chains";
import { portfolioManagerConfig } from "../src/portfolioManagerConfig";

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

        // Fetch the latest block
        const latestBlock = await publicClient.getBlock();
        const latestBlockNumber = latestBlock.number;

        // Calculate the number of blocks for the last 10 days
        const blocksPerDay = BigInt((60 * 60 * 24) / 12); // 12 seconds per block for Ethereum Sepolia, adjust as needed
        const daysToFetch = 10;
        const blocksToFetch = blocksPerDay * BigInt(daysToFetch);

        // Calculate the starting block
        const fromBlock = latestBlockNumber - blocksToFetch;

        console.log(fromBlock);

        const fetchedLogs = await publicClient.getLogs({
          address: portfolioManagerConfig.address,
          event: parseAbiItem(
            "event PortfolioRebalanced(uint256 indexed, uint256 indexed, uint256 indexed)"
          ),
          fromBlock: fromBlock,
        });

        // console.log(stringify(fetchedLogs));
        setLogs(fetchedLogs);
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

  return { logs, loadingLogs, logsError };
};

export default useFetchRebalancingLogs;
