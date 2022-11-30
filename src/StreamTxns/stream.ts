import { ethers } from "ethers";
import { config } from "dotenv";
import { processData } from "../ProcessTxns/process";
import { txnContents } from "../Interface/interface";

config();

//Set up a Provider to give access to the blockchain
export const provider = new ethers.providers.WebSocketProvider(
  process.env.WSS_URL!
);

//Stream data from the mempool
const streamData = async () => {
  const txnData = await provider.on("pending", async (txHash) => {
    try {
      const transaction: any = await provider.getTransaction(txHash);

      if (transaction) {
        const txDataContents: txnContents = {
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to!,
          value: transaction.value,
          data: transaction.data,
          gasLimit: transaction.gasLimit,
          gasPrice: transaction.gasPrice!,
          nonce: transaction.nonce,
          maxPriorityFeePerGas: transaction.maxPriorityFeePerGas!,
          maxFeePerGas: transaction.maxFeePerGas!,
        };
        await processData(txDataContents);
      }
    } catch (error) {
      console.log(error);
    }
  });
};
streamData();
