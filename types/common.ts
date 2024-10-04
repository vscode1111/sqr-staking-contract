export interface DeployNetworks {
  bsc: string;
}

export interface Addresses {
  erc20TokenAddress: string;
  web3StakingAddress: string;
}

export type StringNumber = string | number;

export type DeployNetworkKey = keyof DeployNetworks;
