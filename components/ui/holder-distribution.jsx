import { HolderDistributionChart } from "./holder-distrubution-chart";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

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
    <div className="col-span-full grid grid-cols-2 gap-8">
      {/* Holder Distribution Card */}
      <div className="col-span-1 flex flex-col">
        <Card className="flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Holder Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="grid gap-2">
                {Object.entries(holderDistribution).map(
                  ([holder, data], index) => (
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
                          <div className="font-medium">{holder}</div>
                          <div className="text-muted-foreground text-sm">
                            {data.percentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Component */}
      <div className="col-span-1">
        <Card className="flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Holder Distribution Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <HolderDistributionChart distributionData={holderDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
