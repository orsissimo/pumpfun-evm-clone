"use client";

import { useState, useEffect } from "react";
import { TokenCard } from "@/components/token-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fetchCreateTokenEvents } from "@/lib/fetch"; // Import the function
import { LoadingLines } from "@/components/loading-rows"; // Import the loading component
import { getData } from "@/lib/mongodb";
import { Hero } from "@/components/hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaXTwitter,
  FaWandMagicSparkles,
  FaHatWizard,
  FaChartSimple,
} from "react-icons/fa6";
import { GiMagicLamp, GiMagicHat, GiBoltSpellCast } from "react-icons/gi";
import Link from "next/link";
import { fetchEthPriceFromOracle } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needUpdate, setNeedUpdate] = useState(false);

  useEffect(() => {
    async function fetch() {
      let data = await fetchEthPriceFromOracle();

      console.log(data);
    }
    fetch();
  }, []);

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
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.tokenAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log(filteredTokens);

  return (
    <div className="container mx-auto px-8 pt-10 pb-16">
      {filteredTokens.length <= 0 && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
            No token found
          </h1>
          <p className="mt-4 text-center">
            We&apos;re unable to retrieve any information about deployed tokens
            at this time.
          </p>
        </div>
      )}

      {/* Display loading indicator if data is still being fetched */}
      {loading ? (
        <div className="mt-20">
          <LoadingLines />
        </div>
      ) : (
        <>
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4 justify-items-center"> */}
          {filteredTokens.length > 0 &&
            filteredTokens
              .filter(
                (token) =>
                  token.tokenAddress ===
                  "0x46EBBB7607C01D633EE2B0442126ede331bf9E42" // Latest jailbreak - must implement an automated function
              )
              .map((token, index) => (
                <>
                  <div key={index} className="mb-10 hidden md:block">
                    {/* Pass all relevant token data to Hero */}
                    <Hero
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

                  <div className="space-y-6 md:hidden mb-8">
                    {/* Pass all relevant token data to TokenCard */}
                    <TokenCard
                      tokenAddress={token.tokenAddress}
                      name={token.name}
                      symbol={token.symbol}
                      description={token.description}
                      imageUrl={token.imageUrl}
                      twitterLink={token.twitterLink}
                      telegramLink={token.telegramLink}
                      websiteLink={token.websiteLink}
                    />

                    <div className="flex gap-4">
                      <Card className="bg-background rounded-xl overflow-hidden shadow-lg flex-1 p-4">
                        <h2 className="text-sm font-bold mb-2">
                          Token Deployer
                        </h2>
                        <Link href="/create">
                          <Button
                            className="w-full h-auto text-sm"
                            variant="outline"
                          >
                            <GiMagicHat className="mr-2 h-5 w-5" />
                            Create
                          </Button>
                        </Link>
                      </Card>

                      <Card className="bg-background rounded-xl overflow-hidden shadow-lg flex-1 p-4">
                        <h2 className="text-sm font-bold mb-2">Pump Stats</h2>
                        <Button
                          className="w-full h-auto text-sm"
                          variant="outline"
                        >
                          <FaChartSimple className="mr-2 h-5 w-5" />
                          Soon
                        </Button>
                      </Card>
                    </div>
                  </div>
                </>
              ))}
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-4 py-6 text-sm rounded-full shadow-lg"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            </div>
          </div>

          {/* </div> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4 justify-items-center">
            {filteredTokens.length > 0 &&
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
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function GlobeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
