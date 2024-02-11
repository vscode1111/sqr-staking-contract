import { DeployNetworks } from '~types';

export const SQR_STAKING_NAME = 'SQRStaking';
export const SQR_TOKEN_NAME = 'SQRToken';

export enum CONTRACT_LIST {
  SQR_STAKING = 'SQR_STAKING',
}

export const TOKENS: Record<CONTRACT_LIST, DeployNetworks> = {
  SQR_STAKING: {
    bsc: '0x77180DFf7A52bd7F1661973cA8D0ef79EbcE5D65', //test
    // bsc: '', //Main
    // bsc: '', //Prod
  },
};
