const hre = require('hardhat');
const fs = require('fs');

const networksPath = './client/src/artifacts/contracts/BinaryOptions.sol/networks.json';
const networks = fs.existsSync(networksPath) ? JSON.parse(fs.readFileSync(networksPath) || '{}') : {};

async function main() {
  await hre.run('compile');

  // We get the contract to deploy
  const BinaryOptions = await hre.ethers.getContractFactory('BinaryOptions');
  const binaryOptions = await BinaryOptions.deploy();

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