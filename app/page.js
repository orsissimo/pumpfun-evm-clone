"use client";

import { useState, useEffect } from "react";
import { TokenCard } from "@/components/token-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fetchCreateTokenEvents } from "@/lib/fetch"; // Import the function
import { LoadingLines } from "@/components/loading-rows"; // Import the loading component
import { getData } from "@/lib/mongodb";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needUpdate, setNeedUpdate] = useState(false);

  // Fetch recent tokens and CreateToken events on component mount
  useEffect(() => {
    async function fetchTokensFromDb() {
      try {
        //const fetchedTokens = await fetchCreateTokenEvents();
        //console.log(fetchedTokens);
        //setTokens(fetchedTokens);

        const dbData = await getData(
          "Token",
          "findAll",
          {},
          {
            sort: { timestamp: -1 },
          }
        );
        console.log(dbData);
        const dbTokens = dbData.result || [];
        if (dbTokens.length > 0) {
          console.log("Database tokens", dbTokens);
          setTokens(dbTokens);
        }
      } catch (err) {
        console.error(
          "Error fetching recent tokens or events from database:",
          err
        );
      } finally {
        setLoading(false);
        setNeedUpdate(false);
      }
    }
    fetchTokensFromDb();
  }, [needUpdate]);

  useEffect(() => {
    async function fetchTokensFromBlockchain() {
      try {
        const fetchedTokens = await fetchCreateTokenEvents();
        console.log(fetchedTokens);
      } catch (err) {
        console.error(
          "Error fetching recent tokens or events from the Blockchain:",
          err
        );
      } finally {
        setNeedUpdate(true);
      }
    }
    fetchTokensFromBlockchain();
  }, []);

  // Filter tokens based on the search query (name or symbol)
  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-8 py-16">
      <div className="mb-12 max-w-3xl mx-auto">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-4 py-6 text-lg rounded-full shadow-lg"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
          Latest Tokens
        </h1>
        <p className="mt-4 text-center">
          Explore the latest tokens deployed with our Factory.
        </p>
      </div>

      {/* Display loading indicator if data is still being fetched */}
      {loading ? (
        <div className="mt-20">
          <LoadingLines />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-10 justify-items-center">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token, index) => (
              <div key={index} className="w-full max-w-lg">
                {/* Pass all relevant token data to TokenCard */}
                <TokenCard
                  tokenAddress={token.tokenAddress} // Address of the token
                  name={token.name} // Name of the token
                  symbol={token.symbol} // Symbol (ticker) of the token
                  description={token.description} // Description of the token
                  imageUrl={token.imageUrl} // Image URL (from IPFS)
                  twitterLink={token.twitterLink} // Twitter link
                  telegramLink={token.telegramLink} // Telegram link
                  websiteLink={token.websiteLink} // Website link
                />
              </div>
            ))
          ) : (
            <p>No tokens found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
