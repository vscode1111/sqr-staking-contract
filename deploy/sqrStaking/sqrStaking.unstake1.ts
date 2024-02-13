import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { user1Address, user1SQRStaking } = context;

    console.log(`${SQR_STAKING_NAME} ${user1Address} is unstaking...`);

    const stakesCount = await user1SQRStaking.getStakesCount(user1Address);
    console.log(`${SQR_STAKING_NAME} ${stakesCount} found...`);

    let withdrawId;

    for (let i = 0; i < stakesCount; i++) {
      const stakingData = await user1SQRStaking.stakingData(user1Address, i);
      const [amount, stakedAt, StakingTypeID, withdrawn] = stakingData;

      console.log(
        `${SQR_STAKING_NAME} Stake of ${amount} made at ${stakedAt} stake option ${StakingTypeID} withdrawn ${withdrawn} `,
      );
      if (!withdrawn) {
        console.log(
          `${SQR_STAKING_NAME} Found stake of ${user1Address}. ID: ${withdrawId}. Unstaking.`,
        );
        await waitTx(user1SQRStaking.unstake(i), 'unstake');
      }
    }
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:unstake1`];

export default func;
