import { PriceFeed } from './../client/src/config';
import { run, ethers, network } from 'hardhat';
import * as fs from 'fs';

import { priceFeeds } from '../client/src/config';

const networksPath = './client/src/config/networks.json';
const networks = fs.existsSync(networksPath) ? JSON.parse(fs.readFileSync(networksPath).toString() || '{}') : {};

async function main() {
  await run('compile');
  let priceFeed: PriceFeed;

  if (!networks.uniswapV2Router) {
    networks.uniswapV2Router = {};
  }

  // if (network.config.chainId === 1) {
  //   priceFeed = priceFeeds['1'];  
  //   networks.uniswapV2Router['1'] = { address:  priceFeed };
  // } else if (network.config.chainId === 137) {
    priceFeed = priceFeeds['137'];  
    
    networks.uniswapV2Router['137'] = { address:  priceFeed.router };
    
  // } else if (!networks.uniswapV2Router[network.config.chainId || 'default']) {
  //   const TestUniswapV2Router = await ethers.getContractFactory('UniswapV2Router');
  //   const testUniswapV2Router = await TestUniswapV2Router.deploy();
  //   priceFeed = { router: testUniswapV2Router.address };

  //   networks.uniswapV2Router[network.config.chainId || 'default'] = { address: testUniswapV2Router.address };
  //   console.log('TestUniswapV2Router deployed to:', testUniswapV2Router.address);
  //   await new Promise((resolve) => setTimeout(resolve, 30000));
  // } else {
  //   priceFeed = networks.uniswapV2Router[network.config.chainId || 'default'].address;
  // }

  // We get the contract to deploy
  const BinaryOptions = await ethers.getContractFactory('BinaryOptions');
  const binaryOptions = await BinaryOptions.deploy(priceFeed.router, priceFeed.eth, priceFeed.dai) as any;

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