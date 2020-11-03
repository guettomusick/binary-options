import { ethers } from 'hardhat';

const send = (method: string, params: any[] = []) =>
  ethers.provider.send(method, params);

export const timeTravel = async (seconds: number) => {
  await send('evm_increaseTime', [seconds]);
  await send('evm_mine');
};

export const timeSet = async (seconds: number) => {
  await send('evm_setNextBlockTimestamp', [seconds]);
  await send('evm_mine');
}

export const timeSave = async () =>
  await send('evm_snapshot');

export const timeRevert = async (id: number) =>
  await send('evm_revert', [id]);
