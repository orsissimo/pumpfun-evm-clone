import SimpleFactoryAbi from "./abi/SimpleFactory.json";
import { ethers } from "ethers";

/**
 * Fetches the TokenCreated events from the specified smart contract.
 * @returns {Promise<Array>} - A promise that resolves to an array of events.
 */
export async function fetchCreateTokenEvents() {
  try {
    // Connect to the Ethereum provider (MetaMask, for example)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Define the contract using ethers.js
    const contract = new ethers.Contract(
      "0xEB398Dc9cAB95acB5D564faec169548658251C1E", // Replace with your actual contract address
      SimpleFactoryAbi,
      signer
    );

    // Get the block number
    const latestBlock = await provider.getBlock("latest");

    // Fetch TokenCreated events
    const events = await contract.queryFilter(
      contract.filters.TokenCreated(),
      19326890, // Starting block number (hardcoded, change as needed)
      latestBlock.number
    );

    // Create an array of tokens with the new data format
    const tokens = events.map((event) => {
      // Add safety checks to ensure data is returned properly
      const {
        tokenAddress = "", // Default empty string if undefined
        name = "", // Default empty string if undefined
        symbol = "", // Default empty string if undefined
        description = "", // Default empty string if undefined
        imageUrl = "", // Default empty string if undefined
        twitterLink = "", // Default empty string if undefined
        telegramLink = "", // Default empty string if undefined
        websiteLink = "", // Default empty string if undefined
      } = event.args || {}; // Use fallback empty object if event.args is undefined

      // Ensure initialSupply is safely converted
      return {
        tokenAddress,
        name,
        symbol,
        description,
        imageUrl,
        twitterLink,
        telegramLink,
        websiteLink,
      };
    });

    return tokens;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}
