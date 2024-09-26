import { HolderDistributionChart } from "./ui/holder-distrubution-chart";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
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

    // Convert holderDistribution object into an array of entries, sort by percentage, and return
    const sortedDistribution = Object.entries(holderDistribution)
      .sort(([, a], [, b]) => b.percentage - a.percentage) // Sort descending by percentage
      .reduce((acc, [holder, data]) => {
        acc[holder] = data;
        return acc;
      }, {});

    return sortedDistribution;
  };

  const holderDistribution = calculateHolderDistribution(transactions);

  return (
    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {" "}
      {/* Reduced gap for mobile */}
      {/* Holder Distribution Card */}
      <div className="flex flex-col order-2 md:order-1 mb-2 md:mb-0">
        {" "}
        {/* Added bottom margin for mobile */}
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Holder Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto scrollbar-hide pr-4">
            <div className="grid gap-2">
              {Object.entries(holderDistribution).map(
                ([holder, data], index) => (
                  <div
                    key={`holder-${index}`}
                    className="flex items-center justify-between mt-2" // Reduced margin-top
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
      <div className="flex justify-center items-center h-full order-1 md:order-2 mb-2 md:mb-0">
        {" "}
        {/* Added bottom margin for mobile */}
        <div className="h-[200px] md:h-[450px] w-[200px] md:w-[450px]">
          <HolderDistributionChart distributionData={holderDistribution} />
        </div>
      </div>
    </div>
  );
};
