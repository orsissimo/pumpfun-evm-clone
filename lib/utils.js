import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Function to fetch the current ETH price
export async function fetchEthPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await response.json();
    return data.ethereum.usd.toString(); // Convert to string to store in the database
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return "0"; // Return 0 if there's an error to prevent crashing
  }
}

export function formatPrice(number) {
  // Convert the number to a string and split into whole and fraction parts
  let [whole, fraction = ""] = String(number).split(".");

  // If no fractional part, return 0 leading zeros and empty remaining fraction
  if (!fraction) {
    return {
      leadingZeros: 0,
      remainingFraction: "",
    };
  }

  // Count the leading zeros in the fractional part
  let leadingZerosCount = 0;
  for (let char of fraction) {
    if (char === "0") {
      leadingZerosCount++;
    } else {
      break;
    }
  }

  // Separate leading zeros and the remaining fraction
  let remainingFraction = fraction.slice(leadingZerosCount);

  // Round or trim the remaining fraction to a maximum of 6 digits
  if (remainingFraction.length > 6) {
    remainingFraction = Math.round(
      Number("0." + remainingFraction) * 10 ** 6
    ).toString();
  }

  // Return the number of leading zeros and the remaining fraction
  return {
    leadingZeros: leadingZerosCount,
    remainingFraction: remainingFraction || "0", // Return '0' if no digits after leading zeros
  };
}

// Function to format large numbers
export const formatLargeNumber = (number) => {
  if (Number(number) < 1000) {
    return `$${Number(number).toFixed(2)}`;
  } else if (Number(number) >= 1000 && Number(number) < 1_000_000) {
    return `$${(Number(number) / 1_000).toFixed(1)}K`;
  } else if (Number(number) >= 1_000_000 && Number(number) < 1_000_000_000) {
    return `$${(Number(number) / 1_000_000).toFixed(1)}M`;
  } else if (Number(number) >= 1_000_000_000) {
    return `$${(Number(number) / 1_000_000_000).toFixed(1)}B`;
  }
};

export const findTokenAddress = async (transactionHash) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const receipt = await provider.getTransactionReceipt(transactionHash);

  if (!receipt) {
    throw new Error("Transaction not found or not mined yet");
  }

  console.log(receipt);

  // Define the ABI for the TokenCreated event
  const abi = [
    "event TokenCreated(address indexed tokenAddress, string name, string symbol, uint256 initialSupply, string description, string imageUrl, string twitterLink, string telegramLink, string websiteLink, string pumpstyleWebsiteLink, string pumpstyleXLink, string pumpstyleTelegramLink)",
  ];

  const iface = new ethers.utils.Interface(abi);

  // Find the contract creation event
  const creationEvent = receipt.logs.find((log) => {
    return log.topics[0] === iface.getEventTopic("TokenCreated");
  });

  if (!creationEvent) {
    throw new Error("Token creation event not found in transaction logs");
  }

  // Decode the event data
  const decodedLog = iface.parseLog(creationEvent);
  const tokenAddress = decodedLog.args.tokenAddress;

  console.log("Token Address:", tokenAddress);

  return tokenAddress;
};

export const getBlockTimestamp = async (blockNumber) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Extract the block timestamp
  const block = await provider.getBlock(blockNumber);
  return Date(block.timestamp * 1000);
};
