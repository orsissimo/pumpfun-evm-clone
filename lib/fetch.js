import { ethers } from "ethers";
import { toast } from "react-toastify";

import SimpleTokenAbi from "./abi/SimpleToken.json";
import SimpleFactoryAbi from "./abi/SimpleFactory.json";

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

    // Create a filter based on whether a tokenAddress is provided or not
    let filter;
    if (tokenAddress) {
      // Filter by tokenAddress (which is indexed)
      filter = contract.filters.TokenCreated(tokenAddress);
    } else {
      // Fetch all TokenCreated events (no specific filter)
      filter = contract.filters.TokenCreated();
    }

    // Fetch TokenCreated events with the filter
    const events = await contract.queryFilter(
      filter,
      19329951,
      latestBlock.number
    );

    // If no tokenAddress is provided, return all tokens
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

    // If fetching a specific token, return the first event (if available)
    if (events.length === 0) {
      return null; // No token found for this address
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

export const getTokenBalance = async (tokenAddress) => {
  // Check if tokenAddress is empty or null
  if (!tokenAddress) {
    toast.error("Invalid token address");
    return;
  }

  try {
    // Initialize the Web3 provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress(); // Get the connected wallet address

    // Create a contract instance for the token
    const token = new ethers.Contract(
      tokenAddress,
      SimpleTokenAbi, // ABI of the token contract
      provider
    );

    // Fetch the token balance of the connected wallet
    const balance = await token.balanceOf(walletAddress);

    // Convert the balance to a more readable format if the token has decimals
    const decimals = await token.decimals();
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    console.log(`Token Balance: ${formattedBalance}`);
    toast(`You have ${formattedBalance} tokens`);
    return formattedBalance; // Return the token balance
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch token balance");
  }
};

export const getEtherBalance = async () => {
  try {
    // Initialize the Web3 provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress(); // Get the connected wallet address

    // Fetch the Ether balance of the connected wallet
    const balance = await provider.getBalance(walletAddress);

    // Convert the balance to a more readable format (Ether)
    const formattedBalance = ethers.utils.formatEther(balance);

    console.log(`Ether Balance: ${formattedBalance}`);
    toast(`You have ${formattedBalance} ETH`);
    return formattedBalance; // Return the ETH balance
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch ETH balance");
  }
};
