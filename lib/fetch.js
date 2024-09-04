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
      SimpleFactoryAbi, // Replace with your contract ABI
      signer
    );

    // Get the latest block number and timestamp
    const latestBlock = await provider.getBlock("latest");
    const latestBlockNumber = latestBlock.number;
    const latestBlockTimestamp = latestBlock.timestamp;

    // Calculate the timestamp for 8 hours ago (in seconds)
    const eightHoursAgoTimestamp = latestBlockTimestamp - 8 * 60 * 60;

    // Step backward to find the block mined approximately 8 hours ago
    let currentBlockNumber = latestBlockNumber;
    let earliestBlockNumber = 0;

    while (currentBlockNumber - earliestBlockNumber > 1) {
      const middleBlockNumber = Math.floor(
        (currentBlockNumber + earliestBlockNumber) / 2
      );
      const middleBlock = await provider.getBlock(middleBlockNumber);

      if (middleBlock.timestamp > eightHoursAgoTimestamp) {
        currentBlockNumber = middleBlockNumber;
      } else {
        earliestBlockNumber = middleBlockNumber;
      }
    }

    const startBlock = currentBlockNumber;

    // Define pagination step size (e.g., 1000 blocks at a time)
    const stepSize = 1000;

    // Create a filter based on whether a tokenAddress is provided or not
    let filter;
    if (tokenAddress) {
      // Filter by tokenAddress (which is indexed)
      filter = contract.filters.TokenCreated(tokenAddress);
    } else {
      // Fetch all TokenCreated events (no specific filter)
      filter = contract.filters.TokenCreated();
    }

    // Function to fetch events in a given block range
    const fetchEventsInRange = async (fromBlock, toBlock) => {
      const events = await contract.queryFilter(filter, fromBlock, toBlock);
      return events;
    };

    // Accumulate events with pagination
    let allEvents = [];

    // Paginate through blocks from startBlock to latestBlockNumber
    for (let i = startBlock; i <= latestBlockNumber; i += stepSize) {
      const toBlock = Math.min(i + stepSize - 1, latestBlockNumber);

      // Fetch events in the current block range
      const eventsInRange = await fetchEventsInRange(i, toBlock);
      allEvents = allEvents.concat(eventsInRange);
    }

    // If no tokenAddress is provided, return all tokens
    if (!tokenAddress) {
      return allEvents.map((event) => {
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
    if (allEvents.length === 0) {
      return null; // No token found for this address
    }

    // Extract and return the token data for the specific address
    const event = allEvents[0];
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

    //console.log(`Token Balance: ${formattedBalance}`);
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

    //console.log(`Ether Balance: ${formattedBalance}`);
    return formattedBalance; // Return the ETH balance
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch ETH balance");
  }
};

export async function fetchTokenBuysAndSells(tokenAddress = null) {
  try {
    // Connect to the Ethereum provider (MetaMask, for example)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Define the contract using ethers.js
    const contract = new ethers.Contract(
      "0xEB398Dc9cAB95acB5D564faec169548658251C1E", // Replace with your contract address
      SimpleFactoryAbi, // Replace with your contract ABI
      signer
    );

    // Get the latest block number and timestamp
    const latestBlock = await provider.getBlock("latest");
    const latestBlockNumber = latestBlock.number;
    const latestBlockTimestamp = latestBlock.timestamp;

    // Calculate the timestamp for 10 hours ago (in seconds)
    const twoHoursAgoTimestamp = latestBlockTimestamp - 10 * 60 * 60;

    // Use binary search to find the block from 2 hours ago
    let currentBlockNumber = latestBlockNumber;
    let earliestBlockNumber = 0;

    while (currentBlockNumber - earliestBlockNumber > 1) {
      const middleBlockNumber = Math.floor(
        (currentBlockNumber + earliestBlockNumber) / 2
      );
      const middleBlock = await provider.getBlock(middleBlockNumber);

      if (middleBlock.timestamp > twoHoursAgoTimestamp) {
        currentBlockNumber = middleBlockNumber;
      } else {
        earliestBlockNumber = middleBlockNumber;
      }
    }

    const startBlock = currentBlockNumber;

    // Define pagination step size (e.g., 1000 blocks at a time)
    const stepSize = 1000;

    // Create filters for both TokenPurchased and TokenSold events
    let purchaseFilter, saleFilter;

    if (tokenAddress) {
      // Filter by tokenAddress (indexed)
      purchaseFilter = contract.filters.TokenPurchased(null, tokenAddress);
      saleFilter = contract.filters.TokenSold(null, tokenAddress);
    } else {
      // Fetch all purchases and sales if no tokenAddress is specified
      purchaseFilter = contract.filters.TokenPurchased();
      saleFilter = contract.filters.TokenSold();
    }

    // Function to fetch events in a given block range
    const fetchEventsInRange = async (fromBlock, toBlock) => {
      const purchaseEvents = await contract.queryFilter(
        purchaseFilter,
        fromBlock,
        toBlock
      );
      const saleEvents = await contract.queryFilter(
        saleFilter,
        fromBlock,
        toBlock
      );
      return { purchaseEvents, saleEvents };
    };

    // Accumulate events with timestamps
    let eventsWithTimestamps = [];

    // Paginate through blocks from startBlock to latestBlockNumber
    for (let i = startBlock; i <= latestBlockNumber; i += stepSize) {
      const toBlock = Math.min(i + stepSize - 1, latestBlockNumber);

      const { purchaseEvents, saleEvents } = await fetchEventsInRange(
        i,
        toBlock
      );

      // Process purchase events and add timestamps
      for (const event of purchaseEvents) {
        const { buyer, tokenAddress, ethSpent, tokensBought, pricePerToken } =
          event.args;
        const block = await provider.getBlock(event.blockNumber);

        eventsWithTimestamps.push({
          eventType: "TokenPurchased",
          buyer,
          tokenAddress,
          ethSpent: ethSpent.toString(),
          tokensBought: tokensBought.toString(),
          pricePerToken: pricePerToken.toString(),
          timestamp: new Date(block.timestamp * 1000).toISOString(),
        });
      }

      // Process sale events and add timestamps
      for (const event of saleEvents) {
        const { seller, tokenAddress, ethReceived, tokensSold, pricePerToken } =
          event.args;
        const block = await provider.getBlock(event.blockNumber);

        eventsWithTimestamps.push({
          eventType: "TokenSold",
          seller,
          tokenAddress,
          ethReceived: ethReceived.toString(),
          tokensSold: tokensSold.toString(),
          pricePerToken: pricePerToken.toString(),
          timestamp: new Date(block.timestamp * 1000).toISOString(),
        });
      }
    }

    // Sort events by timestamp (ascending order)
    eventsWithTimestamps.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Return the events with timestamps
    return eventsWithTimestamps.reverse();
  } catch (error) {
    console.error("Error fetching buy and sell events:", error);
    throw error;
  }
}
