// BuySellCard.js

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "./utils";
import { toast } from "react-toastify";
import { buyToken, sellToken } from "@/lib/factory";

export function BuySellCard({
  isBuySelected,
  setIsBuySelected,
  tokenBalance,
  ethBalance,
  symbol,
  tokenAddress,
  refreshData, // Function to refresh data in TokenPage
}) {
  const [amount, setAmount] = useState(0);

  // Handler to set the max token balance to the input field
  const handleMaxToken = () => {
    setAmount(String(Math.floor(Number(tokenBalance))));
  };

  // Handler to set the max ETH balance to the input field
  const handleMaxEth = () => {
    const ethAmount = Math.floor(Number(ethBalance) * 10000) / 10000;
    setAmount(String(ethAmount));
  };

  const handleBuyToken = async () => {
    // Validate required fields
    if (!amount || amount <= 0) {
      toast.error("Insert a valid amount.");
      return;
    }

    try {
      // Call buyToken function and wait for it to complete
      await buyToken(amount, tokenAddress);

      // Notify TokenPage to refresh data
      if (refreshData) {
        await refreshData();
      }

      toast.success("Token purchase successful!");
    } catch (error) {
      console.error("Error buying token:", error);
      toast.error("Failed to buy tokens.");
    }
  };

  const handleSellToken = async () => {
    // Validate required fields
    if (!amount || amount <= 0) {
      toast.error("Insert a valid amount.");
      return;
    }

    try {
      // Call sellToken function and wait for it to complete
      await sellToken(amount, tokenAddress);

      // Notify TokenPage to refresh data
      if (refreshData) {
        await refreshData();
      }

      toast.success("Token sale successful!");
    } catch (error) {
      console.error("Error selling token:", error);
      toast.error("Failed to sell tokens.");
    }
  };

  return (
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
                  <Button variant="ghost" size="icon" onClick={handleMaxEth}>
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
                  <Button variant="ghost" size="icon" onClick={handleMaxToken}>
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
              onClick={() => {
                if (isBuySelected) {
                  handleBuyToken();
                } else {
                  handleSellToken();
                }
              }}
            >
              {isBuySelected ? "Execute Buy" : "Execute Sell"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
