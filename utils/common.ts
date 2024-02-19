import { Signer } from 'ethers';
import { signMessage } from '~common';

export async function signMessageForDeposit(
  signer: Signer,
  userId: string,
  transactionId: string,
  amount: bigint,
  timestampLimit: number,
) {
  return signMessage(
    signer,
    // userId,  transactionId, amount, timestampLimit
    ['string', 'string', 'uint256', 'uint32'],
    [userId, transactionId, amount, timestampLimit],
  );
}
