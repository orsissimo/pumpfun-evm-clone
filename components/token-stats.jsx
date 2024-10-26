// TokenStatsCard.js
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "./ui/progress";
import { FaDollarSign, FaFire } from "react-icons/fa";
import { BsFire } from "react-icons/bs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { formatLargeNumber } from "@/lib/utils";
import { useEffect } from "react";
import { getData } from "@/lib/mongodb";

export function TokenStatsCard({
  transactions,
  lastDayTransactions,
  jailbreakPercentage,
  tokenEthCap,
  totalEthVolumeInUsd,
  symbol,
}) {
  const jailbreak = jailbreakPercentage || 0;
  const marketCap =
    formatLargeNumber(
      tokenEthCap * 10 ** 9 * transactions[0]?.ethPriceAtTime
    ) || 0;
  const dayVolume = totalEthVolumeInUsd || 0;

  // Function to update jailbreak, marketCap, and dayVolume in the database
  const updateTokenStatsInDb = async (
    tokenAddress,
    jailbreak,
    marketCap,
    dayVolume
  ) => {
    try {
      const updateResult = await getData(
        "Token",
        "findOneAndUpdate",
        { tokenAddress: tokenAddress },
        {
          jailbreak: jailbreak,
          marketCap: marketCap,
          dayVolume: dayVolume,
        }
      );
      if (updateResult.success) {
        console.log("Token stats updated successfully:", updateResult.result);
      } else {
        console.error("Failed to update token stats:", updateResult.error);
      }
    } catch (error) {
      console.error("Error updating token stats in database:", error);
    }
  };

  useEffect(() => {
    if (tokenEthCap > 0) {
      updateTokenStatsInDb(
        transactions[0]?.tokenAddress,

        jailbreakPercentage,
        formatLargeNumber(
          tokenEthCap * 10 ** 9 * transactions[0].ethPriceAtTime
        ), // calculated marketCap
        totalEthVolumeInUsd // dayVolume in USD
      );
    }
  }, [jailbreakPercentage, tokenEthCap, totalEthVolumeInUsd, transactions]);

  return (
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
            <div className="text-muted-foreground flex items-center">
              <span>Jailbreak</span>
              {jailbreakPercentage >= 100 && (
                <BsFire className="ml-1 text-red-500 h-5 w-5" />
              )}
            </div>
            <div className="font-bold mb-3">
              {tokenEthCap > 0 ? (
                <div className="flex justify-between items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center cursor-pointer">
                        <span className="flex items-center">
                          {jailbreakPercentage}%
                        </span>
                      </div>
                    </TooltipTrigger>
                    {jailbreakPercentage >= 100 && (
                      <TooltipContent className="max-w-xs bg-background text-foreground shadow-lg rounded-md p-3">
                        <p>LP Burned</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
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
  );
}
