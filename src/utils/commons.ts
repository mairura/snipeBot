import { ethers } from "ethers";
import smartContractABI from "./contractABI.json";
import { config } from "dotenv";
config();

//Get wallet Address
const wallet_address = process.env.WALLET_ADDRESS;

//Set provider
export const provider = new ethers.providers.WebSocketProvider(
  process.env.WSS_URL!
);

export const signer = new ethers.Wallet(process.env.PRIVATE_KEY!);
export const account = signer.connect(provider);

export const smartContract = new ethers.Contract(
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  smartContractABI,
  account
);

export function toHex(amount: any) {
  if (amount.toString().includes("e")) {
    let hexedAmount = amount.toString(16);
    return `0x${hexedAmount}`;
  } else {
    let parsed_amount = parseInt(amount);
    let hexedAmount = parsed_amount.toString(16);
    return `0x${hexedAmount}`;
  }
}

//Get token Balance Function
export const getTokenBalance = async (token: string) => {
  try {
    let token_contract = new ethers.Contract(token, smartContractABI, provider);
    const balance = await token_contract.balanceOf(wallet_address);
    return balance;
  } catch (error: any) {
    console.log("Error in getting token balance:", error.message);
  }
};

//Get token amoun to sell
export const getTokenAmountToSell = async (
  sell_percentage: number,
  token: string
) => {
  try {
    let tokens: any = await getTokenBalance(token);
    return Math.trunc(tokens * (sell_percentage / 100));
  } catch (error: any) {
    console.log("Error in getting token amount to sell:", error.message);
  }
};

//Function for getting amount of ETH to receive
export const getAmountOutETH = async (amountIn: number, path: string[]) => {
  try {
    console.log(`AmountIn, ${amountIn}`);

    const amounts = await smartContract.getAmountOut(amountIn, path);

    console.log(`Amounts, ${amounts}, path ${path}`);

    const outAmount = amounts[amounts.length - 1];
    return parseInt(outAmount._hex!, 16);
  } catch (error: any) {
    console.log("Error in getting amount out min:", error.message);
  }
};
