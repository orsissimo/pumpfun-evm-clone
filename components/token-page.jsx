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
import { buyToken, sellToken } from "@/lib/factory";
import {
  fetchTokenBuysAndSells,
  getEtherBalance,
  getTokenBalance,
} from "@/lib/fetch";
import CandlestickChart from "./chart";

export function TokenPage({ tokenData }) {
  const [amount, setAmount] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const {
    name,
    symbol,
    description,
    imageUrl,
    twitterLink,
    telegramLink,
    websiteLink,
    address,
  } = tokenData;

  //console.log(tokenData);

  const handleBuyToken = () => {
    // Validate required fields
    if (!amount || amount <= 0) {
      toast.error("Insert a valid amount.");
      return;
    }
    // Call createToken function from your factory
    buyToken(amount, address);
  };

  const handleSellToken = () => {
    // Validate required fields
    if (!amount || amount <= 1) {
      toast.error("Insert a valid amount.");
      return;
    }
    // Call createToken function from your factory
    sellToken(amount, address);
  };

  // Fetch balances when component mounts
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const fetchedTokenBalance = await getTokenBalance(address); // Fetch token balance
        const fetchedEthBalance = await getEtherBalance(); // Fetch Ethereum balance

        setTokenBalance(fetchedTokenBalance);
        setEthBalance(fetchedEthBalance);
      } catch (error) {
        console.error("Failed to fetch balances", error);
      }
    };

    fetchBalances();
  }, [address]); // Run when tokenAddress changes

  // Handler to set the max token balance to the input field
  const handleMaxToken = () => {
    setAmount(Number(tokenBalance).toFixed(0));
  };

  // Handler to set the max ETH balance to the input field
  const handleMaxEth = () => {
    setAmount(Number(ethBalance).toFixed(4));
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const fetchedTransactions = await fetchTokenBuysAndSells(address); // Replace with your function to fetch transactions
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };

    fetchTransactions();
  }, [address]);

  // Format the token address for display (e.g., "0x1234...5678")
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div classname="">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={imageUrl || "/placeholder.svg"} // Use imageUrl if provided, otherwise use placeholder
            width={48}
            height={48}
            alt={`${name} Logo`}
            className="rounded-full"
            style={{ aspectRatio: "48/48", objectFit: "cover" }}
          />
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <div className="text-muted-foreground">${symbol}</div>
          </div>
        </div>
        <p className="text-muted-foreground mb-6 h-8 overflow-hidden scrollbar-hide max-w-prose">
          {description ||
            `${name} is a decentralized cryptocurrency that powers an ecosystem.`}
        </p>

        <div className="flex items-center justify-between mb-6">
          {/* Left side with icons */}
          <div className="flex items-center gap-4">
            {websiteLink && (
              <Link
                href={websiteLink}
                className="text-muted-foreground hover:text-primary transition"
                prefetch={false}
              >
                <GlobeIcon className="h-5 w-5" />
              </Link>
            )}
            {twitterLink && (
              <Link
                href={twitterLink}
                className="text-muted-foreground hover:text-primary transition"
                prefetch={false}
              >
                <TwitterIcon className="h-5 w-5" />
              </Link>
            )}
            {telegramLink && (
              <Link
                href={telegramLink}
                className="text-muted-foreground hover:text-primary transition"
                prefetch={false}
              >
                <TextIcon className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Right side with token address and copy button */}
          <div className="flex items-center gap-2">
            <Link
              className="text-sm text-muted-foreground cursor-pointer text-blue-500 hover:underline"
              href={`https://basescan.org/address/${address}`}
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
                navigator.clipboard.writeText(address);
                toast("Token address copied to clipboard!");
              }}
            >
              <CopyIcon className="w-5 h-5 text-blue-500" />
              <span className="sr-only">Copy token address</span>
            </Button>
          </div>
        </div>

        {/* <div className="h-[400px] bg-muted rounded-lg overflow-hidden">
          <div />
        </div> */}
        <CandlestickChart transactions={transactions} />
      </div>
      <div className="flex flex-col gap-8 h-full">
        <Card className="flex flex-col h-[400px]">
          <CardHeader className="border-b">
            <CardTitle>Buy / Sell</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    className="mt-1 block w-full placeholder:opacity-20 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
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
                    {/* Display fetched token balance */}
                    <div className="font-bold">
                      {Number(Number(tokenBalance).toFixed(2))
                        .toLocaleString("en-US")
                        .replace(/,/g, "'")}{" "}
                      {symbol}
                    </div>
                  </div>
                  <div className="grid gap-2">
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
                    {/* Display fetched ETH balance */}
                    <div className="font-bold">
                      {Number(Number(ethBalance).toFixed(4))
                        .toLocaleString("en-US")
                        .replace(/,/g, "'")}{" "}
                      ETH
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 w-full">
                  <Button className="flex-1" onClick={handleBuyToken}>
                    Buy
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleSellToken}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col h-[250px]">
          <CardHeader className="border-b">
            <CardTitle>Token Stats</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <div className="text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <span>Market Cap in</span>{" "}
                      <FaEthereum className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="font-bold">
                    {transactions.length > 0
                      ? (transactions[0].pricePerToken / 10 ** 18) * 1000000000
                      : 0}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Liquidity</div>
                  <div className="font-bold">$45.6M</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Jailbreak %</div>
                  <div className="font-bold">$78.9M</div>
                </div>
                <div>
                  <div className="text-muted-foreground">1D Volume</div>
                  <div className="font-bold">$1.2M</div>
                </div>
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
                      <span>Price in</span> <FaEthereum className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Wallet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((tx, index) => (
                    <TableRow key={index}>
                      {/* Time Column */}
                      <TableCell>
                        {new Date(tx.timestamp).toLocaleString()}
                      </TableCell>

                      {/* Event Type Column */}
                      <TableCell
                        className={
                          tx.eventType === "TokenPurchased"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {tx.eventType === "TokenPurchased" ? "Buy" : "Sell"}
                      </TableCell>

                      {/* Token Amount (Divided by 10^18) */}
                      <TableCell>
                        {(
                          Number(tx.tokensBought || tx.tokensSold) /
                          10 ** 18
                        ).toFixed(2)}
                      </TableCell>

                      {/* ETH Amount (Divided by 10^18) */}
                      <TableCell>
                        {(
                          Number(tx.ethSpent || tx.ethReceived) /
                          10 ** 18
                        ).toFixed(4)}{" "}
                        ETH
                      </TableCell>

                      {/* TOKEN/ETH Price */}
                      <TableCell>
                        {Number(tx.pricePerToken / 10 ** 18)}
                      </TableCell>

                      {/* Wallet Address (Formatted and Clickable) */}
                      <TableCell>
                        <a
                          href={`https://basescan.org/address/${
                            tx.buyer || tx.seller
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
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

      <div className="col-span-full lg:col-span-1 flex flex-col gap-8">
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
      </div>
      <div className="col-span-full lg:col-span-1 flex flex-col gap-8">
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
      </div>
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

function TextIcon(props) {
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
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}

function TwitterIcon(props) {
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
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
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
