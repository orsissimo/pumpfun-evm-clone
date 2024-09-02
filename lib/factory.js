import { ethers } from "ethers";
import { toast } from "react-toastify";

import SimpleTokenAbi from "./abi/SimpleToken.json";
import SimpleFactoryAbi from "./abi/SimpleFactory.json";

export const createToken = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.Contract(
      "0xf8c5593870f56673880bff78077ef7bffb106db9" /* Address della factory di test */,
      SimpleFactoryAbi,
      signer
    );

    const params = ["Missio", "MISS"];

    toast(params.toString());

    // Call the createToken function in the smart contract
    const tx = await factory.createToken(...params);

    await tx.wait(); // Wait for transaction to be mined
    console.log(tx.hash);
    toast("Token Created!");
  } catch (err) {
    console.error(err);
    toast.error(String(err));
  }
};
