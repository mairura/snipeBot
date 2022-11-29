import { ethers } from "ethers";
import smartContractABI from "./swapperABI.json";
import { config } from "dotenv";
config();

export const provider = new ethers.providers.WebSocketProvider(process.env.WSS_URL!);

export const signer = new ethers.Wallet(process.env.PRIVATE_KEY!);
export const account = signer.connect(provider);

export const smartContract = new ethers.Contract(
  "0x6562cC46ff86e5De944dc68CC70FB88710a2941C",
  smartContractABI,
  account
);

export const toHex = (currencyAmount: any) => {
  let hexedAmount = currencyAmount.toString(16);
  return `0x${hexedAmount}`;
};
