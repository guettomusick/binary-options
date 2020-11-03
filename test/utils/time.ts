import { ethers } from 'hardhat';

const send = (method, params = []) =>
  ethers.provider.send(method, params);

export const timeTravel = async seconds => {
  await send('evm_increaseTime', [seconds])
  await send('evm_mine')
};
