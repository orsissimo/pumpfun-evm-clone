import { ethers } from "ethers";
import { toast } from "react-toastify";

import SimpleTokenAbi from "./abi/SimpleToken.json";
import SimpleFactoryAbi from "./abi/SimpleFactory.json";
import { fetchEthPrice, findTokenAddress, getBlockTimestamp } from "./utils";
import { saveTokenData, saveTokenTransaction } from "./mongodb";

export const createToken = async (
  name,
  ticker,
  description,
  image,
  twitter,
  telegram,
  website,
  chain
) => {
  // Check if name or ticker is empty or null
  if (!name || !ticker) {
    toast.error("Invalid parameters");
    return;
  }

  const factoryAddress =
    chain === "ethereum"
      ? process.env.NEXT_PUBLIC_FACTORY_ETH
      : process.env.NEXT_PUBLIC_FACTORY_BASE;

  try {
    await switchNetwork(chain);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      factoryAddress,
      SimpleFactoryAbi,
      signer
    );

    const params = [
      name,
      ticker,
      description,
      image,
      twitter,
      telegram,
      website,
    ];

    // Call the createToken function in the smart contract
    const tx = await factory.createToken(...params);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    // console.log(`Transaction Hash: ${tx.hash}`);
    // console.log(receipt);
    const tokenAddress = await findTokenAddress(tx.hash, chain);
    // Save the token data to the database
    const tokenData = {
      tokenCreator: await signer.getAddress(), // Address of the creator
      tokenFactory: factoryAddress,
      tokenAddress: tokenAddress,
      name: name,
      symbol: ticker,
      initialSupply: 1 * 10 ** 9 * 10 ** 18,
      description: description,
      imageUrl: image,
      twitterLink: twitter,
      telegramLink: telegram,
      websiteLink: website,
      timestamp: await getBlockTimestamp(receipt.blockNumber, chain),
      ethPriceAtTime: await fetchEthPrice(),
      chain: chain,
    };
    // console.log(tokenData);
    await saveTokenData(tokenData);
    toast("Token Created!");
    return tokenAddress;
  } catch (err) {
    console.error("Error creating token:", err);
    toast.error("Token creation failed");
  }
};
export const createAndBuyToken = async (
  name,
  ticker,
  description,
  image,
  twitter,
  telegram,
  website,
  ethAmount,
  chain
) => {
  // Check if name or ticker is empty or null
  if (!name || !ticker) {
    toast.error("Invalid parameters");
    return;
  }

  try {
    await switchNetwork(chain);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factoryAddress =
      chain === "ethereum"
        ? process.env.NEXT_PUBLIC_FACTORY_ETH
        : process.env.NEXT_PUBLIC_FACTORY_BASE;

    const factory = new ethers.Contract(
      factoryAddress,
      SimpleFactoryAbi,
      signer
    );

    const params = [
      name,
      ticker,
      description,
      image,
      twitter,
      telegram,
      website,
    ];

    // Call the createToken function in the smart contract
    const tx = await factory.createAndBuyToken(...params, {
      value: ethers.utils.parseEther(ethAmount),
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction Hash: ${tx.hash}`);

    // Define the ABI for the TokenCreated event
    const tokenCreatedABI = [
      "event TokenCreated(address indexed tokenAddress, string name, string symbol, uint256 initialSupply, string description, string imageUrl, string twitterLink, string telegramLink, string websiteLink, string pumpstyleWebsiteLink, string pumpstyleXLink, string pumpstyleTelegramLink)",
    ];
    const ifaceTokenCreated = new ethers.utils.Interface(tokenCreatedABI);

    // Find the TokenCreated event log in the receipt
    const creationEvent = receipt.logs.find(
      (log) => log.topics[0] === ifaceTokenCreated.getEventTopic("TokenCreated")
    );

    if (!creationEvent) {
      throw new Error("TokenCreated event not found in transaction logs");
    }
    // Decode the TokenCreated event log
    const decodedCreationLog = ifaceTokenCreated.parseLog(creationEvent);
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
    } = decodedCreationLog.args;

    // Save the token data to the database
    const tokenData = {
      tokenCreator: await signer.getAddress(), // Address of the creator
      tokenFactory: factoryAddress,
      tokenAddress: tokenAddress, // From the event log
      name: name, // From the event log
      symbol: symbol, // From the event log (ticker is usually called "symbol")
      initialSupply: initialSupply.toString(), // From the event log, formatted as a string for storage
      description: description, // From the event log
      imageUrl: imageUrl, // From the event log
      twitterLink: twitterLink, // From the event log
      telegramLink: telegramLink, // From the event log
      websiteLink: websiteLink, // From the event log
      timestamp: await getBlockTimestamp(receipt.blockNumber, chain), // Fetched separately
      ethPriceAtTime: await fetchEthPrice(), // Fetched separately
      chain: chain, // Passed in as a parameter
    };

    console.log(tokenData);
    await saveTokenData(tokenData);

    // Now let's handle the purchase event (like in the buyToken function)
    const tokenPurchasedABI = [
      "event TokenPurchased(address indexed buyer, address indexed tokenAddress, uint256 ethSpent, uint256 tokensBought, uint256 pricePerToken, string pumpstyleWebsiteLink, string pumpstyleXLink, string pumpstyleTelegramLink)",
    ];
    const ifaceTokenPurchased = new ethers.utils.Interface(tokenPurchasedABI);

    // Find the TokenPurchased event log in the receipt
    const purchaseEvent = receipt.logs.find(
      (log) =>
        log.topics[0] === ifaceTokenPurchased.getEventTopic("TokenPurchased")
    );

    if (!purchaseEvent) {
      throw new Error("TokenPurchased event not found in transaction logs");
    }

    // Decode the TokenPurchased event log
    const decodedPurchaseLog = ifaceTokenPurchased.parseLog(purchaseEvent);
    const { ethSpent, tokensBought, pricePerToken } = decodedPurchaseLog.args;

    // Retrieve ETH price at the time of transaction
    const ethPriceAtTime = await fetchEthPrice();

    // Prepare transaction data to save to the database
    const eventData = {
      eventType: "TokenPurchased",
      buyer: await signer.getAddress(),
      tokenAddress: tokenAddress,
      ethSpent: ethers.utils.formatEther(ethSpent) * 10 ** 18,
      tokensBought: ethers.utils.formatEther(tokensBought) * 10 ** 18,
      pricePerToken: ethers.utils.formatEther(pricePerToken) * 10 ** 18,
      ethPriceAtTime: ethPriceAtTime,
      transactionHash: tx.hash,
      timestamp: await getBlockTimestamp(receipt.blockNumber, chain),
    };
    console.log(eventData);
    await saveTokenTransaction(eventData);

    toast("Token Created and Purchased!");
    return tokenAddress;
  } catch (err) {
    console.error(err);
    toast.error("Token creation and purchase failed");
  }
};

export const buyToken = async (ethAmount, tokenAddress, chain) => {
  if (!tokenAddress) {
    toast.error("Invalid token address");
    return;
  }

  const factoryAddress =
    chain === "ethereum"
      ? process.env.NEXT_PUBLIC_FACTORY_ETH
      : process.env.NEXT_PUBLIC_FACTORY_BASE;

  try {
    await switchNetwork(chain);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      factoryAddress,
      SimpleFactoryAbi,
      signer
    );

    const purchaseAmount = ethers.utils.parseEther(ethAmount); // Convert to appropriate amount

    // Call the buyToken function in the smart contract
    const tx = await factory.buyToken(
      tokenAddress,
      BigInt(99999999999999999999999999999), // Arbitrary token amount limit
      { value: purchaseAmount }
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Define the ABI for the TokenPurchased event
    const tokenPurchasedABI = [
      "event TokenPurchased(address indexed buyer, address indexed tokenAddress, uint256 ethSpent, uint256 tokensBought, uint256 pricePerToken, string pumpstyleWebsiteLink, string pumpstyleXLink, string pumpstyleTelegramLink)",
    ];

    const iface = new ethers.utils.Interface(tokenPurchasedABI);

    // Find the TokenPurchased event log in the receipt
    const purchaseEvent = receipt.logs.find(
      (log) => log.topics[0] === iface.getEventTopic("TokenPurchased")
    );

    if (!purchaseEvent) {
      throw new Error("TokenPurchased event not found in transaction logs");
    }

    // Decode the event log
    const decodedLog = iface.parseLog(purchaseEvent);
    // console.log(decodedLog);
    const { ethSpent, tokensBought, pricePerToken } = decodedLog.args;

    // Retrieve ETH price at time of transaction
    const ethPriceAtTime = await fetchEthPrice(); // Implement this function using a pricing API

    // Prepare transaction data to save to the database
    const eventData = {
      eventType: "TokenPurchased",
      buyer: await signer.getAddress(),
      tokenAddress: tokenAddress,
      ethSpent: ethers.utils.formatEther(ethSpent) * 10 ** 18,
      tokensBought: ethers.utils.formatEther(tokensBought) * 10 ** 18,
      pricePerToken: ethers.utils.formatEther(pricePerToken) * 10 ** 18,
      ethPriceAtTime: ethPriceAtTime,
      transactionHash: tx.hash,
      timestamp: await getBlockTimestamp(receipt.blockNumber, chain),
    };
    // console.log(eventData);
    // Save the transaction to the database
    await saveTokenTransaction(eventData);

    //toast("Token Purchased!");
  } catch (err) {
    console.error(err);
    toast.error("Token purchase failed");
  }
};

export const sellToken = async (tokenAmount, tokenAddress, chain) => {
  if (!tokenAddress || !tokenAmount) {
    toast.error("Invalid token address or amount");
    return;
  }

  // console.log("!!!!", tokenAmount, tokenAddress);

  try {
    await switchNetwork(chain);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factoryAddress =
      chain === "ethereum"
        ? process.env.NEXT_PUBLIC_FACTORY_ETH
        : process.env.NEXT_PUBLIC_FACTORY_BASE;

    const token = new ethers.Contract(
      tokenAddress,
      SimpleTokenAbi, // ABI of the token contract
      signer
    );

    const factory = new ethers.Contract(
      factoryAddress,
      SimpleFactoryAbi, // ABI of the factory contract
      signer
    );

    const sellAmount = ethers.utils.parseEther(tokenAmount);

    // Approve the factory to spend the tokens
    const approveTx = await token.approve(factory.address, sellAmount);
    await approveTx.wait();

    // Call the sellToken function on the factory contract
    const tx = await factory.sellToken(tokenAddress, sellAmount);
    const receipt = await tx.wait();

    // Define the ABI for the TokenSold event
    const tokenSoldABI = [
      "event TokenSold(address indexed seller, address indexed tokenAddress, uint256 ethReceived, uint256 tokensSold, uint256 pricePerToken, string pumpstyleWebsiteLink, string pumpstyleXLink, string pumpstyleTelegramLink)",
    ];

    const iface = new ethers.utils.Interface(tokenSoldABI);

    // Find the TokenSold event log in the receipt
    const sellEvent = receipt.logs.find(
      (log) => log.topics[0] === iface.getEventTopic("TokenSold")
    );

    if (!sellEvent) {
      throw new Error("TokenSold event not found in transaction logs");
    }

    // Decode the event log
    const decodedLog = iface.parseLog(sellEvent);
    const { ethReceived, tokensSold, pricePerToken } = decodedLog.args;

    // Retrieve ETH price at time of transaction
    const ethPriceAtTime = await fetchEthPrice(); // Implement this function using a pricing API

    // Prepare transaction data to save to the database
    const eventData = {
      eventType: "TokenSold",
      seller: await signer.getAddress(),
      tokenAddress: tokenAddress,
      ethReceived: ethers.utils.formatEther(ethReceived) * 10 ** 18,
      tokensSold: ethers.utils.formatEther(tokensSold) * 10 ** 18,
      pricePerToken: ethers.utils.formatEther(pricePerToken) * 10 ** 18,
      ethPriceAtTime: ethPriceAtTime,
      transactionHash: tx.hash,
      timestamp: await getBlockTimestamp(receipt.blockNumber, chain),
    };
    // console.log(eventData);

    // Save the transaction to the database
    await saveTokenTransaction(eventData);

    //toast("Token Sold!");
  } catch (err) {
    console.error(err);
    toast.error("Token sale failed");
  }
};

export const getEthSurplus = async (tokenAddress, chain) => {
  try {
    await switchNetwork(chain);
    const factoryAddress =
      chain === "ethereum"
        ? process.env.NEXT_PUBLIC_FACTORY_ETH
        : process.env.NEXT_PUBLIC_FACTORY_BASE;

    const nodeProvider =
      chain === "ethereum"
        ? process.env.NEXT_PUBLIC_PROVIDER_ETH
        : process.env.NEXT_PUBLIC_PROVIDER_BASE;

    // Connect to the Ethereum provider (Alchemy)
    const provider = new ethers.providers.JsonRpcProvider(nodeProvider);

    // Request accounts directly from MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];

    // Initialize the signer manually with JsonRpcProvider and the user's account
    const signer = provider.getSigner(account);

    // Initialize the contract with the correct address and ABI
    const factory = new ethers.Contract(
      factoryAddress,
      SimpleFactoryAbi,
      signer
    );

    // Call the function to get the token surplus
    const ethSurplus = await factory.tokenEthSurplus(tokenAddress);
    return ethSurplus;
  } catch (err) {
    console.error(err);
  }
};

export const getFactoryCap = async (chain) => {
  try {
    await switchNetwork(chain);
    const factoryAddress =
      chain === "ethereum"
        ? process.env.NEXT_PUBLIC_FACTORY_ETH
        : process.env.NEXT_PUBLIC_FACTORY_BASE;

    const nodeProvider =
      chain === "ethereum"
        ? process.env.NEXT_PUBLIC_PROVIDER_ETH
        : process.env.NEXT_PUBLIC_PROVIDER_BASE;

    // Connect to the Ethereum provider (Alchemy)
    const provider = new ethers.providers.JsonRpcProvider(nodeProvider);

    // Request accounts directly from MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];

    // Initialize the signer manually with JsonRpcProvider and the user's account
    const signer = provider.getSigner(account);

    // Initialize the contract with the correct address and ABI
    const factory = new ethers.Contract(
      factoryAddress,
      SimpleFactoryAbi,
      signer
    );

    // Call the function to get the factory cap
    const cap = await factory.ethCap();
    return cap;
  } catch (err) {
    console.error(err);
  }
};

export const switchNetwork = async (chain) => {
  const networkParams =
    chain === "ethereum"
      ? {
          chainId: "0x1", // Ethereum Mainnet chainId
          chainName: "Ethereum Mainnet",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [process.env.NEXT_PUBLIC_PROVIDER_ETH], // Replace with your provider
          blockExplorerUrls: ["https://etherscan.io"],
        }
      : {
          chainId: "0x2105", // Base Mainnet chainId
          chainName: "Base Mainnet",
          nativeCurrency: { name: "Base", symbol: "BASE", decimals: 18 },
          rpcUrls: [process.env.NEXT_PUBLIC_PROVIDER_BASE], // Replace with your provider
          blockExplorerUrls: ["https://basescan.org"],
        };

  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    const correctChainId = chain === "ethereum" ? "0x1" : "0x2105";

    if (currentChainId !== correctChainId) {
      try {
        // Switch the network to the correct one
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: correctChainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          // If the network isn't added to MetaMask, add it
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkParams],
          });
        } else {
          throw new Error("Failed to switch to the correct network.");
        }
      }
    }
  } catch (err) {
    console.error("Error switching network:", err);
    throw err; // Propagate the error to handle in calling functions
  }
};
