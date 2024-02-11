import { arrayify } from '@ethersproject/bytes';
import { Signer, keccak256, solidityPackedKeccak256, toUtf8Bytes } from 'ethers';
import { MerkleTree } from 'merkletreejs';

export function keccak256FromStr(data: string): string {
  return keccak256(toUtf8Bytes(data));
}

export async function signMessage(
  signer: Signer,
  types: readonly string[],
  values: readonly any[],
) {
  const hash = solidityPackedKeccak256(types, values);
  const messageHashBin = arrayify(hash);
  return signer.signMessage(messageHashBin);
}

export function getMerkleRootHash(whitelist: string[]) {
  let leaves = whitelist.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return merkleTree.getHexRoot();
}

export function getMerkleProofs(whitelist: string[], account: string) {
  let leaves = whitelist.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  let hashedAddress = keccak256(account);
  return merkleTree.getHexProof(hashedAddress);
}
