export interface DeployNetworks {
  bsc: string;
}

export interface Addresses {
  erc20TokenAddress: string;
  sqrStakingAddress: string;
}

export type StringNumber = string | number;

export type DeployNetworkKey = keyof DeployNetworks;
