"use client";

import { useRouter, usePathname } from "next/navigation";
import { TokenPage } from "@/components/token-page";
import { useEffect, useState } from "react";
import { LoadingLines } from "@/components/LoadingRows";

export default function TokenDetail() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const address = pathname.split("/")[1];

  useEffect(() => {
    if (address) {
      async function fetchTokenData() {
        try {
          // Simulate fetching token details
          const data = await fetchTokenDetails(address);
          setTokenData(data);
        } catch (err) {
          setError("Failed to fetch token data");
        } finally {
          setLoading(false);
        }
      }

      fetchTokenData();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="mt-20">
        <LoadingLines />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!tokenData) {
    return <div>No token data available</div>;
  }

  return <TokenPage tokenData={tokenData} />;
}

// Mock function to simulate fetching token details
async function fetchTokenDetails(address) {
  // Replace this with actual smart contract interaction
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        address,
        name: "Sample Token",
        symbol: "STK",
        totalSupply: 1000000,
        // Add more token properties as needed
      });
    }, 1000); // Simulate network delay
  });
}
