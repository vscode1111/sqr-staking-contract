import { Signer } from 'ethers';
import { signMessage } from '~common';

export async function signMessageForStake(signer: Signer, from: string, timestampLimit: number) {
  return signMessage(
    signer,
    // userId,  transactionId,  to, amount,   timestampLimit
    ['string', 'uint32'],
    [from, timestampLimit],
  );
}
