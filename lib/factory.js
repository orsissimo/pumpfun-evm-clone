import { ethers } from "ethers";
import { toast } from "react-toastify";

import SimpleTokenAbi from "./abi/SimpleToken.json";
import SimpleFactoryAbi from "./abi/SimpleFactory.json";

// Updated createToken function to accept name and ticker as parameters
export const createToken = async (name, ticker) => {
  // Check if name or ticker is empty or null
  if (!name || !ticker) {
    toast.error("Invalid parameters");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      "0x947fD87ec69e47C451F1A0348C0fA7F81166908b",
      SimpleFactoryAbi,
      signer
    );

    const params = [name, ticker];

    toast(params.toString());

    // Call the createToken function in the smart contract
    const tx = await factory.createToken(...params);

    await tx.wait(); // Wait for transaction to be mined
    console.log(tx.hash);
    toast("Token Created!");
  } catch (err) {
    console.error(err);
    /* toast.error(String(err)); */
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
      "0x947fD87ec69e47C451F1A0348C0fA7F81166908b", // Indirizzo del contratto factory
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
    toast.error(String(err));
  }
};
