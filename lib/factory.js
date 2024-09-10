import { ethers } from "ethers";
import { toast } from "react-toastify";

import SimpleTokenAbi from "./abi/SimpleToken.json";
import SimpleFactoryAbi from "./abi/SimpleFactory.json";

// Updated createToken function to accept name and ticker as parameters
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

    // console.log(params.toString());

    // Call the createToken function in the smart contract
    const tx = await factory.createToken(...params);

    await tx.wait(); // Wait for transaction to be mined
    console.log(tx.hash);
    toast("Token Created!");
  } catch (err) {
    console.error(err);
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

    await tx.wait(); // Wait for transaction to be mined
    console.log(tx.hash);
    toast("Token Created!");
  } catch (err) {
    console.error(err);
  }
};

export const buyToken = async (ethAmount, tokenAddress) => {
  // Check if tokenAddress is empty or null
  if (!tokenAddress) {
    toast.error("Invalid token address");
    return;
  }

  try {
    // Initialize the Web3 provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY,
      SimpleFactoryAbi,
      signer
    );

    // Define the amount of Ether to send for the token purchase
    const purchaseAmount = ethers.utils.parseEther(ethAmount); // Change this to the appropriate amount

    // Call the buyToken function in the smart contract with a payable value
    const tx = await factory.buyToken(
      tokenAddress,
      BigInt(99999999999999999999999999999),
      {
        value: purchaseAmount,
      }
    );

    // Wait for the transaction to be mined
    await tx.wait();

    // Log the transaction hash and display success message
    console.log(tx.hash);
    toast("Token Purchased!");
  } catch (err) {
    console.error(err);
  }
};

export const sellToken = async (tokenAmount, tokenAddress) => {
  // Check if tokenAddress or tokenAmount is empty or null
  if (!tokenAddress || !tokenAmount) {
    toast.error("Invalid token address or amount");
    return;
  }

  try {
    // Initialize the Web3 provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a contract instance for the token contract
    const token = new ethers.Contract(
      tokenAddress,
      SimpleTokenAbi, // ABI of the token contract
      signer
    );

    // Create a contract instance for the factory contract
    const factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY,
      SimpleFactoryAbi, // ABI of the factory contract
      signer
    );

    // Define the amount of token to approve and sell
    const sellAmount = ethers.utils.parseEther(tokenAmount); // Convert tokenAmount to the correct format

    // Approve the factory to spend the tokens
    const approveTx = await token.approve(factory.address, sellAmount);

    // Wait for the approval transaction to be mined
    await approveTx.wait();

    // Call the sellToken function on the factory contract to sell the approved tokens
    const tx = await factory.sellToken(tokenAddress, sellAmount);

    // Wait for the transaction to be mined
    await tx.wait();

    // Log the transaction hash and display success message
    console.log(tx.hash);
    toast("Token Sold");
  } catch (err) {
    console.error(err);
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
