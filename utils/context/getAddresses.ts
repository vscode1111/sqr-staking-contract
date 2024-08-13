import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getNetworkName } from '~common-contract';
import { CONTRACTS } from '~constants';
import { Addresses, DeployNetworks } from '~types';

export function getAddresses(network: keyof DeployNetworks): Addresses {
  const erc20TokenAddress = CONTRACTS.ERC20_TOKEN[network];
  const sqrStakingAddress = CONTRACTS.SQR_STAKING[network];
  return {
    erc20TokenAddress,
    sqrStakingAddress,
  };
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
  return getAddresses(getNetworkName(hre));
}
