const hre = require('hardhat');
const fs = require('fs');

const networksPath = './client/src/artifacts/contracts/BinaryOptions.sol/networks.json';
const networks = fs.existsSync(networksPath) ? JSON.parse(fs.readFileSync(networksPath) || '{}') : {};

const priceFeeds = {
  eth: '0x9326BFA02ADD2366b30bacB125260Af641031331',
  link: '0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0',
};

async function main() {
  await hre.run('compile');

  // We get the contract to deploy
  const BinaryOptions = await hre.ethers.getContractFactory('BinaryOptions');
  const binaryOptions = await BinaryOptions.deploy(priceFeeds.eth, priceFeeds.link);

  await binaryOptions.deployed();

  networks[hre.network.config.chainId] = { address: binaryOptions.address };
  fs.writeFileSync(networksPath, JSON.stringify(networks));
  console.log('BinaryOptions deployed to:', binaryOptions.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });