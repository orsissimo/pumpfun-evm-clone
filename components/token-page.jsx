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
import { formatLargeNumber, formatPrice } from "@/lib/utils";
import { Progress } from "./ui/progress";
import { LoadingLines } from "./loading-rows";
import Image from "next/image";

export function TokenPage({ tokenData }) {
  const [amount, setAmount] = useState(0);
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

  useEffect(() => {
    console.log("Database transactions call");
    async function fetchTransactionsFromDb() {
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
    }
    fetchTransactionsFromDb();
  }, [needUpdate, tokenAddress]);

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
    const fetchBalances = async () => {
      try {
        const fetchedTokenBalance = await getTokenBalance(tokenAddress); // Fetch token balance
        const fetchedEthBalance = await getEtherBalance(); // Fetch Ethereum balance

        setTokenBalance(fetchedTokenBalance);
        setEthBalance(fetchedEthBalance);
      } catch (error) {
        console.error("Failed to fetch balances", error);
      }
    };

    fetchBalances();
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
    tokenEthCap > 0 ? ((tokenEthSurplus / tokenEthCap) * 100).toFixed(2) : 0;

  const displayedImageUrl =
    `https://gateway.pinata.cloud/ipfs/${imageUrl}` ||
    "https://gateway.pinata.cloud/ipfs/Qme2CbcqAQ2kob78MLFWve7inyaKq5tPDU2LKqBnC1W6Fo";

  const handleBuyToken = () => {
    // Validate required fields
    if (!amount || amount <= 0) {
      toast.error("Insert a valid amount.");
      return;
    }
    // Call createToken function from your factory
    buyToken(amount, tokenAddress);
  };

  const handleSellToken = () => {
    // Validate required fields
    if (!amount || amount <= 1) {
      toast.error("Insert a valid amount.");
      return;
    }
    // Call createToken function from your factory
    sellToken(amount, tokenAddress);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <div className="flex flex-col md:flex-row w-full max-w-3xl mx-auto gap-6">
          {/* Left Column - Image */}
          <div className="flex-shrink-0">
            <Image
              src={displayedImageUrl}
              width={180}
              height={180}
              alt={`${name} Logo`}
              className="rounded-3xl"
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
            />
          </div>

          {/* Right Column - Text content */}
          <div className="flex-grow flex flex-col min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold truncate">{name}</h1>
                <div className="text-2xl font-bold text-muted-foreground">
                  ({symbol})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  className="text-sm text-blue-500 hover:underline truncate"
                  href={`https://etherscan.io/address/${tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                >
                  {formattedAddress}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(tokenAddress);
                    toast("Token address copied to clipboard");
                  }}
                >
                  <CopyIcon className="w-5 h-5 text-blue-500" />
                  <span className="sr-only">Copy token address</span>
                </Button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 break-words overflow-y-auto h-24 scrollbar-hide">
                {description ||
                  `${name} is a decentralized cryptocurrency that powers an ecosystem.`}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-auto">
              {websiteLink && (
                <Link
                  href={websiteLink}
                  className="text-muted-foreground hover:text-blue-500 transition"
                  prefetch={false}
                >
                  <GlobeIcon className="h-5 w-5" />
                </Link>
              )}
              {twitterLink && (
                <Link
                  href={twitterLink}
                  className="text-muted-foreground hover:text-blue-500 transition"
                  prefetch={false}
                >
                  <FaXTwitter className="h-5 w-5" />
                </Link>
              )}
              {telegramLink && (
                <Link
                  href={telegramLink}
                  className="text-muted-foreground hover:text-blue-500 transition"
                  prefetch={false}
                >
                  <FaTelegramPlane className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

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
        <Card className="flex flex-col h-[375px] w-full">
          <CardHeader className="border-b">
            <CardTitle>
              <div className="flex gap-4 w-full">
                {/* Buy and Sell Switcher */}
                <Button
                  className={`flex-1 ${
                    isBuySelected
                      ? "bg-[#33CC90] hover:bg-[#33CC90]"
                      : "bg-secondary hover:bg-muted text-white"
                  }`}
                  onClick={() => setIsBuySelected(true)}
                >
                  Buy
                </Button>
                <Button
                  className={`flex-1 ${
                    !isBuySelected
                      ? "bg-[#FF007A] hover:bg-[#FF007A] text-white"
                      : "bg-secondary hover:bg-muted text-white"
                  }`}
                  onClick={() => setIsBuySelected(false)}
                >
                  Sell
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden w-full">
            <div className="h-full scrollbar-hide">
              <div className="grid gap-4 py-4">
                {/* Conditionally display ETH amount input if Buy is selected */}
                {isBuySelected && (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="amount"
                      className="flex justify-between items-center"
                    >
                      <span>Amount</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter ETH amount"
                      className="mt-1 block w-full placeholder:opacity-20 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <Label htmlFor="eth-balance">ETH Balance</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleMaxEth}
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                        <span className="sr-only">Use max</span>
                      </Button>
                    </div>
                    <div className="font-bold">
                      {Number(Number(ethBalance).toFixed(4))
                        .toLocaleString("en-US")
                        .replace(/,/g, "'")}{" "}
                      ETH
                    </div>
                  </div>
                )}

                {/* Conditionally display Token amount input if Sell is selected */}
                {!isBuySelected && (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="amount"
                      className="flex justify-between items-center"
                    >
                      <span>Amount</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={`Enter ${symbol} amount`}
                      className="mt-1 block w-full placeholder:opacity-20 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <Label htmlFor="balance">{symbol} Balance</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleMaxToken}
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                        <span className="sr-only">Use max</span>
                      </Button>
                    </div>
                    <div className="font-bold">
                      {Number(Number(tokenBalance).toFixed(2))
                        .toLocaleString("en-US")
                        .replace(/,/g, "'")}{" "}
                      {symbol}
                    </div>
                  </div>
                )}

                {/* Execute Button */}
                <Button
                  className={`w-full mt-4 ${
                    isBuySelected
                      ? "bg-[#33CC90] hover:bg-[#33cc8fbc]"
                      : "bg-[#FF007A] hover:bg-[#ff007bc0] text-white"
                  }`}
                  onClick={isBuySelected ? handleBuyToken : handleSellToken}
                >
                  {isBuySelected ? "Execute Buy" : "Execute Sell"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[275px]">
          <CardHeader className="border-b">
            <CardTitle>Token Stats</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full scrollbar-hide pr-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <div className="text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <span>Market Cap</span>
                    </div>
                  </div>
                  <div className="font-bold">
                    {transactions.length > 0
                      ? formatLargeNumber(
                          (transactions[0].pricePerToken / 10 ** 18) *
                            10 ** 9 *
                            transactions[0].ethPriceAtTime
                        )
                      : "-"}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">1D Volume</div>
                  <div className="font-bold">
                    {lastDayTransactions.length > 0
                      ? formatLargeNumber(totalEthVolumeInUsd)
                      : "-"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Jailbreak</div>
                <div className="font-bold mb-3">
                  {tokenEthCap > 0 ? (
                    <div className="flex justify-between">
                      <span>{jailbreakPercentage}%</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
                <Progress value={jailbreakPercentage} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-full">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>{symbol}</TableHead>
                  <TableHead>For</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Price in</span> <FaDollarSign className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Wallet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length == 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex items-center h-full">
                        {/* <LoadingSpinner /> */}
                        No transactions found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    ) // Sort by timestamp descending
                    .map((tx, index) => (
                      <TableRow key={index}>
                        {/* Render transaction rows */}
                        <TableCell>
                          {new Date(tx.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={
                            tx.eventType === "TokenPurchased"
                              ? "text-[#33CC90]"
                              : tx.eventType === "TokenSold"
                              ? "text-[#FF007A]"
                              : "text-gray-500" // For "Create" and other unspecified events
                          }
                        >
                          {tx.eventType === "TokenPurchased"
                            ? "Buy"
                            : tx.eventType === "TokenSold"
                            ? "Sell"
                            : "Create"}{" "}
                          {/* Display "Create" for the Create event */}
                        </TableCell>

                        <TableCell>
                          {Number(
                            Number(
                              Number(tx.tokensBought || tx.tokensSold) /
                                10 ** 18
                            ).toFixed(4)
                          )
                            .toLocaleString("en-US")
                            .replace(/,/g, "'")}{" "}
                        </TableCell>
                        <TableCell>
                          {(
                            Number(tx.ethSpent || tx.ethReceived) /
                            10 ** 18
                          ).toFixed(6)}{" "}
                          ETH
                        </TableCell>
                        <TableCell>
                          <span>
                            0.0
                            <span className="text-xs align-sub">
                              {
                                formatPrice(
                                  (tx.pricePerToken * tx.ethPriceAtTime) /
                                    10 ** 18
                                ).leadingZeros
                              }
                            </span>
                            {
                              formatPrice(
                                (tx.pricePerToken * tx.ethPriceAtTime) /
                                  10 ** 18
                              ).remainingFraction
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://etherscan.io/address/${
                              tx.buyer || tx.seller
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="!text-blue-500 hover:underline"
                          >
                            {`${(tx.buyer || tx.seller).slice(0, 6)}...${(
                              tx.buyer || tx.seller
                            ).slice(-4)}`}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>No transactions found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      {/* <div className="col-span-full lg:col-span-1 flex flex-col gap-8">
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="flex flex-col gap-2">
                {[...Array(10)].map((_, index) => (
                  <div key={`message-${index}`}>
                    <div
                      key={`other-${index}`}
                      className="flex items-start gap-4 mt-4"
                    >
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40`}
                          alt="User Avatar"
                        />
                        <AvatarFallback>U{index + 1}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1 text-sm">
                        <div className="font-medium">User {index + 1}</div>
                        <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%]">
                          This is a message from User {index + 1}.
                        </div>
                      </div>
                    </div>
                    <div
                      key={`you-${index}`}
                      className="flex items-start gap-4 justify-end"
                    >
                      <div className="grid gap-1 text-sm">
                        <div className="font-medium text-right">You</div>
                        <div className="bg-primary px-3 py-2 rounded-lg max-w-[80%] text-primary-foreground ml-auto">
                          This is your response to User {index + 1}.
                        </div>
                      </div>
                      <Avatar>
                        <AvatarImage
                          src="/placeholder.svg?height=40&width=40"
                          alt="Your Avatar"
                        />
                        <AvatarFallback>YO</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <div className="relative w-full mt-4">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16 scrollbar-hide"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute w-8 h-8 top-3 right-3"
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div> */}

      {/* Holder Distribution */}
      {/* <div className="col-span-full lg:col-span-1 flex flex-col gap-8">
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <CardTitle>Holder Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="grid gap-2">
                {[...Array(20)].map((_, index) => (
                  <div
                    key={`holder-${index}`}
                    className="flex items-center justify-between mt-4"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full bg-${
                          ["primary", "secondary", "muted", "accent", "card"][
                            index % 5
                          ]
                        }`}
                      />
                      <div>
                        <div className="font-medium">Holder {index + 1}</div>
                        <div className="text-muted-foreground text-sm">
                          {(20 - index).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

function ArrowUpIcon(props) {
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
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
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

function CopyIcon(props) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <svg
        className="animate-spin h-8 w-8 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
    </div>
  );
}
