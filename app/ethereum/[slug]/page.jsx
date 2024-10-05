"use client";

import { useRouter, usePathname } from "next/navigation";
import { TokenPage } from "@/components/token-page";
import { useEffect, useState } from "react";
import { LoadingLines } from "@/components/ui/loading-rows";
import { fetchCreateTokenEvents } from "@/lib/fetch"; // Import the modified function
import { getData } from "@/lib/mongodb";

export default function TokenDetail() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const pathParts = pathname.split("/");
  // Extract chain and token address from the URL
  const chain = pathParts[1];
  console.log("Chain:", chain);
  console.log(tokenData);
  const tokenAddress = pathParts[2];
  const [needUpdate, setNeedUpdate] = useState(false);

  async function fetchTokensFromBlockchain(tokenAddress) {
    try {
      const data = await fetchCreateTokenEvents(tokenAddress);
      if (!data) {
        setError("No token found for this address.");
      } else {
        setTokenData(data);
      }
    } catch (err) {
      console.error(
        "Error fetching recent tokens or events from the Blockchain:",
        err
      );
      setError("Failed to fetch token data from the blockchain.");
    }
  }

  useEffect(() => {
    async function fetchTokenFromDb() {
      try {
        const dbData = await getData("Token", "find", { tokenAddress });
        const dbTokens = dbData.result || [];
        if (dbTokens.length > 0) {
          setTokenData(dbTokens[0]);
        } else {
          // If no token in DB, fetch from blockchain
          await fetchTokensFromBlockchain(tokenAddress);
        }
      } catch (err) {
        console.error("Error fetching tokens from the database:", err);
        setError("Failed to fetch token data from the database.");
      } finally {
        setLoading(false);
      }
    }

    fetchTokenFromDb();
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="mt-20">
        <LoadingLines />
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="container mx-auto px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
            No token found
          </h1>
          <p className="mt-4 text-center">
            We&apos;re unable to retrieve any information for{" "}
            <span className="font-semibold">{tokenAddress}</span> on{" "}
            <span className="font-semibold">{chain}</span> at this time.
          </p>
        </div>
      </div>
    );
  }

  return <TokenPage tokenData={tokenData} />;
}
