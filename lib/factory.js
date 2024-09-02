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
      "0x568Ec30D8B43f583d8bad178B9ADFb9469694203",
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
