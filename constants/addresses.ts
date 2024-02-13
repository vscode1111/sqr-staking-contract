import { DeployNetworks } from '~types';

export const SQR_STAKING_NAME = 'SQRStaking';
export const SQR_TOKEN_NAME = 'SQRToken';

export enum CONTRACT_LIST {
  SQR_STAKING = 'SQR_STAKING',
}

export const TOKENS: Record<CONTRACT_LIST, DeployNetworks> = {
  SQR_STAKING: {
    bsc: '0x55ec3885156B60fBC5940A79aAa15444f2FA9981', //test
    // bsc: '', //Main
    // bsc: '', //Prod
  },
};
