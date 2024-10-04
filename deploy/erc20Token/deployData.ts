import { toWei } from '~common';
import { TokenConfig, erc20Decimals, tokenConfig } from '~seeds';

export const verifyRequired = false;
export const verifyArgsRequired = true;

const mainTokenConfig: Partial<TokenConfig> = {
  name: 'Magic Square Test2',
  symbol: 'tWEB32',
  initMint: toWei(1_000_000_000_000, erc20Decimals),
};

export const deployTokenConfig: TokenConfig = {
  ...tokenConfig,
  ...mainTokenConfig,
};
