import { useState } from "react";
import { useWriteContract } from "wagmi";
import { portfolioManagerConfig } from "../src/portfolioManagerConfig";

export function useRedeem() {
  const { writeContractAsync } = useWriteContract();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState("");

  const redeem = async (percentage: number): Promise<string> => {
    const scaledPercentage = BigInt(percentage * 1e4);
    setIsRedeeming(true);
    try {
      const txResponse = await writeContractAsync({
        abi: portfolioManagerConfig.abi,
        address: portfolioManagerConfig.address,
        functionName: "redeem",
        args: [scaledPercentage],
      });
      setIsRedeeming(false);
      return txResponse;
    } catch (err) {
      console.error("Redeeming error:", err);
      setError("Redeeming failed: " + (err as Error).message);
      setIsRedeeming(false);
      throw err;
    }
  };

  return {
    redeem,
    isRedeeming,
    error,
  };
}
