import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useInvestmentActions } from "../hooks/useInvestmentActions";
import { useWaitForTransactionReceipt } from "wagmi";
import { Modal } from "./Modal";
import LoaderIcon from "../assets/LoaderIcon";

export const InvestForm = () => {
  const { isConnected } = useAccount();
  const { increaseAllowance, invest, isApproving, isInvesting, error } =
    useInvestmentActions();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [allowanceTxHash, setAllowanceTxHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [investmentTxHash, setInvestmentTxHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [investmentInitiated, setInvestmentInitiated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] =
    useState<React.ReactNode>("Processing...");

  const { isSuccess: allowanceSuccess, error: allowanceError } =
    useWaitForTransactionReceipt({
      hash: allowanceTxHash,
      query: { enabled: !!allowanceTxHash },
    });

  const { isSuccess: investmentSuccess, error: investmentError } =
    useWaitForTransactionReceipt({
      hash: investmentTxHash,
      query: { enabled: !!investmentTxHash },
    });

  useEffect(() => {
    if (allowanceSuccess && !investmentInitiated) {
      (async () => {
        try {
          setInvestmentInitiated(true);
          setModalContent(
            <div className="flex flex-col items-center justify-center space-y-4">
              <LoaderIcon />
              <p className="text-sm text-center">
                Processing Investment tx... Please wait...
              </p>
            </div>
          );
          const investTxHash = await invest(Number(usdcAmount));
          setInvestmentTxHash(investTxHash as `0x${string}`);
        } catch (error) {
          console.error("Investment error:", error);
          setModalContent(`Investment failed: ${error}`);
          setShowModal(true);
        }
      })();
    }
    if (allowanceError) {
      setModalContent(`Approval failed: ${allowanceError.message}`);
      setShowModal(true);
    }
  }, [
    allowanceSuccess,
    allowanceError,
    invest,
    usdcAmount,
    investmentInitiated,
  ]);

  useEffect(() => {
    if (investmentSuccess) {
      setModalContent("Investment successful!");
      setTimeout(() => {
        setShowModal(false);
        window.location.reload();
      }, 3000);
    } else if (investmentError) {
      setModalContent(`Investment failed: ${investmentError.message}`);
      setShowModal(true);
    }
  }, [investmentSuccess, investmentError]);

  const handleInvest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }

    const amount = Number(usdcAmount);
    if (amount < 1) {
      alert("The minimum investment amount is 1 USDC.");
      return;
    }

    try {
      const txHash = await increaseAllowance(amount);
      setAllowanceTxHash(txHash as `0x${string}`);
      setModalContent(
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoaderIcon />
          <p className="text-sm text-center">
            Processing USDC approval tx... Please wait...
          </p>
        </div>
      );
      setShowModal(true);
    } catch (error) {
      console.error("Allowance transaction failed:", error);
      alert(`Allowance transaction failed: ${error}`);
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <form onSubmit={handleInvest} className="space-y-4">
        <input
          type="number"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(e.target.value)}
          placeholder="Enter USDC amount"
          min="1"
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isApproving || isInvesting}
          className={`w-full px-4 py-2 text-white font-bold rounded-md ${
            isApproving || isInvesting
              ? "bg-gray-500"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isApproving || isInvesting ? "Processing..." : "Invest"}
        </button>
      </form>
      {error && <p className="mt-2 text-red-500">{error}</p>}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        {modalContent}
      </Modal>
    </div>
  );
};
