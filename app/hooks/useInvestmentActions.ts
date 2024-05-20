import { useState } from "react";
import { useWriteContract } from "wagmi";
import { usdcConfig } from "../src/usdcConfig";
import { portfolioManagerConfig } from "../src/portfolioManagerConfig";

export function useInvestmentActions() {
  const { writeContractAsync } = useWriteContract();
  const [isApproving, setIsApproving] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [error, setError] = useState("");

  const increaseAllowance = async (usdcAmount: number): Promise<string> => {
    const amountInWei = BigInt(usdcAmount * 1e6);
    setIsApproving(true);
    try {
      const txResponse = await writeContractAsync({
        abi: usdcConfig.abi,
        address: usdcConfig.address,
        functionName: "increaseAllowance",
        args: [portfolioManagerConfig.address, amountInWei],
      });
      setIsApproving(false);
      return txResponse;
    } catch (err) {
      console.error("Allowance error:", err);
      setError("Allowance failed: " + (err as Error).message);
      setIsApproving(false);
      throw err;
    }
  };

  const invest = async (usdcAmount: number): Promise<string> => {
    const amountInWei = BigInt(usdcAmount * 1e6);
    setIsInvesting(true);
    try {
      const txResponse = await writeContractAsync({
        abi: portfolioManagerConfig.abi,
        address: portfolioManagerConfig.address,
        functionName: "invest",
        args: [amountInWei],
      });
      setIsInvesting(false);
      return txResponse;
    } catch (err) {
      console.error("Investing error:", err);
      setError("Investing failed: " + (err as Error).message);
      setIsInvesting(false);
      throw err;
    }
  };

  return {
    increaseAllowance,
    invest,
    isApproving,
    isInvesting,
    error,
  };
}
