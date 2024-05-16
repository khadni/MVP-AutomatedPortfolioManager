import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem, stringify } from "viem";
import { sepolia } from "wagmi/chains";

const useFetchLogs = () => {
  const [logs, setLogs] = useState<any[]>([]); // Adjust based on the actual log structure
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
          address: "0xE1Afb03E9DA78e09Ad8b60186243EB91847C68CB",
          event: parseAbiItem(
            "event PortfolioRebalanced(uint256 indexed, uint256 indexed, uint256 indexed)"
          ),
          fromBlock: BigInt(5909492), // Portfolio contract deployment block
        });

        console.log(stringify(fetchedLogs));
        setLogs(fetchedLogs);
      } catch (err) {
        // Error type checking
        if (err instanceof Error) {
          setLogsError(err);
        } else {
          // Handle cases where err may not be an Error object
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

export default useFetchLogs;
