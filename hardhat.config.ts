import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-gas-reporter';
import 'hardhat-spdx-license-identifier';
import 'hardhat-contract-sizer';
import {removeConsoleLog} from 'hardhat-preprocessor';

import { task, HardhatUserConfig } from 'hardhat/config';
import * as fs from 'fs';

const mnemonic = fs.readFileSync('.secret').toString().trim();

task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('signer', 'Prints the owner and contract creator', async (args, hre) => {
  const wallet = await hre.ethers.Wallet.fromMnemonic(mnemonic);

  console.log(wallet.address);
  console.log(wallet.privateKey);
});

const config: HardhatUserConfig = {
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
    fuse: {
      url: 'https://rpc.fuse.io',
      chainId: 122,
      accounts: { mnemonic },
    },
    bncTestnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: { mnemonic }
    },
    matic: {
      url: 'https://polygon-mainnet.g.alchemy.com/v2/o7LxJAavPv1Ph5QH63qoARjG34LFovhC',
      chainId: 137,
      gasPrice: 10000000000,
      accounts: { mnemonic }
    },
    mumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/o7LxJAavPv1Ph5QH63qoARjG34LFovhC',
      chainId: 80001,
      gasPrice: 10000000000,
      accounts: { mnemonic }
    },
    bncMainnet: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice: 20000000000,
      accounts: { mnemonic }
    }
  },
  solidity: {
    compilers: [{
      version: '0.8.7',
      settings: {
        optimizer: {
          enabled: true,
          runs: 10000
        }
      }
    },{
      version: '0.6.12',
      settings: {
        optimizer: {
          enabled: true,
          runs: 10000
        }
      }
    },{
      version: '0.5.16',
      settings: {
        optimizer: {
          enabled: true,
          runs: 10000
        }
      }
    }]
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './client/src/artifacts',
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 21
  },
  typechain: {
    outDir: 'client/src/shared/types/typechain',
    target: 'ethers-v5',
  },
  
  preprocess: {
    eachLine: removeConsoleLog((bre) => bre.network.name !== 'hardhat' && bre.network.name !== 'localhost'),
  },
  contractSizer: {
    alphaSort: false,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
};

export default config;
