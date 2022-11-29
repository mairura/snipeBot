export interface txnContents {
  hash: string;
  from: number;
  to: string;
  value: number;
  data: string;
  gasLimit: number;
  gasPrice: number | any;
  nonce: number;
  maxPriorityFeePerGas: number | any;
  maxFeePerGas: number | any;
}

export interface overloads {
  gasLimit: any;
  nonce?: any;
  gasPrice?: number;
  maxPriorityFeePerGas?: number;
  maxFeePerGas?: number;
  value?: number;
}
