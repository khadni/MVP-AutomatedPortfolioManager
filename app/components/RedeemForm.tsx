import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRedeem } from "../hooks/useRedeem";
import { Modal } from "./Modal";
import { useWaitForTransactionReceipt } from "wagmi";
import LoaderIcon from "../assets/LoaderIcon";

export const RedeemForm = () => {
  const { isConnected } = useAccount();
  const { redeem, isRedeeming, error } = useRedeem();
  const [percentage, setPercentage] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] =
    useState<React.ReactNode>("Processing...");

  const { isSuccess: txConfirmed, error: txConfirmError } =
    useWaitForTransactionReceipt({
      hash: txHash,
      query: {
        enabled: !!txHash,
      },
    });

  useEffect(() => {
    if (txConfirmed) {
      setModalContent("Redemption successful!");
      setTimeout(() => {
        setShowModal(false);
        window.location.reload();
      }, 3000);
    } else if (txConfirmError) {
      setModalContent(
        `Transaction failed on the blockchain: ${txConfirmError.message}`
      );
    }
  }, [txConfirmed, txConfirmError]);

  const handleRedeem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    try {
      const redeemTxHash = await redeem(Number(percentage));
      setTxHash(redeemTxHash as `0x${string}`);
      setModalContent(
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoaderIcon />
          <p className="text-sm text-center">
            Processing... Please wait for the transaction to settle...
          </p>
        </div>
      );
      setShowModal(true);
    } catch (error) {
      console.error("Redemption failed:", error);
      alert(`Redemption failed: ${error}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <form onSubmit={handleRedeem} className="space-y-4">
        <input
          type="number"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          placeholder="Enter percentage to redeem (e.g., 50 for 50%)"
          min="1"
          max="100"
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isRedeeming}
          className={`w-full px-4 py-2 text-white font-bold rounded-md ${
            isRedeeming ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isRedeeming ? "Processing..." : "Redeem"}
        </button>
      </form>
      {error && <p className="mt-2 text-red-500">{error}</p>}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        {modalContent}
      </Modal>
    </div>
  );
};
