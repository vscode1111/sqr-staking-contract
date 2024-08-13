import { toWei } from '~common';
import { erc20Decimals } from '~seeds';

export const verifyRequired = false;
export const verifyArgsRequired = true;

export const deployData = {
  companyReward: toWei(10_0000, erc20Decimals),
  // allowance: toWei(1_000_000, erc20Decimals),
  // stake1: toWei(123.12345678, erc20Decimals),
  allowance: toWei(10_0000, erc20Decimals),
  stake1: toWei(1, erc20Decimals),
  // stake1: toWei(551.337, erc20Decimals),
  stake2: toWei(345.12345678, erc20Decimals),
  stake3: toWei(678.12345678, erc20Decimals),
  userStakeId1_0: 0,
  userStakeId2_0: 0,
  userStakeId3_0: 0,
};
