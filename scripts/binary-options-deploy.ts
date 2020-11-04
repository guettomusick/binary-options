import { run, ethers, network } from 'hardhat';
import * as fs from 'fs';

import { priceFeeds } from '../client/src/config';

const networksPath = './client/src/config/networks.json';
const networks = fs.existsSync(networksPath) ? JSON.parse(fs.readFileSync(networksPath).toString() || '{}') : {};

async function main() {
  await run('compile');

  const priceFeed = priceFeeds[network.config.chainId || 'default'] || priceFeeds.default;

  // We get the contract to deploy
  const BinaryOptions = await ethers.getContractFactory('BinaryOptions');
  const binaryOptions = await BinaryOptions.deploy(priceFeed.eth);

  await binaryOptions.deployed();

  if (!networks.BinaryOptions) {
    networks.BinaryOptions = {};
  }
  networks.BinaryOptions[network.config.chainId || 'default'] = { address: binaryOptions.address };
  fs.writeFileSync(networksPath, JSON.stringify(networks));
  console.log('BinaryOptions deployed to:', binaryOptions.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });