import React from "react";
import { TableCell, TableRow } from "./table";

const TableRowZero = ({ tx }) => {
  const formatPrice = (price) => {
    const priceString = price.toString();
    const [leadingZeros, remainingFraction = ""] = priceString.split(".");

    return {
      leadingZeros,
      remainingFraction: remainingFraction.slice(0, 4), // limit to 4 decimal places
    };
  };

  return (
    <TableRow>
      {/* Render transaction rows */}
      <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
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
        {tx.empty
          ? "-"
          : Number(
              Number(
                Number(tx.tokensBought || tx.tokensSold) / 10 ** 18
              ).toFixed(4)
            )
              .toLocaleString("en-US")
              .replace(/,/g, "'")}{" "}
      </TableCell>
      <TableCell>
        {tx.empty
          ? "-"
          : (Number(tx.ethSpent || tx.ethReceived) / 10 ** 18).toFixed(6)}{" "}
        {/*ETH */}
      </TableCell>
      <TableCell>
        <span>
          0.0
          <span className="text-xs align-sub">
            {
              formatPrice((tx.pricePerToken * tx.ethPriceAtTime) / 10 ** 18)
                .leadingZeros
            }
          </span>
          {
            formatPrice((tx.pricePerToken * tx.ethPriceAtTime) / 10 ** 18)
              .remainingFraction
          }
        </span>
      </TableCell>
      <TableCell>
        <a
          href={`https://etherscan.io/address/${tx.buyer || tx.seller}`}
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
  );
};

export default TableRowZero;
