/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEthereum } from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import {
  buyToken,
  getEthSurplus,
  getFactoryCap,
  sellToken,
} from "@/lib/factory";
import {
  fetchTokenBuysAndSells,
  getEtherBalance,
  getTokenBalance,
} from "@/lib/fetch";
import CandlestickChart from "./chart";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa";
import { getData } from "@/lib/mongodb";
import {
  fetchEthPriceFromOracle,
  formatLargeNumber,
  formatPrice,
} from "@/lib/utils";
import { Progress } from "./ui/progress";
import { LoadingLines } from "./loading-rows";
import Image from "next/image";
import { TokenCard } from "./token-card";
import { FaFire } from "react-icons/fa";
import Confetti from "react-confetti";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import TableRowZero from "./ui/tablerowzero";
import { HolderDistribution } from "./ui/holder-distribution";
import { ArrowUpIcon, CopyIcon, GlobeIcon, LoadingSpinner } from "./utils";
import { TokenHeader } from "./token-header";
import { BuySellCard } from "./buy-sell";
import { TokenStatsCard } from "./token-stats";
import { TransactionsTable } from "./transaction-table";
import { ChatCard } from "./chat";

export function TokenPage({ tokenData }) {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [needUpdate, setNeedUpdate] = useState(false);
  const [tokenEthSurplus, setTokenEthSurplus] = useState(0);
  const [tokenEthCap, setTokenEthCap] = useState(0);
  const [isBuySelected, setIsBuySelected] = useState(true);

  const {
    name,
    symbol,
    description,
    imageUrl,
    twitterLink,
    telegramLink,
    websiteLink,
    tokenAddress,
  } = tokenData;

  async function getEthPrice() {
    return await fetchEthPriceFromOracle();
  }

  const fetchBalances = async (tokenAddress) => {
    try {
      const fetchedTokenBalance = await getTokenBalance(tokenAddress); // Fetch token balance
      const fetchedEthBalance = await getEtherBalance(); // Fetch Ethereum balance

      setTokenBalance(fetchedTokenBalance);
      setEthBalance(fetchedEthBalance);
    } catch (error) {
      console.error("Failed to fetch balances", error);
    }
  };

  const transactionZero = {
    timestamp: tokenData.timestamp || "0",
    eventType: "Create",
    empty: 1,
    buyer:
      tokenData.tokenCreator || "0x0000000000000000000000000000000000000000", //[TODO]not available if not created from the platform
    pricePerToken: 0.000000001,
    ethPriceAtTime: tokenData.ethPriceAtTime || getEthPrice(),
  };

  const fetchTransactionsFromDb = async (tokenAddress) => {
    try {
      console.log("Database transactions");
      const dbData = await getData(
        "TokenTransaction",
        "find",
        { tokenAddress: tokenAddress },
        {
          sort: { timestamp: -1 },
        }
      );

      const dbTrasactions = dbData.result || [];
      if (dbTrasactions.length > 0) {
        console.log("Database transactions", dbTrasactions);
        setTransactions(dbTrasactions);
      }
    } catch (err) {
      console.error(
        "Error fetching recent tokens or events from database:",
        err
      );
    } finally {
      setNeedUpdate(false);
    }
  };

  useEffect(() => {
    console.log("Database transactions call");
    fetchTransactionsFromDb(tokenAddress);
  }, [tokenAddress]);

  useEffect(() => {
    async function fetchTransactionsFromBlockchain() {
      try {
        const fetchedTransactions = await fetchTokenBuysAndSells(tokenAddress);
        console.log("Fetched transactions", fetchedTransactions);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setNeedUpdate(true);
      }
    }
    fetchTransactionsFromBlockchain();
  }, [tokenAddress]);

  // Fetch balances when component mounts
  useEffect(() => {
    fetchBalances(tokenAddress);
  }, [tokenAddress]);

  // Fetch token ETH surplus and ETH cap
  useEffect(() => {
    async function fetchEthData() {
      try {
        const surplus = await getEthSurplus(tokenAddress); // Fetch surplus as a BigInt
        const cap = await getFactoryCap(); // Fetch cap as a BigInt

        // Divide both by 10**18 to get ETH values
        setTokenEthSurplus(Number(surplus) / 10 ** 18);
        setTokenEthCap(Number(cap) / 10 ** 18);
      } catch (error) {
        console.error("Failed to fetch ETH surplus or cap:", error);
      }
    }

    fetchEthData();
  }, [tokenAddress]);

  const jailbreakPercentage =
    tokenEthCap > 0
      ? Number(((tokenEthSurplus / tokenEthCap) * 100).toFixed(2))
      : 0;

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (jailbreakPercentage >= 100) {
      setShowConfetti(true);
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [jailbreakPercentage]);

  const displayedImageUrl =
    `https://gateway.pinata.cloud/ipfs/${imageUrl}` ||
    "https://gateway.pinata.cloud/ipfs/Qme2CbcqAQ2kob78MLFWve7inyaKq5tPDU2LKqBnC1W6Fo";
  const handleBuyToken = async () => {
    // Validate required fields
    if (!amount || amount <= 0) {
      toast.error("Insert a valid amount.");
      return;
    }

    try {
      // Call buyToken function and wait for it to complete
      await buyToken(amount, tokenAddress);

      // Fetch updated balances after the buy operation is complete
      await fetchBalances(tokenAddress);
      await fetchTransactionsFromDb(tokenAddress);

      toast.success("Token purchase successful!");
    } catch (error) {
      console.error("Error buying token:", error);
      toast.error("Failed to buy tokens.");
    }
  };

  const handleSellToken = async () => {
    // Validate required fields
    if (!amount || amount <= 1) {
      toast.error("Insert a valid amount.");
      return;
    }

    try {
      // Call sellToken function and wait for it to complete
      await sellToken(amount, tokenAddress);

      // Fetch updated balances after the sell operation is complete
      await fetchBalances(tokenAddress);
      await fetchTransactionsFromDb(tokenAddress);

      toast.success("Token sale successful!");
    } catch (error) {
      console.error("Error selling token:", error);
      toast.error("Failed to sell tokens.");
    }
  };

  // Handler to set the max token balance to the input field
  const handleMaxToken = () => {
    setAmount(String(Math.floor(Number(tokenBalance)))); // Rounds down to the nearest integer
  };

  // Handler to set the max ETH balance to the input field
  const handleMaxEth = () => {
    const ethAmount = Math.floor(Number(ethBalance) * 10000) / 10000; // Rounds down to 4 decimal places
    setAmount(String(ethAmount));
  };

  // Format the token address for display (e.g., "0x1234...5678")
  const formattedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(
    -4
  )}`;

  // 1D Volume calculations
  // Get the current time and subtract 24 hours (in milliseconds)
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Filter transactions that occurred within the last day
  const lastDayTransactions = transactions.filter(
    (tx) => new Date(tx.timestamp).getTime() > oneDayAgo
  );

  // Sum up the ethSpent and ethReceived, each multiplied by ethPriceAtTime in the last day
  const totalEthVolumeInUsd = lastDayTransactions
    .reduce((sum, tx) => {
      const ethValueSpent = tx.ethSpent
        ? (Number(tx.ethSpent) / 10 ** 18) * tx.ethPriceAtTime
        : 0;
      const ethValueReceived = tx.ethReceived
        ? (Number(tx.ethReceived) / 10 ** 18) * tx.ethPriceAtTime
        : 0;
      return sum + ethValueSpent + ethValueReceived;
    }, 0)
    .toFixed(2); // Keeping it to 2 decimal places for USD

  const refreshData = async () => {
    await fetchBalances(tokenAddress);
    await fetchTransactionsFromDb(tokenAddress);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {showConfetti && (
        <Confetti
          width={(window.innerWidth / 100) * 99}
          height={(window.innerHeight / 100) * 99}
        />
      )}
      <div>
        <TokenHeader
          name={name}
          symbol={symbol}
          description={description}
          displayedImageUrl={displayedImageUrl}
          twitterLink={twitterLink}
          telegramLink={telegramLink}
          websiteLink={websiteLink}
          tokenAddress={tokenAddress}
        />

        <div className="mb-6 mt-6">
          {transactions.length == 0 ? (
            <Card>
              <CardContent>
                <div className="w-full h-[453px]">
                  <LoadingSpinner />
                </div>
              </CardContent>
            </Card>
          ) : (
            <CandlestickChart transactions={transactions} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 h-full">
        <BuySellCard
          isBuySelected={isBuySelected}
          setIsBuySelected={setIsBuySelected}
          tokenBalance={tokenBalance}
          ethBalance={ethBalance}
          symbol={symbol}
          tokenAddress={tokenAddress}
          refreshData={refreshData} // Pass the refreshData function
        />
        <TokenStatsCard
          transactions={transactions}
          lastDayTransactions={lastDayTransactions}
          jailbreakPercentage={jailbreakPercentage}
          tokenEthCap={tokenEthCap}
          totalEthVolumeInUsd={totalEthVolumeInUsd}
          symbol={symbol}
        />
      </div>

      {/* Holder Distribution */}
      <div className="col-span-full mb-6">
        <HolderDistribution transactions={transactions} />
      </div>

      <div className="col-span-full">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable
              transactions={transactions}
              symbol={symbol}
              transactionZero={transactionZero}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      {/* <div className="col-span-full lg:col-span-1 flex flex-col gap-8">
        <ChatCard />
      </div> */}
    </div>
  );
}
