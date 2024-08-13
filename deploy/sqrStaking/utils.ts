import appRoot from 'app-root-path';
// import type { ChalkInstance } from 'chalk';
import { Numeric } from 'ethers';
import {
  formatContractDate,
  formatContractToken,
  printDuration,
  printToken,
} from '~common-contract';
import { ContractConfig, contractConfig, getContractArgs } from '~seeds';
import { verifyArgsRequired } from './deployData';

export function getContractArgsEx() {
  return verifyArgsRequired ? getContractArgs(contractConfig) : undefined;
}

export function formatContractConfig(
  contractConfig: ContractConfig,
  decimals: Numeric,
  tokenName: string,
) {
  const { apr, duration, depositDeadline, limit, minStakeAmount, maxStakeAmount, accountLimit } =
    contractConfig;

  return {
    ...contractConfig,
    apr: printToken(apr, 1, '%'),
    duration: printDuration(duration),
    depositDeadline: formatContractDate(depositDeadline),
    limit: formatContractToken(limit, decimals, tokenName),
    minStakeAmount: formatContractToken(minStakeAmount, decimals, tokenName),
    maxStakeAmount: formatContractToken(maxStakeAmount, decimals, tokenName),
    accountLimit: formatContractToken(accountLimit, decimals, tokenName),
  };
}

export function getSourcePath(contractName: string): string {
  const root = appRoot.toString();
  return `${root}/artifacts/contracts/${contractName}.sol/${contractName}.json`;
}

export async function makeChalk(): Promise<any> {
  return (await import('chalk')).default;
}
