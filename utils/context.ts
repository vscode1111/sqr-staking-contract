import { DeployProxyOptions } from '@openzeppelin/hardhat-upgrades/dist/utils';
import { ethers, upgrades } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getNetworkName } from '~common';
import { SQR_STAKING_NAME, SQR_TOKEN_NAME, TOKENS } from '~constants';
import { ContractConfig, getContractArgs, getTokenArgs } from '~seeds';
import { SQRStaking } from '~typechain-types/contracts/SQRStaking';
import { SQRToken } from '~typechain-types/contracts/SQRToken';
import { SQRStaking__factory } from '~typechain-types/factories/contracts/SQRStaking__factory';
import { SQRToken__factory } from '~typechain-types/factories/contracts/SQRToken__factory';
import {
  Addresses,
  ContextBase,
  DeployNetworks,
  SQRStakingContext,
  SQRTokenContext,
  Users,
} from '~types';

const OPTIONS: DeployProxyOptions = {
  initializer: 'initialize',
  kind: 'uups',
};

export function getAddresses(network: keyof DeployNetworks): Addresses {
  const sqrStakingAddress = TOKENS.SQR_STAKING[network];
  return {
    sqrStakingAddress,
  };
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
  return getAddresses(getNetworkName(hre));
}

export async function getUsers(): Promise<Users> {
  const [owner, user1, user2, user3, owner2, coldWallet] = await ethers.getSigners();

  const ownerAddress = await owner.getAddress();
  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();
  const user3Address = await user3.getAddress();
  const owner2Address = await owner2.getAddress();
  const coldWalletAddress = await coldWallet.getAddress();

  return {
    owner,
    ownerAddress,
    user1,
    user1Address,
    user2,
    user2Address,
    user3,
    user3Address,
    owner2,
    owner2Address,
    coldWallet,
    coldWalletAddress,
  };
}

export async function getSQRTokenContext(
  users: Users,
  deployData?: string | { newOnwer: string },
): Promise<SQRTokenContext> {
  const { owner, user1, user2, user3, owner2, owner2Address, coldWallet } = users;

  const testSQRTokenFactory = (await ethers.getContractFactory(
    SQR_TOKEN_NAME,
  )) as unknown as SQRToken__factory;

  let ownerSQRToken: SQRToken;

  if (typeof deployData === 'string') {
    ownerSQRToken = testSQRTokenFactory.connect(owner).attach(deployData) as SQRToken;
  } else {
    const newOnwer = deployData?.newOnwer ?? owner2Address;
    ownerSQRToken = await testSQRTokenFactory.connect(owner).deploy(...getTokenArgs(newOnwer));
  }

  const sqrTokenAddress = await ownerSQRToken.getAddress();

  const user1SQRToken = ownerSQRToken.connect(user1);
  const user2SQRToken = ownerSQRToken.connect(user2);
  const user3SQRToken = ownerSQRToken.connect(user3);
  const owner2SQRToken = ownerSQRToken.connect(owner2);
  const coldWalletSQRToken = ownerSQRToken.connect(coldWallet);

  return {
    sqrTokenAddress,
    ownerSQRToken,
    user1SQRToken,
    user2SQRToken,
    user3SQRToken,
    owner2SQRToken,
    coldWalletSQRToken,
  };
}

export async function getSQRStakingContext(
  users: Users,
  deployData?: string | ContractConfig,
): Promise<SQRStakingContext> {
  const { owner, user1, user2, user3, owner2, coldWallet } = users;

  const sqrStakingFactory = (await ethers.getContractFactory(
    SQR_STAKING_NAME,
  )) as unknown as SQRStaking__factory;
  const owner2SqrStakingFactory = (await ethers.getContractFactory(
    SQR_STAKING_NAME,
    owner2,
  )) as unknown as SQRStaking__factory;

  let ownerSQRStaking: SQRStaking;

  if (typeof deployData === 'string') {
    ownerSQRStaking = sqrStakingFactory.connect(owner).attach(deployData) as SQRStaking;
  } else {
    ownerSQRStaking = (await upgrades.deployProxy(
      sqrStakingFactory,
      getContractArgs(
        deployData?.newOwner ?? '',
        deployData?.sqrToken ?? '',
        // deployData?.coldWallet ?? '',
        // deployData?.balanceLimit ?? BigInt(0),
      ),
      OPTIONS,
    )) as unknown as SQRStaking;
  }

  const sqrStakingAddress = await ownerSQRStaking.getAddress();

  const user1SQRStaking = ownerSQRStaking.connect(user1);
  const user2SQRStaking = ownerSQRStaking.connect(user2);
  const user3SQRStaking = ownerSQRStaking.connect(user3);
  const owner2SQRStaking = ownerSQRStaking.connect(owner2);
  const coldWalletSQRStaking = ownerSQRStaking.connect(coldWallet);

  return {
    sqrStakingFactory,
    owner2SqrSkakingFactory: owner2SqrStakingFactory,
    sqrStakingAddress,
    ownerSQRStaking,
    user1SQRStaking,
    user2SQRStaking,
    user3SQRStaking,
    owner2SQRStaking,
    coldWalletSQRStaking,
  };
}

export async function getContext(
  sqrTokenAddress: string,
  sqrStakingAddress: string,
): Promise<ContextBase> {
  const users = await getUsers();
  const sqrTokenContext = await getSQRTokenContext(users, sqrTokenAddress);
  const sqrStakingContext = await getSQRStakingContext(users, sqrStakingAddress);

  return {
    ...users,
    ...sqrTokenContext,
    ...sqrStakingContext,
  };
}
