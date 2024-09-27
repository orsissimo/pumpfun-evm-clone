// TransactionsTable.js
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import TableRowZero from "./ui/tablerowzero";
import { FaDollarSign } from "react-icons/fa";
import { formatPrice } from "@/lib/utils";

export function TransactionsTable({
  transactions,
  symbol,
  transactionZero,
  chain,
}) {
  const explorerUrl =
    chain === "ethereum"
      ? `https://etherscan.io/address/`
      : `https://basescan.org/address/`;

  return (
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
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6}>
              <div className="flex items-center h-full">
                No transactions found.
              </div>
            </TableCell>
          </TableRow>
        ) : (
          transactions
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .map((tx, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                <TableCell
                  className={
                    tx.eventType === "TokenPurchased"
                      ? "text-[#33CC90]"
                      : tx.eventType === "TokenSold"
                      ? "text-[#FF007A]"
                      : "text-gray-500"
                  }
                >
                  {tx.eventType === "TokenPurchased"
                    ? "Buy"
                    : tx.eventType === "TokenSold"
                    ? "Sell"
                    : "Create"}
                </TableCell>

                <TableCell>
                  {tx.empty
                    ? 10 ** 9
                    : Number(
                        Number(
                          Number(tx.tokensBought || tx.tokensSold) / 10 ** 18
                        ).toFixed(4)
                      )
                        .toLocaleString("en-US")
                        .replace(/,/g, "'")}
                </TableCell>
                <TableCell>
                  {tx.empty
                    ? "0"
                    : (
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
                          (tx.pricePerToken * tx.ethPriceAtTime) / 10 ** 18
                        ).leadingZeros
                      }
                    </span>
                    {
                      formatPrice(
                        (tx.pricePerToken * tx.ethPriceAtTime) / 10 ** 18
                      ).remainingFraction
                    }
                  </span>
                </TableCell>
                <TableCell>
                  <a
                    href={`${explorerUrl}${tx.buyer || tx.seller}`}
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
        )}
      </TableBody>
    </Table>
  );
}
