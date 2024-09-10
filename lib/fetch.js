import { ethers } from "ethers";
import { toast } from "react-toastify";

import SimpleTokenAbi from "./abi/SimpleToken.json";
import SimpleFactoryAbi from "./abi/SimpleFactory.json";
import { fetchFileFromIPFS } from "./pinata";
import { fetchEthPrice } from "./utils";
import { saveTokenData, saveTokenTransaction } from "./mongodb";

export async function fetchCreateTokenEvents(tokenAddressParam = null) {
  try {
    // Connect to the Ethereum provider (Alchemy)
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_PROVIDER_BASE
    );

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY, // Replace with your contract address
      SimpleFactoryAbi, // Replace with your contract ABI
      provider
    );

    const latestBlock = await provider.getBlock("latest");
    const latestBlockNumber = latestBlock.number;
    const latestBlockTimestamp = latestBlock.timestamp;

    const eightHoursAgoTimestamp = latestBlockTimestamp - 8 * 60 * 60;

    let currentBlockNumber = latestBlockNumber;
    let earliestBlockNumber = 0;

    // Binary search to find block for 8 hours ago
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

    // Dynamic step size based on block difference
    let stepSize = Math.min(1000, latestBlockNumber - startBlock);

    let filter;
    if (tokenAddressParam) {
      filter = contract.filters.TokenCreated(tokenAddressParam);
    } else {
      filter = contract.filters.TokenCreated();
    }

    const allEvents = [];
    let promises = [];

    // Helper function to fetch events in a given block range
    const fetchEventsInRange = async (fromBlock, toBlock) => {
      return contract.queryFilter(filter, fromBlock, toBlock);
    };

    // Fetch events concurrently
    for (let i = startBlock; i <= latestBlockNumber; i += stepSize) {
      const toBlock = Math.min(i + stepSize - 1, latestBlockNumber);
      promises.push(fetchEventsInRange(i, toBlock));

      if (promises.length >= 5) {
        const results = await Promise.all(promises);
        results.forEach((result) => allEvents.push(...result));
        promises = []; // Reset promise array for next batch
      }
    }

    if (promises.length > 0) {
      const results = await Promise.all(promises);
      results.forEach((result) => allEvents.push(...result));
    }

    if (!tokenAddressParam) {
      return Promise.all(
        allEvents.map(async (event) => {
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

          // Fetch the block details using the event's block number
          const block = await provider.getBlock(event.blockNumber); // Fetch block data to get the timestamp

          // Check if image exists in IPFS
          const imageExists = await fetchFileFromIPFS(imageUrl);
          const finalImageUrl = imageExists
            ? imageUrl
            : "Qme2CbcqAQ2kob78MLFWve7inyaKq5tPDU2LKqBnC1W6Fo";

          // Saves return data to the database
          const tokenData = {
            tokenAddress,
            name,
            symbol,
            initialSupply: initialSupply.toString(),
            description,
            imageUrl: finalImageUrl,
            twitterLink,
            telegramLink,
            websiteLink,
            timestamp: new Date(block.timestamp * 1000).toISOString(), // Use block.timestamp
          };

          await saveTokenData(tokenData);

          return {
            tokenAddress,
            name,
            symbol,
            initialSupply: initialSupply.toString(),
            description,
            imageUrl: finalImageUrl,
            twitterLink,
            telegramLink,
            websiteLink,
            timestamp: new Date(block.timestamp * 1000).toISOString(), // Return formatted timestamp
          };
        })
      );
    }

    if (allEvents.length === 0) {
      return null;
    }

    // Fetch the block details for the individual event for the case with tokenAddressParam
    const event = allEvents[0];
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

    const block = await provider.getBlock(event.blockNumber); // Fetch block timestamp here

    // Check if image exists in IPFS for the specific token event
    const imageExists = await fetchFileFromIPFS(imageUrl);
    const finalImageUrl = imageExists
      ? imageUrl
      : "Qme2CbcqAQ2kob78MLFWve7inyaKq5tPDU2LKqBnC1W6Fo";

    return {
      tokenAddress,
      name,
      symbol,
      initialSupply: initialSupply.toString(),
      description,
      imageUrl: finalImageUrl,
      twitterLink,
      telegramLink,
      websiteLink,
      timestamp: new Date(block.timestamp * 1000).toISOString(), // Use block.timestamp here too
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
    /* toast.error("Connect your wallet to fetch token balance"); */
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
    /* toast.error("Connect your wallet to fetch ETH balance"); */
  }
};

export async function fetchTokenBuysAndSells(tokenAddress = null) {
  try {
    const ethPriceAtTime = (await fetchEthPrice()) || 0;
    // Connect to the Ethereum provider (MetaMask, for example)
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_PROVIDER_BASE
    );
    const signer = provider.getSigner();

    // Define the contract using ethers.js
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY, // Replace with your contract address
      SimpleFactoryAbi, // Replace with your contract ABI
      signer
    );

    // Get the latest block number and timestamp
    const latestBlock = await provider.getBlock("latest");
    const latestBlockNumber = latestBlock.number;
    const latestBlockTimestamp = latestBlock.timestamp;

    // Calculate the timestamp for X hours ago (in seconds)
    const twoHoursAgoTimestamp = latestBlockTimestamp - 8 * 60 * 60;

    // Use binary search to find the block from X hours ago
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
        console.log(event);
        eventsWithTimestamps.push({
          eventType: "TokenPurchased",
          buyer,
          tokenAddress,
          ethSpent: ethSpent.toString(),
          tokensBought: tokensBought.toString(),
          pricePerToken: pricePerToken.toString(),
          timestamp: new Date(block.timestamp * 1000).toISOString(),
        });

        const eventData = {
          eventType: "TokenPurchased",
          buyer,
          tokenAddress,
          ethSpent: ethSpent.toString(),
          tokensBought: tokensBought.toString(),
          pricePerToken: pricePerToken.toString(),
          ethPriceAtTime,
          transactionHash: event.transactionHash,
          timestamp: new Date(block.timestamp * 1000).toISOString(),
        };

        await saveTokenTransaction(eventData);
      }

      // Process sale events and add timestamps
      for (const event of saleEvents) {
        const { seller, tokenAddress, ethReceived, tokensSold, pricePerToken } =
          event.args;
        const block = await provider.getBlock(event.blockNumber);

        console.log(event);
        eventsWithTimestamps.push({
          eventType: "TokenSold",
          seller,
          tokenAddress,
          ethReceived: ethReceived.toString(),
          tokensSold: tokensSold.toString(),
          pricePerToken: pricePerToken.toString(),
          timestamp: new Date(block.timestamp * 1000).toISOString(),
        });
        const eventData = {
          eventType: "TokenSold",
          seller,
          tokenAddress,
          ethReceived: ethReceived.toString(),
          tokensSold: tokensSold.toString(),
          pricePerToken: pricePerToken.toString(),
          ethPriceAtTime,
          transactionHash: event.transactionHash,
          timestamp: new Date(block.timestamp * 1000).toISOString(),
        };
        await saveTokenTransaction(eventData);
      }
    }

    // Return the events with timestamps
    return eventsWithTimestamps;
  } catch (error) {
    console.error("Error fetching buy and sell events:", error);
    throw error;
  }
}
