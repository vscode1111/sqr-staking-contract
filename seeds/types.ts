export interface ContractConfig {
  newOwner: string;
  erc20Token: string;
  duration: number;
  apr: number;
  depositDeadline: number;
  limit: bigint;
  minStakeAmount: bigint;
  maxStakeAmount: bigint;
}

export type DeployContractArgs = [
  newOwner: string,
  erc20Token: string,
  duration: number,
  apr: number,
  depositDeadline: number,
  limit: bigint,
  minStakeAmount: bigint,
  maxStakeAmount: bigint,
];

export interface TokenConfig {
  name: string;
  symbol: string;
  newOwner: string;
  initMint: bigint;
  decimals: number;
}

export type DeployTokenArgs = [
  name_: string,
  symbol_: string,
  newOwner: string,
  initMint: bigint,
  decimals_: bigint | number,
];
