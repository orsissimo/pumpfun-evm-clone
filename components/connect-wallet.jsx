"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers"; // Import ethers correctly
import { Button } from "./ui/button";

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);

  // Load account from localStorage on component mount
  useEffect(() => {
    const savedAccount = localStorage.getItem("connectedAccount");
    if (savedAccount) {
      setAccount(savedAccount);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // Correct usage of ethers.providers
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        setAccount(signerAddress);

        // Save the connected account in localStorage
        localStorage.setItem("connectedAccount", signerAddress);
      } catch (error) {
        console.error("User rejected account access", error);
      }
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  /* const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("connectedAccount");
  }; */

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        className="sm:inline-flex hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={/* account ? disconnectWallet :  */ connectWallet}
      >
        {account ? shortenAddress(account) : "Connect Wallet"}
      </Button>
    </div>
  );
};

export default ConnectWallet;
