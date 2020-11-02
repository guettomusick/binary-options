/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-ethers');
const fs = require('fs');

const mnemonic = fs.readFileSync('.secret').toString().trim();

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
    },
    ganache: {
      url: 'http://127.0.0.1:8545',
      chainId: 1337,
    },
    ropsten: {
      url: 'https://ropsten.infura.io/v3/2ff6f33efc85489db0c63eb24d007492',
      chainId: 3,
      accounts: { mnemonic },
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/2ff6f33efc85489db0c63eb24d007492',
      chainId: 4,
      accounts: { mnemonic },
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/2ff6f33efc85489db0c63eb24d007492',
      chainId: 42,
      accounts: { mnemonic },
    },
  },
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './client/src/artifacts',
  },
};
