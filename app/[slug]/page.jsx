"use client";

import { useRouter, usePathname } from "next/navigation";
import { TokenPage } from "@/components/token-page";
import { useEffect, useState } from "react";
import { LoadingLines } from "@/components/loading-rows";
import { fetchCreateTokenEvents } from "@/lib/fetch"; // Import the modified function

export default function TokenDetail() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const tokenAddress = pathname.split("/")[1]; // Extract token address from the URL

  useEffect(() => {
    async function fetchTokenData() {
      try {
        // Fetch token details based on the address
        const data = await fetchCreateTokenEvents(tokenAddress);

        // If no data found, handle it gracefully
        if (!data) {
          setError("No token found for this address.");
        } else {
          setTokenData(data);
        }
      } catch (err) {
        setError("Failed to fetch token data.");
      } finally {
        setLoading(false);
      }
    }

    fetchTokenData();
  }, [tokenAddress]);

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
