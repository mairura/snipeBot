import { MAX_GAS_PRICE, defaultGasLimit, GAS_PRICE } from "../config/index";
import { smartContract, toHex, provider, account } from "../utils/commons";
import { config } from "dotenv";
config();
import { uniswapRouterAddress } from "../ProcessTxns/process";
import { overloads } from "../Interface/interface";
import { ethers } from "ethers";
import { send_message } from "../Telegram/bot";

const wallet_address = process.env.WALLET_ADDRESS;

const abi = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
];

const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

//Approve Function before txs
export const approve = async (token: string, overloads: overloads) => {
  try {
    const contract = new ethers.Contract(token, abi, account);
    const tx = await contract.approve(uniswapRouterAddress, MAX_INT, overloads);
    console.log("Approve tx:", tx);
    console.log("Approve txn Hash:", tx.hash);
    return { success: true, data: `${tx.hash}` };
  } catch (error: any) {
    console.log("Error in Approval Function:", error.message);
    return { success: false, data: `Error in approving token ${error}` };
  }
};

//Implementing the buy function
export const swapExactETHForTokens = async (
  amountOutMin: number,
  path: Array<string>,
  EthAmount: number,
  overloads: overloads
) => {
  try {
    console.log("Function swapExactETHForTokens");
    let value: any = toHex(EthAmount);
    overloads.value = value;
    console.log("Value for swapExactETHForTokens:", value);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
    console.log("Deadline in swapExactETHForTokens:", deadline);

    //Buy transaction
    const tx = await smartContract.swapExactETHForTokens(
      toHex(amountOutMin),
      path,
      wallet_address,
      deadline,
      overloads
    );

    console.log("🙋 🙋 🙋 🙋 Buying at .......");
    console.log("txHash:", tx.hash);

    let token = path[path.length - 1];
    console.log("Token path", token);

    let message = `Successfully bought token`;
    message += `\nYou Successfully bought https://rinkeby.etherscan.io/token/${token} token`;
    message += `\nHere is the txn hash: https://rinkeby.etherscan.io/tx/${tx.hash}`;

    //Telegram bot notification
    await send_message(message);
  } catch (error: any) {
    console.log("Error in swapExactETHForTokens Function", error.message);
    return { success: false, data: `Transaction error ${error}` };
  }
};

//Sell Function
export const swapExactTokensForETHSupportingFeeOnTransferTokens = async (
  amountIn: number,
  amountOutMin: number,
  path: Array<string>,
  overloads: overloads
) => {
  try {
    console.log("swapExactTokensForETHSupportingFeeOnTransferTokens");
    delete overloads.value;

    let value: any = toHex(amountIn);
    overloads["value"] = value;

    const deadline = Math.floor(Date.now() / 1000) + 60 * 1;

    console.log(
      `Deadline ${deadline}, value ${value}, path ${path}, overloads ${overloads}, amountOutMin ${amountOutMin}`
    );

    //Sell Transaction
    const tx =
      await smartContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
        toHex(amountIn),
        toHex(amountOutMin),
        path,
        wallet_address,
        deadline,
        { gasLimit: 1000000 }
      );

    console.log("🤠 🤠 🤠 🤠  Selling at........");
    console.log("Txn Hash:", tx.hash);
  } catch (error: any) {
    console.error(
      "Error in swapExactTokensForETHSupportingFeeOnTransferTokens Function:",
      error.message
    );
  }
};
