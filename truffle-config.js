
const fs = require('fs');
const path = require('path');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = fs.readFileSync('.secret').toString().trim();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'wss://ropsten.infura.io/ws/v3/2ff6f33efc85489db0c63eb24d007492');
      },
      network_id: '3',
      gas: 5500000,
      gasPrice: 3000000000,
      timeoutBlocks: 50,
      websockets: true,
      from: ""
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'wss://rinkeby.infura.io/ws/v3/2ff6f33efc85489db0c63eb24d007492');
      },
      network_id: '4',
      gas: 5500000,
      gasPrice: 3000000000,
      timeoutBlocks: 50,
      websockets: true,
      from: ""
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'wss://kovan.infura.io/ws/v3/2ff6f33efc85489db0c63eb24d007492');
      },
      network_id: '42',
      gas: 5500000,
      gasPrice: 3000000000,
      timeoutBlocks: 50,
      websockets: true,
      from: ""
    },
  }
};
