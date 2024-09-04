import SimpleFactoryAbi from "./abi/SimpleFactory.json";
import { ethers } from "ethers";

/**
 * Fetches the TokenCreated events from the specified smart contract.
 * @returns {Promise<Array>} - A promise that resolves to an array of events.
 */
export async function fetchCreateTokenEvents(tokenAddress = null) {
  try {
    // Connect to the Ethereum provider (MetaMask, for example)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Define the contract using ethers.js
    const contract = new ethers.Contract(
      "0xEB398Dc9cAB95acB5D564faec169548658251C1E", // Replace with your contract address
      SimpleFactoryAbi,
      signer
    );

    // Get the latest block number
    const latestBlock = await provider.getBlock("latest");

    // Check if we are filtering by a specific token address
    let filter;
    if (tokenAddress) {
      // Filter by tokenAddress
      filter = contract.filters.TokenCreated(null, null, null, tokenAddress);
    } else {
      // Fetch all TokenCreated events (no specific filter)
      filter = contract.filters.TokenCreated();
    }

    // Fetch TokenCreated events
    const events = await contract.queryFilter(
      filter,
      19326890,
      latestBlock.number
    );

    // Return all tokens if no tokenAddress is provided
    if (!tokenAddress) {
      return events.map((event) => {
        const {
          tokenAddress,
          name,
          symbol,
          initialSupply,
          description,
          imageUrl,
          twitterLink,
          telegramLink,
          websiteLink,
        } = event.args;
        return {
          tokenAddress,
          name,
          symbol,
          initialSupply: initialSupply.toString(),
          description,
          imageUrl,
          twitterLink,
          telegramLink,
          websiteLink,
        };
      });
    }

    // If we are fetching a single token, return the first event (should only be one)
    if (events.length === 0) {
      return null; // No token found
    }

    // Extract and return the token data for the specific address
    const event = events[0];
    const {
      tokenAddress: address,
      name,
      symbol,
      initialSupply,
      description,
      imageUrl,
      twitterLink,
      telegramLink,
      websiteLink,
    } = event.args;

    return {
      address,
      name,
      symbol,
      initialSupply: initialSupply.toString(),
      description,
      imageUrl,
      twitterLink,
      telegramLink,
      websiteLink,
    };
  } catch (error) {
    console.error("Error fetching token data:", error);
    throw error;
  }
}
