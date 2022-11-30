import { ethers, providers } from "ethers";
import { txnContents, overloads } from "../Interface/interface";
import { config } from "dotenv";
config();
import ABI from "../utils/contractABI.json";
import { provider } from "../StreamTxns/stream";
import {
  TOKEN_AMOUNT_TO_BUY,
  GAS_PRICE,
  SAIswapToken,
  TOKEN_TO_MONITOR,
  default_gas_limit,
} from "../config/index";
import { swapExactETHForTokens, approve } from "../uniswap/index";

//Get our wallet address
const wallet_address = process.env.WALLET_ADRESS;

//Methods to exclude
const exclude_methods = ["0x", "0x0"];

//Uniswap Router V2 Address
export const uniswapRouterAddress =
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

//Token to monitor
let tokentoMonitor: any = TOKEN_TO_MONITOR.map((token: string) =>
  token.toLowerCase()
);
// console.log(tokenstoMonitor);

// let token_to_swipe = process.env.TOKEN_TO_SWIPE;
// console.log("Swipe Token:", token_to_swipe);

//Interface abstracts the encoding and decoding required to interact with contracts on eth network
const inter = new ethers.utils.Interface(ABI);
// console.log(inter);

//Process the Data
export const processData = async (txnContents: txnContents) => {
  try {
    const router = txnContents.to;
    // console.log(router);

    //Get txn data
    const data = txnContents.data;
    // console.log("Data:", data);

    if (router == uniswapRouterAddress) {
      //Decode the data
      const decode_data = inter.parseTransaction({ data });
      // console.log("Now you can read decoded Data:", decode_data);

      // let path: Array<string> = [];
      // if (decode_data.args["path"]) {
      //   path = decode_data.args["path"];
      // } else if (decode_data.args.at(-3)) {
      //   path = decode_data.args.at(-3);
      // }

      // console.log("Path:", path);

      //Get Method name
      let methodName = decode_data["name"];
      // console.log("Method Name:", methodName);

      //Set gas price
      let gasPrice = parseInt(txnContents.gasPrice?._hex!, 16);
      // console.log("Gas Price Set at:", gasPrice);

      let maxFeePerGas: number | undefined;
      let maxPriorityFeePerGas: number | undefined;
      let overloads: overloads;

      if (txnContents.maxFeePerGas && txnContents.maxPriorityFeePerGas) {
        maxFeePerGas = parseInt(txnContents.maxFeePerGas._hex!, 16);
        maxPriorityFeePerGas = parseInt(
          txnContents.maxPriorityFeePerGas._hex!,
          16
        );
      }

      //Nonce to track txn count
      const nonce = await provider.getTransactionCount(
        process.env.WALLET_ADDRESS!
      );
      // console.log("Nonce:", nonce);

      if (isNaN(maxFeePerGas!)) {
        overloads = {
          gasPrice,
          gasLimit: default_gas_limit,
          nonce: nonce,
        };
      } else {
        overloads = {
          gasLimit: default_gas_limit,
          nonce: nonce,
          maxFeePerGas,
          maxPriorityFeePerGas,
        };
      }

      // console.log("MaxFeePerGas:", maxFeePerGas);
      // console.log("MaxPriorityFeePerGas:", maxPriorityFeePerGas);
      // console.log("Nonce:", nonce);
      // console.log("Overloads:", overloads);

      //Check if txn method name is add liqudity
      if (methodName == "addLiquidity") {
        console.log("Method found:", methodName);
        let token;
        let tokenA = decode_data.args.tokenA;
        let tokenB = decode_data.args.tokenB;

        // console.log("Token A", tokenA.toLowerCase());
        // console.log("Token B", tokenB.toLowerCase());

        //Check if token is in list to monitor
        if (tokentoMonitor.includes(tokenA.toLowerCase())) {
          token = tokenA;
        } else if (tokentoMonitor.includes(tokenB.toLowerCase())) {
          token = tokenB;
        }

        if (token) {
          console.log("Token captured on addLiquidity Method is:", token);

          //Get path
          let path = [SAIswapToken, token];
          console.log("AddLiquidity Path Found:", path);

          const buyTx: any = await swapExactETHForTokens(
            0,
            path,
            TOKEN_AMOUNT_TO_BUY,
            overloads
          );

          //Broadcast txn if txn is successful
          if (buyTx.success == true) {
            const txn = await provider.waitForTransaction(buyTx.data, 1, 10000);

            if (txn && txn.status == 1) {
              overloads["nonce"] += 1;
              delete overloads["value"];

              //Approve token after buying for transfer
              await approve(token, overloads);
              console.log("Token approved successfully 🎉 ");
            }
          }
        }
      } else if (methodName == "addLiquidityETH") {
        console.log("Method Found:", methodName);

        let token = decode_data.args.token.toLowerCase();

        // console.log("Token at addLiquidityETH is:", token);

        if (token) {
          console.log("Token captured is:", token);

          let path = [SAIswapToken, token];
          console.log(path);

          //Nonce to track txn count
          const nonce = await provider.getTransactionCount(
            process.env.WALLET_ADDRESS!
          );
          // console.log("Nonce:", nonce);

          const buyTx: any = await swapExactETHForTokens(
            0,
            path,
            TOKEN_AMOUNT_TO_BUY,
            overloads
          );

          //Broadcast txn if txn is successful
          if (buyTx.success == true) {
            const txn = await provider.waitForTransaction(buyTx.data, 1, 10000);

            if (txn && txn.status == 1) {
              overloads["nonce"] += 1;
              delete overloads["value"];

              //Approve token after buying for transfer
              await approve(token, overloads);
              console.log("Token approved successfully:", approve);
            }
          }
        }
      }
    } else if (tokentoMonitor == router) {
      // let gasPrice = parseInt(txnContents.gasPrice?._hex!, 16);
    }
  } catch (error: any) {
    console.log(error.message);
  }
};
