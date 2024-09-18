import { HolderDistributionChart } from "./holder-distrubution-chart";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import Link from "next/link";

export const HolderDistribution = ({ transactions }) => {
  // Calculate the holder distribution
  const calculateHolderDistribution = (transactions) => {
    const holderDistribution = {};

    transactions.forEach((transaction) => {
      // For "TokenPurchased", the buyer gets tokens
      if (transaction.eventType === "TokenPurchased") {
        const buyer = transaction.buyer;
        const tokensBought = parseFloat(transaction.tokensBought) || 0;
        if (!holderDistribution[buyer]) {
          holderDistribution[buyer] = { tokens: 0 };
        }
        holderDistribution[buyer].tokens += tokensBought;
      }

      // For "TokenSold", the seller loses tokens
      if (transaction.eventType === "TokenSold") {
        const seller = transaction.seller;
        const tokensSold = parseFloat(transaction.tokensSold) || 0;
        if (!holderDistribution[seller]) {
          holderDistribution[seller] = { tokens: 0 };
        }
        holderDistribution[seller].tokens -= tokensSold; // Subtract tokens sold
      }
    });

    // Convert tokens to percentage based on 1 million
    const totalSupply = 1000000; // 1 million token supply
    for (let holder in holderDistribution) {
      holderDistribution[holder].percentage =
        (holderDistribution[holder].tokens / 10 ** 18 / totalSupply) * 100;
    }

    return holderDistribution;
  };

  const holderDistribution = calculateHolderDistribution(transactions);

  return (
    <div className="col-span-full grid grid-cols-2 gap-8 h-full">
      {/* Holder Distribution Card */}
      <div className="col-span-1 flex flex-col">
        <Card className="h-[590px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Holder Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto scrollbar-hide pr-4">
            <div className="grid gap-2">
              {Object.entries(holderDistribution).map(
                ([holder, data], index) => (
                  <div
                    key={`holder-${index}`}
                    className="flex items-center justify-between mt-4"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 mr-2 text-xs text-center pt-[5px] rounded-full bg-${
                          ["secondary", "muted"][index % 2]
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <Link
                          href={`https://etherscan.io/address/${holder}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="text-sm hover:underline">
                            {holder}
                          </div>
                        </Link>
                        <div className="text-muted-foreground text-xs">
                          {(data.percentage / 1000).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Component */}
      <div className="col-span-1 flex flex-col">
        <Card className="h-[590px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Holder Distribution Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow mt-4">
            <HolderDistributionChart distributionData={holderDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
