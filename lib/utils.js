import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
