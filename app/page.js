"use client";

import { useState, useEffect } from "react";
import { TokenCard } from "@/components/token-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fetchCreateTokenEvents } from "@/lib/fetch"; // Import the function
import { LoadingLines } from "@/components/loading-rows"; // Import the loading component

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent tokens and CreateToken events on component mount
  useEffect(() => {
    async function fetchTokens() {
      try {
        const fetchedTokens = await fetchCreateTokenEvents();
        //console.log(fetchedTokens);
        setTokens(fetchedTokens);
      } catch (err) {
        console.error("Error fetching recent tokens or events:", err);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    }
    fetchTokens();
  }, []);

  useEffect(() => {
    /* const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db-connection");
        const data = await response.json();
        console.log(
          "Database connection status:",
          data.isConnected ? "Connected" : "Disconnected"
        );
      } catch (error) {
        console.error("Error checking DB status:", error);
        console.log("Database connection status: Disconnected");
      }
    }; */

    // Function to perform dummy database operations
    const performDummyDbOperations = async () => {
      try {
        // Create a dummy object
        const createResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "TokenEvent",
            operation: "create",
            modelName: "TokenEvent",
            data: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
              name: "DummyToken",
              symbol: "DUMMY",
              initialSupply: "1000000",
              description: "A dummy token for testing",
            },
          }),
        });
        const createResult = await createResponse.json();
        console.log("Created dummy object:", createResult);

        // Read the created object
        const readResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "TokenEvent",
            operation: "findOne",
            modelName: "TokenEvent",
            criteria: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
            },
          }),
        });
        const readResult = await readResponse.json();
        console.log("Read dummy object:", readResult);

        // Update the object with random values
        const updateResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "TokenEvent",
            operation: "findOneAndUpdate",
            modelName: "TokenEvent",
            criteria: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
            },
            data: {
              name: `UpdatedToken${Math.floor(Math.random() * 1000)}`,
              initialSupply: (
                Math.floor(Math.random() * 1000000) + 1000000
              ).toString(),
            },
          }),
        });
        const updateResult = await updateResponse.json();
        console.log("Updated dummy object:", updateResult);

        // Delete the object
        const deleteResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "TokenEvent",
            operation: "findOneAndDelete",
            modelName: "TokenEvent",
            criteria: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
            },
          }),
        });
        const deleteResult = await deleteResponse.json();
        console.log("Deleted dummy object:", deleteResult);
      } catch (error) {
        console.error("Error performing dummy DB operations:", error);
      }
    };
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
