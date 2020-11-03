import { run, ethers, network } from 'hardhat';
import * as fs from 'fs';

const networksPath = './client/src/config/networks.json';
const networks = fs.existsSync(networksPath) ? JSON.parse(fs.readFileSync(networksPath).toString() || '{}') : {};

const priceFeeds = {
  1: {
    eth: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    link: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
  },
  4: {
    eth: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
    link: '0xd8bD0a1cB028a31AA859A21A3758685a95dE4623',
  },
  42: {
    eth: '0x9326BFA02ADD2366b30bacB125260Af641031331',
    link: '0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0',
  },
  default: {
    // TODO: Invalid, just for deploying ok
    eth: '0x9326BFA02ADD2366b30bacB125260Af641031331',
    link: '0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0',
  }
};

async function main() {
  await run('compile');

  const priceFeed = priceFeeds[network.config.chainId] || priceFeeds.default;

  // We get the contract to deploy
  const BinaryOptions = await ethers.getContractFactory('BinaryOptions');
  const binaryOptions = await BinaryOptions.deploy(priceFeed.eth, priceFeed.link);

  await binaryOptions.deployed();

  if (!networks.BinaryOptions) {
    networks.BinaryOptions = {};
  }
  networks.BinaryOptions[network.config.chainId] = { address: binaryOptions.address };
  fs.writeFileSync(networksPath, JSON.stringify(networks));
  console.log('BinaryOptions deployed to:', binaryOptions.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });