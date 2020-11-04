import { waffle, ethers } from 'hardhat';
import { Signer, Contract } from 'ethers';
import { expect } from 'chai';

import { timeTravel, timeSet, timeSave, timeRevert } from './utils/time';

import AggregatorV3Interface from '../client/src/artifacts/contracts/AggregatorV3Interface.sol/AggregatorV3Interface.json';
import { MockContract } from 'ethereum-waffle';

const {
  deployMockContract,
} = waffle;

const DEFAULT_PRICE = 0.0001;
const getTokens = (amount: number, price = DEFAULT_PRICE) => amount / price;
const getEthers = (amount: number, price = DEFAULT_PRICE) => amount * price;

const MINUTE = 60;
const INTERVAL = 10 * MINUTE;

const ETH_PRICE = 300;
const DEF_PAYOUT = 80000;

describe('BinaryOptions', function() {
  let EthPriceFeed: MockContract;
  let binaryOptions: Contract;
  let binToken: Contract;
  let accounts: Signer[];
  let owner: Signer;
  let sender: Signer;
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

    EthPriceFeed = await deployMockContract(owner, AggregatorV3Interface.abi);
    await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE, getLastRound(), getLastRound(), 0);

    const BinaryOptions = await ethers.getContractFactory('BinaryOptions');
    binaryOptions = await BinaryOptions.deploy(EthPriceFeed.address);
    await binaryOptions.deployed();

    const token = await binaryOptions.token();
    binToken = await ethers.getContractAt('BinToken', token);
  });

  describe('Buy & Sell', () => {

    it('Default price must be 0.0001 ether', async () => {
      expect(await binaryOptions.getPrice(0)).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toString()));
    });

    it('should get tokens when buying at default price', async () => {
      // No supply at beginning
      expect(await binToken.totalSupply()).to.equal(0);

      await binaryOptions.connect(sender).buy({ value: 1 });
      // Tokens present in wallet
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(getTokens(1));
      // Tokens minted
      expect(await binToken.totalSupply()).to.equal(getTokens(1));
      // Contract wallet holds ether
      expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(1);
    });

    it('should revert if sell with amount 0', async () => {
      await expect(
        binaryOptions.connect(sender).sell(getTokens(0), { gasPrice: 0 })
      ).to.be.revertedWith('You need to sell at least some tokens');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(0);
      // No ether transfer
      expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(0);
    });

    it('should revert if sell is not allowed before', async () => {
      await expect(
        binaryOptions.connect(sender).sell(getTokens(1), { gasPrice: 0 })
      ).to.be.revertedWith('Check the token allowance');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(0);
      // No ether transfer
      expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(0);
    });

    it('should revert if wallet is out of balance', async () => {
      // Approve token transfer from contract
      await binToken.connect(sender).approve(binaryOptions.address, ethers.constants.MaxUint256);

      await expect(
        binaryOptions.connect(sender).sell(getTokens(1), { gasPrice: 0 })
      ).to.be.revertedWith('Not enough balance');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(0);
      // No ether transfer
      expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(0);
    });

    it('should revert if wallet has not enough balance', async () => {
      await binaryOptions.connect(sender).buy({ value: 1 });
      // Buy confirmation
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(getTokens(1));

      // Approve token transfer from contract
      await binToken.connect(sender).approve(binaryOptions.address, ethers.constants.MaxUint256);

      await expect(
        binaryOptions.connect(sender).sell(getTokens(10), { gasPrice: 0 })
      ).to.be.revertedWith('Not enough balance');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(getTokens(1));
      // No ether transfer
      expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(1);
    });

    it('should get ether when selling tokens at default price', async () => {
      await binaryOptions.connect(sender).buy({ value: 10 });
      // Buy confirmation
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(getTokens(10));

      // Approve token transfer from contract
      await binToken.connect(sender).approve(binaryOptions.address, ethers.constants.MaxUint256);

      const prevBalance = await sender.getBalance();
      await binaryOptions.connect(sender).sell(getTokens(1), { gasPrice: 0 });
      // token transfer from wallet
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(getTokens(9));
      // tokens burned
      expect(await binToken.totalSupply()).to.equal(getTokens(9));
      // ether transferred from contract
      expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(9);
      // ether transfer to wallet
      expect(await sender.getBalance()).to.equal(prevBalance.add(1));
    });
  });

  describe('ExecuteRound', () => {
    it('should revert if no owner try to execute round', async () => {
      await expect(
        binaryOptions.connect(sender).executeRound(0)
      ).to.be.revertedWith('Only owner can execute round');
    });

    it('should revert if trying to execute future round', async () => {
      await expect(
        binaryOptions.executeRound(getNextRound())
      ).to.be.revertedWith('Can\'t execute a future round');
    });

    it('should revert if interval is not multiple of interval', async () => {
      await expect(
        binaryOptions.executeRound(getLastRound()+1)
      ).to.be.revertedWith('Timestamp must be multiple of interval');
    });

    it('should revert if no data on round', async () => {
      await expect(
        binaryOptions.executeRound(getLastRound())
      ).to.be.revertedWith('No data for current round');
    });
  });

  describe('Place', () => {
    beforeEach(async () => {
      await binaryOptions.connect(sender).buy({ value: 100 });
    });

    it('should revert if amount is 0', async () => {
      await expect(
        binaryOptions.connect(sender).place(getNextPlayableRound(), 0, true)
      ).to.be.revertedWith('You need to send some BIN');
    });

    it('should revert if no enough allowance', async () => {
      await expect(
        binaryOptions.connect(sender).place(getNextPlayableRound(), getTokens(1), true)
      ).to.be.revertedWith('Check the token allowance');
    });

    describe('with Allowance', () => {
      beforeEach(async () => {
        await binToken.connect(sender).approve(binaryOptions.address, ethers.constants.MaxUint256);
      });

      it('should revert if interval is not multiple of interval', async () => {
        await expect(
          binaryOptions.connect(sender).place(getNextPlayableRound()+1, getTokens(1), true)
        ).to.be.revertedWith('Timestamp must be multiple of interval');
      });

      it('should revert if betting for next or past round', async () => {
        await expect(
          binaryOptions.connect(sender).place(getNextRound(), getTokens(1), true)
        ).to.be.revertedWith('You can\'t bet for next round');

        await expect(
          binaryOptions.connect(sender).place(getLastRound(), getTokens(1), true)
        ).to.be.revertedWith('You can\'t bet for next round');

        await expect(
          binaryOptions.connect(sender).place(getOldRound(), getTokens(1), true)
        ).to.be.revertedWith('You can\'t bet for next round');
      });

      it('should place one option', async () => {
        const timeStamp = getNextPlayableRound();
        await binaryOptions.connect(sender).place(timeStamp, getTokens(1), true);
        
        // token transfer from wallet
        expect(await binToken.balanceOf(await sender.getAddress())).to.equal(getTokens(99));
        // tokens not burned
        expect(await binToken.totalSupply()).to.equal(getTokens(100));
        // tokens transferred to contract
        expect(await binToken.balanceOf(binaryOptions.address)).to.equal(getTokens(1));
        // option created
        expect(await binaryOptions.getOptionsLength()).to.equal(1);

        const round = await binaryOptions.rounds(timeStamp);
        const pendingOption = await binaryOptions.pendingOptions(await sender.getAddress(), 0);
        const options = await binaryOptions.options(0);

        expect(round.higherAmount).to.equal(getTokens(1));
        expect(pendingOption).to.equal(0);
        expect(options.price).to.equal(ETH_PRICE);
        expect(options.higher).to.equal(true);
        expect(options.execute).to.equal(timeStamp);
        expect(options.amount).to.equal(getTokens(1));
        expect(options.payout).to.equal(DEF_PAYOUT);
        expect(options.buyer).to.equal(await sender.getAddress());
        expect(options.winner).to.equal(false);
      });

      it('should add to both higher and lower at round', async () => {
        const timeStamp = getNextPlayableRound();
        await binaryOptions.connect(sender).place(timeStamp, getTokens(1), true);
        await binaryOptions.connect(sender).place(timeStamp, getTokens(2), false);

        expect(await binaryOptions.getOptionsLength()).to.equal(2);
        expect(await binaryOptions.getPendingOptionsLength(await sender.getAddress())).to.equal(2);
        expect(await binaryOptions.getCollectedOptionsLength(await sender.getAddress())).to.equal(0);
        expect(await binaryOptions.getOptionsAtRoundLength(timeStamp)).to.equal(2);

        const round = await binaryOptions.rounds(timeStamp);

        expect(round.higherAmount).to.equal(getTokens(1));
        expect(round.lowerAmount).to.equal(getTokens(2));
      });
    });
  });

  describe('Place & Execute', () => {
    let timeStamp: number;

    beforeEach(async () => {
      await binaryOptions.connect(sender).buy({ value: 1 });
      await binToken.connect(sender).approve(binaryOptions.address, ethers.constants.MaxUint256);
      timeStamp = getNextPlayableRound();
    });

    it('should mark as executed, set price and revert if already executed', async () => {
      await binaryOptions.connect(sender).place(timeStamp, getTokens(1), true);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);

      await expect(
        binaryOptions.executeRound(timeStamp)
      ).to.be.revertedWith('Round already executed');

      const round = await binaryOptions.rounds(timeStamp);
      expect(round.executed).to.equal(true);
      expect(round.price).to.equal(ETH_PRICE + 100);
    });
  });

  describe('Place, Execute & Collect', () => {
    let timeStamp: number;

    beforeEach(async () => {
      await binaryOptions.connect(sender).buy({ value: 1 });
      await binToken.connect(sender).approve(binaryOptions.address, ethers.constants.MaxUint256);
      timeStamp = getNextPlayableRound();
    });

    it('should collect if winner bet for higher', async () => {
      await binaryOptions.connect(sender).place(timeStamp, getTokens(1), true);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);
      await binaryOptions.connect(sender).collect(); 

      expect(await binaryOptions.getOptionsLength()).to.equal(1);
      expect(await binaryOptions.getPendingOptionsLength(await sender.getAddress())).to.equal(0);
      expect(await binaryOptions.getCollectedOptionsLength(await sender.getAddress())).to.equal(1);
      
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(getTokens(1*(1+DEF_PAYOUT/100000)));
      expect(await binToken.balanceOf(binaryOptions.address)).to.equal(0);
    });

    it('should not collect if looser bet for higher', async () => {
      await binaryOptions.connect(sender).place(timeStamp, getTokens(1), true);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE - 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);
      await binaryOptions.connect(sender).collect();

      expect(await binaryOptions.getOptionsLength()).to.equal(1);
      expect(await binaryOptions.getPendingOptionsLength(await sender.getAddress())).to.equal(0);
      expect(await binaryOptions.getCollectedOptionsLength(await sender.getAddress())).to.equal(1);
      
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(0);
      expect(await binToken.balanceOf(binaryOptions.address)).to.equal(getTokens(1));
    });

    it('should collect if winner bet for lower', async () => {
      await binaryOptions.connect(sender).place(timeStamp, getTokens(1), false);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE - 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);
      await binaryOptions.connect(sender).collect(); 

      expect(await binaryOptions.getOptionsLength()).to.equal(1);
      expect(await binaryOptions.getPendingOptionsLength(await sender.getAddress())).to.equal(0);
      expect(await binaryOptions.getCollectedOptionsLength(await sender.getAddress())).to.equal(1);
      
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(getTokens(1*(1+DEF_PAYOUT/100000)));
      expect(await binToken.balanceOf(binaryOptions.address)).to.equal(0);
    });

    it('should not collect if looser bet for lower', async () => {
      await binaryOptions.connect(sender).place(timeStamp, getTokens(1), false);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);
      await binaryOptions.connect(sender).collect();

      expect(await binaryOptions.getOptionsLength()).to.equal(1);
      expect(await binaryOptions.getPendingOptionsLength(await sender.getAddress())).to.equal(0);
      expect(await binaryOptions.getCollectedOptionsLength(await sender.getAddress())).to.equal(1);
      
      expect(await binToken.balanceOf(await sender.getAddress())).to.equal(0);
      expect(await binToken.balanceOf(binaryOptions.address)).to.equal(getTokens(1));
    });
  });
});
