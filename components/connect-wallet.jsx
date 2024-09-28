"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers"; // Import ethers correctly
import { Button } from "./ui/button";
import Image from "next/image";

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Load account from localStorage on component mount
  useEffect(() => {
    const savedAccount = localStorage.getItem("connectedAccount");
    if (savedAccount) {
      setAccount(savedAccount);
    }

    if (typeof window.ethereum !== "undefined") {
      // Detect the current chain and set it
      window.ethereum.request({ method: "eth_chainId" }).then((chain) => {
        setChainId(parseInt(chain, 16)); // Parse chainId to decimal
      });

      // Listen for chain changes and update the chain ID
      window.ethereum.on("chainChanged", (newChainId) => {
        setChainId(parseInt(newChainId, 16)); // Parse chainId to decimal
      });
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

        // Get the chain ID and set it
        const network = await provider.getNetwork();
        setChainId(network.chainId);
      } catch (error) {
        console.error("User rejected account access", error);
      }
    } else {
      // console.log("Ethereum object doesn't exist!");
    }
  };

  const shortenAddress = (tokenAddress) => {
    if (!tokenAddress) return "";
    return tokenAddress.slice(0, 6) + "..." + tokenAddress.slice(-4);
  };

  // Function to get the appropriate chain icon based on the chain ID
  const getChainIcon = () => {
    switch (chainId) {
      case 1: // Ethereum mainnet (decimal)
        return "/ethereum.png";
      case 8453: // Base mainnet (decimal)
        return "/base.png";
      default:
        return null; // No icon for unsupported networks
    }
  };

  const chainIcon = getChainIcon(); // Get the chain icon based on the chain ID

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        className="sm:inline-flex hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={connectWallet}
      >
        {/* Only show the chain icon if it's Ethereum or Base */}
        {account && chainIcon && (
          <Image
            src={chainIcon}
            alt="Chain Icon"
            width={20}
            height={20}
            className="mr-2" // Adds spacing between the icon and the address
          />
        )}

        {account ? shortenAddress(account) : "Connect Wallet"}
      </Button>
    </div>
  );
};

export default ConnectWallet;
