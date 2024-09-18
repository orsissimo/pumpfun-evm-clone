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
  website
) => {
  // Check if name or ticker is empty or null
  if (!name || !ticker) {
    toast.error("Invalid parameters");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY,
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
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(receipt);
    const tokenAddress = await findTokenAddress(tx.hash);
    // Save the token data to the database
    const tokenData = {
      tokenCreator: await signer.getAddress(), // Address of the creator
      tokenFactory: process.env.NEXT_PUBLIC_FACTORY,
      tokenAddress: tokenAddress,
      name: name,
      symbol: ticker,
      initialSupply: 1 * 10 ** 9 * 10 ** 18,
      description: description,
      imageUrl: image,
      twitterLink: twitter,
      telegramLink: telegram,
      websiteLink: website,
      timestamp: await getBlockTimestamp(receipt.blockNumber),
      ethPriceAtTime: await fetchEthPrice(),
    };
    console.log(tokenData);
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
  ethAmount
) => {
  // Check if name or ticker is empty or null
  if (!name || !ticker) {
    toast.error("Invalid parameters");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY,
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

    // console.log(params.toString());
    // console.log(ethAmount);

    // Call the createToken function in the smart contract
    const tx = await factory.createAndBuyToken(...params, {
      value: ethers.utils.parseEther(ethAmount),
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(receipt);
    const tokenAddress = await findTokenAddress(tx.hash);
    // Save the token data to the database
    const tokenData = {
      tokenCreator: await signer.getAddress(), // Address of the creator
      tokenFactory: process.env.NEXT_PUBLIC_FACTORY,
      tokenAddress: tokenAddress,
      name: name,
      symbol: ticker,
      initialSupply: 1 * 10 ** 9 * 10 ** 18,
      description: description,
      imageUrl: image,
      twitterLink: twitter,
      telegramLink: telegram,
      websiteLink: website,
      timestamp: await getBlockTimestamp(receipt.blockNumber),
      ethPriceAtTime: await fetchEthPrice(),
    };
    console.log(tokenData);
    await saveTokenData(tokenData);
    toast("Token Created!");
    return tokenAddress;
  } catch (err) {
    console.error(err);
  }
};
export const buyToken = async (ethAmount, tokenAddress) => {
  if (!tokenAddress) {
    toast.error("Invalid token address");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY,
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
    console.log(decodedLog);
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
      timestamp: await getBlockTimestamp(receipt.blockNumber),
    };
    console.log(eventData);
    // Save the transaction to the database
    await saveTokenTransaction(eventData);

    //toast("Token Purchased!");
  } catch (err) {
    console.error(err);
    toast.error("Token purchase failed");
  }
};

export const sellToken = async (tokenAmount, tokenAddress) => {
  if (!tokenAddress || !tokenAmount) {
    toast.error("Invalid token address or amount");
    return;
  }

  console.log("!!!!", tokenAmount, tokenAddress);

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const token = new ethers.Contract(
      tokenAddress,
      SimpleTokenAbi, // ABI of the token contract
      signer
    );

    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY,
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
      timestamp: await getBlockTimestamp(receipt.blockNumber),
    };
    console.log(eventData);

    // Save the transaction to the database
    await saveTokenTransaction(eventData);

    //toast("Token Sold!");
  } catch (err) {
    console.error(err);
    toast.error("Token sale failed");
  }
};

export const getRecentTokens = async () => {
  try {
    // Collegati al provider Ethereum (ad esempio, MetaMask)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Richiede l'accesso all'account utente
    const signer = provider.getSigner();

    // Inizializza il contratto con l'indirizzo e l'ABI corretti
    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY, // Indirizzo del contratto factory
      SimpleFactoryAbi,
      signer
    );

    // Chiama la funzione view per ottenere i token recenti
    const recentTokens = await factory.getRecentTokens();

    // Mostra gli indirizzi dei token recenti
    /* console.log("Ultimi 100 token creati:", recentTokens); */
    /* toast(`Ultimi 100 token creati: ${recentTokens.join(", ")}`); */
    return recentTokens;
  } catch (err) {
    console.error(err);
  }
};

export const getEthSurplus = async (tokenAddress) => {
  try {
    // Collegati al provider Ethereum (ad esempio, MetaMask)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Richiede l'accesso all'account utente
    const signer = provider.getSigner();

    // Inizializza il contratto con l'indirizzo e l'ABI corretti
    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY, // Indirizzo del contratto factory
      SimpleFactoryAbi,
      signer
    );

    // Chiama la funzione view per ottenere i token recenti
    const ethSurplus = await factory.tokenEthSurplus(tokenAddress);
    return ethSurplus;
  } catch (err) {
    console.error(err);
  }
};

export const getFactoryCap = async () => {
  try {
    // Collegati al provider Ethereum (ad esempio, MetaMask)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Richiede l'accesso all'account utente
    const signer = provider.getSigner();

    // Inizializza il contratto con l'indirizzo e l'ABI corretti
    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY, // Indirizzo del contratto factory
      SimpleFactoryAbi,
      signer
    );

    // Chiama la funzione view per ottenere i token recenti
    const cap = await factory.ethCap();
    return cap;
  } catch (err) {
    console.error(err);
  }
};
