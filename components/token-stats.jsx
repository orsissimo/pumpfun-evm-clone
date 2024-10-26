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
import { useEffect, useState } from "react";
import { getData } from "@/lib/mongodb";

export function TokenStatsCard({
  transactions,
  lastDayTransactions,
  jailbreakPercentage,
  tokenEthCap,
  totalEthVolumeInUsd,
  symbol,
}) {
  const calculatedMarketCap =
    formatLargeNumber(
      tokenEthCap * 10 ** 9 * transactions[0]?.ethPriceAtTime
    ) || 0;
  // State variables
  const [jailbreak, setJailbreak] = useState(jailbreakPercentage || 0);
  const [marketCap, setMarketCap] = useState(calculatedMarketCap);
  const [dayVolume, setDayVolume] = useState(totalEthVolumeInUsd || 0);

  useEffect(() => {
    // Function to update the values in the database
    const updateTokenStatsInDb = async () => {
      const res = await getData(
        "Token",
        "findOneAndUpdate",
        { tokenAddress: transactions[0]?.tokenAddress },
        {
          jailbreak: jailbreak,
          marketCap: marketCap,
          dayVolume: dayVolume,
        }
      );
      if (!res.success) {
        console.error("Failed to update token stats:", res.error);
      }
    };

    if (tokenEthCap > 0) {
      // Calculate and set marketCap and dayVolume if tokenEthCap is valid
      const calculatedMarketCap =
        formatLargeNumber(
          tokenEthCap * 10 ** 9 * transactions[0]?.ethPriceAtTime
        ) || 0;
      setMarketCap(calculatedMarketCap);
      setDayVolume(totalEthVolumeInUsd || 0);
      setJailbreak(jailbreakPercentage || 0);

      // Update the database with the calculated values
      updateTokenStatsInDb();
    } else {
      // Fetch values from the database if tokenEthCap is 0
      const fetchStatsFromDb = async () => {
        const dbData = await getData("Token", "findOne", {
          tokenAddress: transactions[0]?.tokenAddress,
        });
        console.log(dbData.result);
        if (dbData.result) {
          setJailbreak(dbData.result.jailbreak || 0);
          setMarketCap(dbData.result.marketCap || 0);
          setDayVolume(dbData.result.dayVolume || 0);
        }
      };
      fetchStatsFromDb();
    }
  }, [
    dayVolume,
    jailbreak,
    jailbreakPercentage,
    marketCap,
    tokenEthCap,
    totalEthVolumeInUsd,
    transactions,
  ]);

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
                {/[$]\d/.test(marketCap) ? marketCap : "-"}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground">1D Volume</div>
              <div className="font-bold">{dayVolume > 0 ? dayVolume : "-"}</div>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center">
              <span>Jailbreak</span>
              {jailbreak >= 100 && (
                <BsFire className="ml-1 text-red-500 h-5 w-5" />
              )}
            </div>
            <div className="font-bold mb-3">
              {tokenEthCap > 0 ? (
                <div className="flex justify-between items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center cursor-pointer">
                        <span className="flex items-center">{jailbreak}%</span>
                      </div>
                    </TooltipTrigger>
                    {jailbreak >= 100 && (
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
            <Progress value={jailbreak} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
