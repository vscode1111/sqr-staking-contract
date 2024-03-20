import appRoot from 'app-root-path';
import { ChalkInstance } from 'chalk';
import { getContractArgs } from '~seeds';
import { deployContractConfig, verifyArgsRequired } from './deployData';

export function getContractArgsEx() {
  return verifyArgsRequired ? getContractArgs(deployContractConfig) : undefined;
}

export function getSourcePath(contractName: string): string {
  const root = appRoot.toString();
  return `${root}/artifacts/contracts/${contractName}.sol/${contractName}.json`;
}

export async function makeChalk(): Promise<ChalkInstance> {
  return (await import('chalk')).default;
}
