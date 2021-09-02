import { waffle, ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';
import { expect } from 'chai';

import UniswapV2Router01 from '@uniswap/v2-periphery/build/UniswapV2Router01.json';
import { timeTravel, timeSet, timeSave, timeRevert } from './utils/time';

import { MockContract } from 'ethereum-waffle';

import { BinaryOptions, BinToken } from '../client/src/shared/types/typechain';

const ethAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
const daiAddress = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063';

const {
  deployMockContract,
} = waffle;

const DEFAULT_PRICE = 0.0001;
const getTokens = (amount: number, price = DEFAULT_PRICE) => Math.round(amount / price);
const getEthers = (amount: number, price = DEFAULT_PRICE) => amount * price;

const MINUTE = 60;
const INTERVAL = 10 * MINUTE;


describe('BinaryOptions', function() {
  let EthPriceFeed: MockContract;
  let binaryOptions: Contract & BinaryOptions;
  let binToken: BinToken;
  let accounts: Signer[];
  let owner: Signer;
  let sender: Signer;
  let address: { binaryOptions: string, binToken: string, owner: string, sender: string };
  let initialBlockTime: number;
  let snapshotId: number;

  before(async () => {
    // Set base initial time to the begining of a round to avoid unwanted round change during test
    initialBlockTime = Math.floor(Date.now()/1000/INTERVAL)*INTERVAL + 2*INTERVAL;
    await timeSet(initialBlockTime);
  });

  beforeEach(async () => {
    // Take snapshot of blockchain
    snapshotId = await timeSave();
  });

  afterEach(async () => {
    // Revert snapshot and timing
    await timeRevert(snapshotId);
  });

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    sender = accounts[1];

    EthPriceFeed = await deployMockContract(owner, UniswapV2Router01.abi);
    await EthPriceFeed.mock.getAmountsOut.returns([BigInt('0'), BigInt('1000000')]);
    await EthPriceFeed.deployed();

    const BinaryOptions = await ethers.getContractFactory('BinaryOptions');
    binaryOptions = await BinaryOptions.deploy(EthPriceFeed.address, ethAddress, daiAddress) as (Contract & BinaryOptions);
    await binaryOptions.deployed();

    address = {
      binaryOptions: binaryOptions.address,
      binToken: await binaryOptions.token(),
      owner: await owner.getAddress(),
      sender: await sender.getAddress(), 
    }
    binToken = await ethers.getContractAt('BinToken', address.binToken) as unknown as BinToken;
  });

  describe('Eth Price', () => {

    it('Check Initial Eth price', async () => {
      const price = await binaryOptions.getEthPrice();
      console.log(price.div('1000').toNumber());
    });
  });
});