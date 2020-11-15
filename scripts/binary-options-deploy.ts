import { run, ethers, network } from 'hardhat';
import * as fs from 'fs';

import priceFeeds from '../client/src/config/priceFeed.json';

const networksPath = './client/src/config/networks.json';
const networks = fs.existsSync(networksPath) ? JSON.parse(fs.readFileSync(networksPath).toString() || '{}') : {};

async function main() {
  await run('compile');
  let priceFeed;

  if (!networks.UniswapV2Pair) {
    networks.UniswapV2Pair = {};
  }

  if (network.config.chainId === 1) {
    priceFeed = priceFeeds['1'].eth_dai;  
    networks.UniswapV2Pair['1'] = { address:  priceFeed };
  } else if (!networks.UniswapV2Pair[network.config.chainId || 'default']) {
    const TestUniswapV2Pair = await ethers.getContractFactory('UniswapV2Pair');
    const testUniswapV2Pair = await TestUniswapV2Pair.deploy();
    priceFeed = testUniswapV2Pair.address;

    networks.UniswapV2Pair[network.config.chainId || 'default'] = { address: testUniswapV2Pair.address };
    console.log('TestUniswapV2Pair deployed to:', testUniswapV2Pair.address);
    await new Promise((resolve) => setTimeout(resolve, 30000));
  } else {
    priceFeed = networks.UniswapV2Pair[network.config.chainId || 'default'].address;
  }

  // We get the contract to deploy
  const BinaryOptions = await ethers.getContractFactory('BinaryOptions');
  const binaryOptions = await BinaryOptions.deploy(priceFeed);

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