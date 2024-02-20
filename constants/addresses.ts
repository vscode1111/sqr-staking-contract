import { DeployNetworks } from '~types';

export const SQR_STAKING_NAME = 'SQRStaking';
export const SQR_TOKEN_NAME = 'SQRToken';

export enum CONTRACT_LIST {
  SQR_STAKING = 'SQR_STAKING',
}

export const TOKENS: Record<CONTRACT_LIST, DeployNetworks> = {
  SQR_STAKING: {
    bsc: '0xC85AC922880b2eD44a2D9a78739740990B6219f5', //Main
    // bsc: '0x282f8613996343F25FE01f223AB34E6348a2260b', //Prod
  },
};
