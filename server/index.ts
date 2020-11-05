import { ethers } from 'ethers';

import * as fs from 'fs';

const mnemonic = fs.readFileSync('.secret').toString().trim();

import BinaryOptions from '../client/src/artifacts/contracts/BinaryOptions.sol/BinaryOptions.json';
import Networks from '../client/src/config/networks.json';

let prevRoundTime = 0;

async function main() {
  const provider = ethers.getDefaultProvider('rinkeby', {
    infura: '2ff6f33efc85489db0c63eb24d007492',
  });
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(Networks.BinaryOptions['4'].address, BinaryOptions.abi, signer);

  setInterval(async () => {
    const lastRoundTime = Math.floor(Date.now()/1000/600)*600;
    if (prevRoundTime !== lastRoundTime) {
      try {
        const lastRound = await contract.rounds(lastRoundTime);
        if (!lastRound.executed && lastRound.options > 0) {
          await contract.executeRound(lastRoundTime);
          console.log(`Executed round ${lastRoundTime}`);
        } else {
          console.log(lastRound.executed
            ? `Round ${lastRoundTime} already executed`
            : `No options at Round ${lastRoundTime}`
          );
        }
        prevRoundTime = lastRoundTime;
      } catch(error) {
        console.error(error);
      }
    }
  }, 5000);
};

main();
