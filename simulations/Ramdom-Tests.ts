import { waffle, ethers } from 'hardhat';
import { Signer } from 'ethers';

import { timeTravel, timeSet, timeSave } from '../test/utils/time';

import AggregatorV3Interface from '../client/src/artifacts/contracts/AggregatorV3Interface.sol/AggregatorV3Interface.json';
import { MockContract } from 'ethereum-waffle';

import { BinaryOptions, BinToken } from '../client/src/shared/types/typechain';

const {
  deployMockContract,
} = waffle;

const DEFAULT_PRICE = 0.0001;
const getTokens = (amount: number, price = DEFAULT_PRICE) => Math.round(amount / price);
const getEthers = (amount: number, price = DEFAULT_PRICE) => amount * price;

const MINUTE = 60;
const INTERVAL = 10 * MINUTE;

const ETH_PRICE = 300;
const DEF_PAYOUT = 80000;

describe('BinaryOptions', function() {
  let EthPriceFeed: MockContract;
  let binaryOptions: BinaryOptions;
  let binToken: BinToken;
  let accounts: Signer[];
  let owner: Signer;
  let address: { binaryOptions: string, binToken: string, owner: string };
  let initialBlockTime: number;
  let snapshotId: number;

  const getRound = (index: number = 0) => initialBlockTime + index*INTERVAL;
  const getOldRound = () => getRound(-1);
  const getLastRound = () => getRound(0);
  const getNextRound = () => getRound(1);
  const getNextPlayableRound = () => getRound(2);

  before(async () => {
    // Set base initial time to the begining of a round to avoid unwanted round change during test
    initialBlockTime = Math.floor(Date.now()/1000/INTERVAL)*INTERVAL + 2*INTERVAL;
    await timeSet(initialBlockTime);
  });

  beforeEach(async () => {
    initialBlockTime = Math.floor(Date.now()/1000/INTERVAL)*INTERVAL + 2*INTERVAL;
    // Take snapshot of blockchain
    snapshotId = await timeSave();
  });

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    EthPriceFeed = await deployMockContract(owner, AggregatorV3Interface.abi);
    await EthPriceFeed.mock.latestRoundData.returns(0, getEther(ETH_PRICE), getLastRound(), getLastRound(), 0);

    const BinaryOptionsInterface = await ethers.getContractFactory('BinaryOptions');
    binaryOptions = await BinaryOptionsInterface.deploy(EthPriceFeed.address) as BinaryOptions;
    await binaryOptions.deployed();

    address = {
      binaryOptions: binaryOptions.address,
      binToken: await binaryOptions.token(),
      owner: await owner.getAddress(),
    }
    binToken = await ethers.getContractAt('BinToken', await binaryOptions.token()) as BinToken;
  });

  const getEther = (eth: number) => ethers.utils.parseEther(eth.toFixed(18));

  const randomParams = {
    maxLock: 100,
    playCycle: 0.5,
    maxPlacesPerCycle: 5,
    maxBet: 10000,
    highLow: 0.5,
    maxPriceVariation: 0.1,
    maxInCyclePriceVariation: 0.01,
    maxCycleAhead: 5,
  };

  const initPlayer = async (walletIndex: number) => {
    const wallet = accounts[walletIndex];

    await binToken.connect(wallet).approve(binaryOptions.address, ethers.constants.MaxUint256);
    await binaryOptions.connect(wallet).buy(true, { value: Math.round(Math.random()*randomParams.maxLock)});
  };
  
  const playCycle = async (walletIndex: number, ethPrice: number) => {
    const wallet = accounts[walletIndex];
    const walletAddress = await wallet.getAddress();

    // Get collectIndexes
    const { 0: readyToCollect } = await binaryOptions.getReadyToCollect(walletAddress);
    const collectIndexes = [];
    let collected = false;
    for (let i=0; i<readyToCollect.toNumber(); i++) {
      const readyToCollectOption = (await binaryOptions.getReadyToCollectOption(walletAddress, i)).toNumber();
      if (readyToCollectOption >= 0) {
        collectIndexes.push(readyToCollectOption);
      }
    }

    if (Math.random() < randomParams.playCycle) {
      for (let i=0; i<Math.round(Math.random()*randomParams.maxPlacesPerCycle); i++) {
        const bet = Math.round(Math.random()*randomParams.maxBet);
        const lockBalance = await binaryOptions.lockBalances(walletAddress);

        if ((lockBalance.available.toNumber() + readyToCollect.toNumber()) > bet) {
          const inCyclePriceVariation = ethPrice + (Math.random()-.5)*ethPrice*randomParams.maxInCyclePriceVariation;
          await EthPriceFeed.mock.latestRoundData.returns(0, getEther(inCyclePriceVariation), getLastRound(), getLastRound(), 0);
          await binaryOptions.connect(wallet).place(
            getRound(2+Math.round(Math.random()*randomParams.maxCycleAhead)),
            bet,
            Math.random() > randomParams.highLow,
            collected ? [] : collectIndexes,
          );
          collected = true;
        }
      }
    }
  }

  const endPlayer = async (walletIndex: number) => {
    const wallet = accounts[walletIndex];
    const walletAddress = await wallet.getAddress();

    // Get collectIndexes
    const { 0: readyToCollect, 1: amount } = await binaryOptions.getReadyToCollect(walletAddress);
    const collectIndexes = [];
    for (let i=0; i<readyToCollect.toNumber(); i++) {
      const readyToCollectOption = (await binaryOptions.getReadyToCollectOption(walletAddress, i)).toNumber();
      if (readyToCollectOption >= 0) {
        const option = await binaryOptions.options(readyToCollectOption);
        const round = await binaryOptions.rounds(option.execute);
        if (round.executed && !option.executed && (option.higher ? option.price.gt(round.price) : option.price.lt(round.price))) {
          collectIndexes.push(readyToCollectOption);
        }
      }
    }

    const {} = await binaryOptions.getReadyToCollect(walletAddress);
    if (amount.toNumber() > 0) {
      await binaryOptions.connect(wallet).sell(amount, true, collectIndexes);
    }
    const balance = await binToken.balanceOf(walletAddress);
    if (balance.toNumber() > 0) {
      await binaryOptions.connect(wallet).sell(balance, false, []);
    }
  }

  const simulation = async (wallets: number, cycles: number) => {
    const goToNextRound = async () => {
      const timeToNextRound = INTERVAL - (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp % INTERVAL + 10;
      await timeTravel(timeToNextRound);
      initialBlockTime += INTERVAL;
    }


    let ethPrice = ETH_PRICE;
    console.log(`Init Players`);
    for (let i=0; i<wallets; i++) {
      console.log(`\tPlayer [${i}] init`);
      await initPlayer(i);
    }

    for (let i=0; i<cycles; i++) {
      console.log(`Cycle [${i}]`);
      for (let j=0; j<wallets; j++) {
        await playCycle(j, ethPrice);
        console.log(`\tPlayer [${j}] play Cycle [${i}]`);
      }
      await goToNextRound();
      ethPrice += (Math.random()-.5)*ethPrice*randomParams.maxPriceVariation;
      const round = await binaryOptions.rounds(getLastRound());
      if (round.options > 0) {
        await EthPriceFeed.mock.latestRoundData.returns(0, getEther(ethPrice), getLastRound(), getLastRound(), 0);
        await binaryOptions.connect(owner).executeRound(getLastRound());
      }
    }

    const getPendingOptions = async () => {
      let totalPendingLeft = 0;
      for (let i=0; i<wallets; i++) {
        const { 0: readyToCollect } = await binaryOptions.getReadyToCollect(await accounts[i].getAddress());
        const pending = (await binaryOptions.getPendingOptionsLength(await accounts[i].getAddress())).toNumber();
        totalPendingLeft += pending - readyToCollect.toNumber();
      }
      return totalPendingLeft;
    }

    for(let i=0; await getPendingOptions() > 0; i++) {
      console.log(`Cycle [${cycles+i}]`);

      await goToNextRound();
      ethPrice += (Math.random()-.5)*ethPrice*randomParams.maxPriceVariation;
      const round = await binaryOptions.rounds(getLastRound());
      if (round.options > 0) {
        await EthPriceFeed.mock.latestRoundData.returns(0, getEther(ethPrice), getLastRound(), getLastRound(), 0);
        await binaryOptions.connect(owner).executeRound(getLastRound());
      }
    }

    console.log(`End Players`);
    for (let i=0; i<wallets; i++) {
      console.log(`\tPlayer [${i}] end`);
      await endPlayer(i);
    }

    console.log('Final Price: ', ethers.utils.formatEther(await binaryOptions.getPrice(0, 0)));
  };

  it('run simulation', async () => {
    await simulation(3, 50);
  }).timeout(36000000);
});
