import { waffle, ethers } from 'hardhat';
import { Signer } from 'ethers';
import { expect } from 'chai';

import { timeTravel, timeSet, timeSave, timeRevert } from './utils/time';

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
  let sender: Signer;
  let address: { binaryOptions: string, binToken: string, owner: string, sender: string };
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
    binaryOptions = await BinaryOptions.deploy(EthPriceFeed.address) as BinaryOptions;
    await binaryOptions.deployed();

    address = {
      binaryOptions: binaryOptions.address,
      binToken: await binaryOptions.token(),
      owner: await owner.getAddress(),
      sender: await sender.getAddress(), 
    }
    binToken = await ethers.getContractAt('BinToken', address.binToken) as BinToken;
  });

  describe('Buy & Sell', () => {

    it('Default price must be 0.0001 ether', async () => {
      expect(await binaryOptions.getPrice(0, 0)).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)));
    });

    it('should revert if buy with amount 0', async () => {
      await expect(
        binaryOptions.connect(sender).buy(false, { value: 0 })
      ).to.be.revertedWith('You need to send some Ether');
      await expect(
        binaryOptions.connect(sender).buy(true, { value: 0 })
      ).to.be.revertedWith('You need to send some Ether');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(0);
      // No ether transfer
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(0);
    });

    it('should get tokens when buying at default price', async () => {
      // No supply at beginning
      expect(await binToken.totalSupply()).to.equal(0);

      await binaryOptions.connect(sender).buy(false, { value: 1 });
      // Tokens present in wallet
      expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(1));
      // Tokens minted
      expect(await binToken.totalSupply()).to.equal(getTokens(1));
      // Contract wallet holds ether
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(1);
      // Contract is not locking bins
      const lockBalance = await binaryOptions.lockBalances(address.sender);
      expect(lockBalance.total).to.equal(0);
      expect(lockBalance.available).to.equal(0);
    });

    it('should get locked tokens when buying at default price', async () => {
      // No supply at beginning
      expect(await binToken.totalSupply()).to.equal(0);

      await binaryOptions.connect(sender).buy(true, { value: 1 });
      // Tokens not present in wallet
      expect(await binToken.balanceOf(address.sender)).to.equal(0);
      // Tokens minted
      expect(await binToken.totalSupply()).to.equal(getTokens(1));
      // Contract wallet holds ether
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(1);
      // Contract locked holds bins
      const lockBalance = await binaryOptions.lockBalances(address.sender);
      expect(lockBalance.total).to.equal(getTokens(1));
      expect(lockBalance.available).to.equal(getTokens(1));
    });

    it('should revert if sell with amount 0', async () => {
      await expect(
        binaryOptions.connect(sender).sell(0, false, [], { gasPrice: 0 })
      ).to.be.revertedWith('You need to sell at least some tokens');
      await expect(
        binaryOptions.connect(sender).sell(0, true, [], { gasPrice: 0 })
      ).to.be.revertedWith('You need to sell at least some tokens');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(0);
      // No ether transfer
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(0);
    });

    it('should revert if sell is not allowed before', async () => {
      await expect(
        binaryOptions.connect(sender).sell(getTokens(1), false, [], { gasPrice: 0 })
      ).to.be.revertedWith('Check the token allowance');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(0);
      // No ether transfer
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(0);
    });

    it('should revert if wallet is out of balance or no lock balance', async () => {
      // Approve token transfer from contract
      await binToken.connect(sender).approve(address.binaryOptions, ethers.constants.MaxUint256);

      await expect(
        binaryOptions.connect(sender).sell(getTokens(1), false, [], { gasPrice: 0 })
      ).to.be.revertedWith('Not enough balance');

      await expect(
        binaryOptions.connect(sender).sell(getTokens(1), true, [], { gasPrice: 0 })
      ).to.be.revertedWith('Not enough balance');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(0);
      // No ether transfer
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(0);
    });

    it('should revert if wallet has not enough balance', async () => {
      await binaryOptions.connect(sender).buy(false, { value: 1 });
      await binaryOptions.connect(sender).buy(true, { value: 1 });
      // Buy confirmation
      expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(1));
      // Lock confirmation
      expect((await binaryOptions.lockBalances(address.sender)).available).to.equal(getTokens(1));

      // Approve token transfer from contract
      await binToken.connect(sender).approve(address.binaryOptions, ethers.constants.MaxUint256);

      await expect(
        binaryOptions.connect(sender).sell(getTokens(10), false, [], { gasPrice: 0 })
      ).to.be.revertedWith('Not enough balance');

      await expect(
        binaryOptions.connect(sender).sell(getTokens(10), true, [], { gasPrice: 0 })
      ).to.be.revertedWith('Not enough balance');

      // no tokens minted
      expect(await binToken.totalSupply()).to.equal(getTokens(2));
      // No ether transfer
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(2);
      // No Lock change
      expect((await binaryOptions.lockBalances(address.sender)).available).to.equal(getTokens(1));
    });

    it('should get ether when selling tokens at default price from wallet', async () => {
      await binaryOptions.connect(sender).buy(false, { value: 10 });
      // Buy confirmation
      expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(10));

      // Approve token transfer from contract
      await binToken.connect(sender).approve(address.binaryOptions, ethers.constants.MaxUint256);

      const prevBalance = await sender.getBalance();
      await binaryOptions.connect(sender).sell(getTokens(1), false, [], { gasPrice: 0 });
      // token transfer from wallet
      expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(9));
      // tokens burned
      expect(await binToken.totalSupply()).to.equal(getTokens(9));
      // ether transferred from contract
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(9);
      // ether transfer to wallet
      expect(await sender.getBalance()).to.equal(prevBalance.add(1));

      // Check getPrice and lastComputedPrice
      expect(await binaryOptions.getPrice(0, 0)).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)));
      expect(await binaryOptions.lastComputedPrice()).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)));
    });

    it('should get ether when selling tokens at default price from lock', async () => {
      await binaryOptions.connect(sender).buy(true, { value: 10 });
      // Buy confirmation
      expect((await binaryOptions.lockBalances(address.sender)).available).to.equal(getTokens(10));

      const prevBalance = await sender.getBalance();
      await binaryOptions.connect(sender).sell(getTokens(1), true, [], { gasPrice: 0 });
      // token transfer from lock
      expect((await binaryOptions.lockBalances(address.sender)).available).to.equal(getTokens(9));
      expect((await binaryOptions.lockBalances(address.sender)).total).to.equal(getTokens(9));
      // tokens burned
      expect(await binToken.totalSupply()).to.equal(getTokens(9));
      // ether transferred from contract
      expect(await ethers.provider.getBalance(address.binaryOptions)).to.equal(9);
      // ether transfer to wallet
      expect(await sender.getBalance()).to.equal(prevBalance.add(1));

      // Check getPrice and lastComputedPrice
      expect(await binaryOptions.getPrice(0, 0)).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)));
      expect(await binaryOptions.lastComputedPrice()).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)));
    });
  });

  describe('Place, ExecuteRound and Unlock', () => {
    let timeStamp: number;
    let initialSupply: number;

    beforeEach(async () => {
      await binaryOptions.connect(sender).buy(true, { value: 2 });
      initialSupply = 2;
      timeStamp = getNextPlayableRound();
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
      it('should revert if amount is 0', async () => {
        await expect(
          binaryOptions.connect(sender).place(getNextPlayableRound(), 0, true, [])
        ).to.be.revertedWith('You need to send some BIN');
      });

      it('should revert if interval is not multiple of interval', async () => {
        await expect(
          binaryOptions.connect(sender).place(getNextPlayableRound()+1, getTokens(1), true, [])
        ).to.be.revertedWith('Timestamp must be multiple of interval');
      });

      it('should revert if betting for next or past round', async () => {
        await expect(
          binaryOptions.connect(sender).place(getNextRound(), getTokens(1), true, [])
        ).to.be.revertedWith('You can\'t bet for next round');

        await expect(
          binaryOptions.connect(sender).place(getLastRound(), getTokens(1), true, [])
        ).to.be.revertedWith('You can\'t bet for next round');

        await expect(
          binaryOptions.connect(sender).place(getOldRound(), getTokens(1), true, [])
        ).to.be.revertedWith('You can\'t bet for next round');
      });

      it('should place one option', async () => {
        const bet = 1;
        await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), true, []);
        
        // available token lock decreased
        const lockBalance = await binaryOptions.lockBalances(address.sender);
        expect(lockBalance.available).to.equal(getTokens(initialSupply - bet));
        expect(lockBalance.total).to.equal(getTokens(initialSupply));
        // tokens not burned
        expect(await binToken.totalSupply()).to.equal(getTokens(initialSupply));
        // option created
        expect(await binaryOptions.getOptionsLength()).to.equal(1);

        const round = await binaryOptions.rounds(timeStamp);
        const pendingOptions = await binaryOptions.getPendingOptionsLength(address.sender);
        const options = await binaryOptions.options(0);
        const readyToCollect = await binaryOptions.getReadyToCollect(address.sender);

        expect(round.higherAmount).to.equal(getTokens(1));
        expect(pendingOptions).to.equal(1);
        expect(options.price).to.equal(ETH_PRICE);
        expect(options.higher).to.equal(true);
        expect(options.execute).to.equal(timeStamp);
        expect(options.amount).to.equal(getTokens(bet));
        expect(options.payout).to.equal(DEF_PAYOUT);
        expect(options.buyer).to.equal(address.sender);
        expect(readyToCollect[0]).to.equal(0);
        expect(readyToCollect[1]).to.equal(0);
      });

      it('should add to both higher and lower at round', async () => {
        await binaryOptions.connect(sender).place(timeStamp, getTokens(.25), true, []);
        await binaryOptions.connect(sender).place(timeStamp, getTokens(.75), false, []);

        expect(await binaryOptions.getOptionsLength()).to.equal(2);
        expect(await binaryOptions.getPendingOptionsLength(address.sender)).to.equal(2);

        const round = await binaryOptions.rounds(timeStamp);

        expect(round.higherAmount).to.equal(getTokens(.25));
        expect(round.lowerAmount).to.equal(getTokens(.75));
        expect(round.hasOptions).to.equal(true);
      });
    });

    describe('Place & Execute', () => {
      it('should mark as executed, set price and revert if already executed', async () => {
        await binaryOptions.connect(sender).place(timeStamp, getTokens(1), true, []);
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

    describe('Unlock', () => {
      it('should revert if amount is 0', async () => {
        await expect(
          binaryOptions.connect(sender).unlock(0, [])
        ).to.be.revertedWith('You need to unlock some Token');
      });

      it('should revert if not enough available balance', async () => {
        await expect(
          binaryOptions.connect(sender).unlock(getTokens(200), [])
        ).to.be.revertedWith('Not enough balance');
      });

      it('should unlock and get tokens back to wallet', async () => {
        const amount = 1;
        await binaryOptions.connect(sender).unlock(getTokens(amount), []);
        
        const lockBalance = await binaryOptions.lockBalances(address.sender);
        expect(lockBalance.available).to.equal(getTokens(initialSupply - amount));
        expect(lockBalance.total).to.equal(getTokens(initialSupply - amount));

        // tokens not burned
        expect(await binToken.totalSupply()).to.equal(getTokens(initialSupply));
        // wallet and contract balances updated
        expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(amount));
        expect(await binToken.balanceOf(address.binaryOptions)).to.equal(getTokens(initialSupply - amount));

        // Check getPrice and lastComputedPrice
        expect(await binaryOptions.getPrice(0, 0)).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)));
        expect(await binaryOptions.lastComputedPrice()).to.equal(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)));
      });
    });

    describe('Place, Execute & Unlock', () => {
      it('should unlock if winner bet for higher', async () => {
        const bet = 2;
        await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), true, []);
        timeTravel(INTERVAL*2);
        await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
        await binaryOptions.executeRound(timeStamp);

        const expectedPayout = bet*(DEF_PAYOUT/100000);
        const expectedReadyToCollect = bet + expectedPayout;
        const expectedSupply = initialSupply + expectedPayout;
        const unlocked = expectedReadyToCollect;

        const readyToCollect = await binaryOptions.getReadyToCollect(address.sender);
        expect(readyToCollect[0]).to.equal(1);
        expect(readyToCollect[1]).to.equal(getTokens(expectedReadyToCollect));

        await binaryOptions.connect(sender).unlock(getTokens(unlocked), [0]);   

        expect(await binaryOptions.getOptionsLength()).to.equal(1);
        expect(await binaryOptions.getPendingOptionsLength(address.sender)).to.equal(0);
        
        // Tokens minted to pay for bet
        expect(await binToken.totalSupply()).to.equal(getTokens(expectedSupply));
        expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(unlocked));
        expect(await binToken.balanceOf(address.binaryOptions)).to.equal(0);

        const lockBalance = await binaryOptions.lockBalances(address.sender);
        expect(lockBalance.available).to.equal(0);
        expect(lockBalance.total).to.equal(0);

        const price = await binaryOptions.getPrice(0, 0);
        expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
          (initialSupply/getTokens(expectedSupply)).toFixed(18)
        ).toNumber(), 10);

        expect(await binaryOptions.lastComputedPrice()).to.equal(price);
      });

      it('should not collect if looser bet for higher', async () => {
        const bet = 1;
        await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), true, []);
        timeTravel(INTERVAL*2);
        await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE - 100, getLastRound(), getLastRound(), 0);
        await binaryOptions.executeRound(timeStamp);

        const expectedPayout = 0;
        const expectedReadyToCollect = 0;
        const expectedSupply = initialSupply - bet;
        const unlocked = expectedReadyToCollect + 1;

        const readyToCollect = await binaryOptions.getReadyToCollect(address.sender);
        expect(readyToCollect[0]).to.equal(0);
        expect(readyToCollect[1]).to.equal(getTokens(expectedReadyToCollect));

        // normally we won't collect loosing bets
        await binaryOptions.connect(sender).unlock(getTokens(unlocked), [0]);   

        expect(await binaryOptions.getOptionsLength()).to.equal(1);
        expect(await binaryOptions.getPendingOptionsLength(address.sender)).to.equal(0);
        
        // Tokens minted to pay for bet
        expect(await binToken.totalSupply()).to.equal(getTokens(expectedSupply));
        expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(unlocked));
        expect(await binToken.balanceOf(address.binaryOptions)).to.equal(0);

        const lockBalance = await binaryOptions.lockBalances(address.sender);
        expect(lockBalance.available).to.equal(0);
        expect(lockBalance.total).to.equal(0);

        const price = await binaryOptions.getPrice(0, 0);
        expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
          (initialSupply/getTokens(expectedSupply)).toFixed(18)
        ).toNumber(), 10);

        expect(await binaryOptions.lastComputedPrice()).to.equal(price);
      });

      it('should collect if winner bet for lower', async () => {
        const bet = 2;
        await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), false, []);
        timeTravel(INTERVAL*2);
        await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE - 100, getLastRound(), getLastRound(), 0);
        await binaryOptions.executeRound(timeStamp);

        const expectedPayout = bet*(DEF_PAYOUT/100000);
        const expectedReadyToCollect = bet + expectedPayout;
        const expectedSupply = initialSupply + expectedPayout;
        const unlocked = expectedReadyToCollect;

        const readyToCollect = await binaryOptions.getReadyToCollect(address.sender);
        expect(readyToCollect[0]).to.equal(1);
        expect(readyToCollect[1]).to.equal(getTokens(expectedReadyToCollect));

        await binaryOptions.connect(sender).unlock(getTokens(unlocked), [0]);

        expect(await binaryOptions.getOptionsLength()).to.equal(1);
        expect(await binaryOptions.getPendingOptionsLength(address.sender)).to.equal(0);
        
        // Tokens minted to pay for bet
        expect(await binToken.totalSupply()).to.equal(getTokens(expectedSupply));
        expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(unlocked));
        expect(await binToken.balanceOf(address.binaryOptions)).to.equal(0);

        const lockBalance = await binaryOptions.lockBalances(address.sender);
        expect(lockBalance.available).to.equal(0);
        expect(lockBalance.total).to.equal(0);

        const price = await binaryOptions.getPrice(0, 0);
        expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
          (initialSupply/getTokens(initialSupply + bet*(DEF_PAYOUT/100000))).toFixed(18)
        ).toNumber(), 10);

        expect(await binaryOptions.lastComputedPrice()).to.equal(price);
      });

      it('should not collect if looser bet for lower', async () => {
        const bet = 1;
        await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), false, []);
        timeTravel(INTERVAL*2);
        await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
        await binaryOptions.executeRound(timeStamp);

        const expectedPayout = 0;
        const expectedReadyToCollect = 0;
        const expectedSupply = initialSupply - bet;
        const unlocked = expectedReadyToCollect + 1;

        const readyToCollect = await binaryOptions.getReadyToCollect(address.sender);
        expect(readyToCollect[0]).to.equal(0);
        expect(readyToCollect[1]).to.equal(getTokens(expectedReadyToCollect));

        // normally we won't collect loosing bets
        await binaryOptions.connect(sender).unlock(getTokens(unlocked), [0]);   

        expect(await binaryOptions.getOptionsLength()).to.equal(1);
        expect(await binaryOptions.getPendingOptionsLength(address.sender)).to.equal(0);
        
        // Tokens minted to pay for bet
        expect(await binToken.totalSupply()).to.equal(getTokens(expectedSupply));
        expect(await binToken.balanceOf(address.sender)).to.equal(getTokens(unlocked));
        expect(await binToken.balanceOf(address.binaryOptions)).to.equal(0);

        const lockBalance = await binaryOptions.lockBalances(address.sender);
        expect(lockBalance.available).to.equal(0);
        expect(lockBalance.total).to.equal(0);

        const price = await binaryOptions.getPrice(0, 0);
        expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
          (initialSupply/getTokens(expectedSupply)).toFixed(18)
        ).toNumber(), 10);

        expect(await binaryOptions.lastComputedPrice()).to.equal(price);
      });
    });
  });

  describe('lastComputedPrice', () => {
    let timeStamp: number;
    let initialSupply: number;

    beforeEach(async () => {
      await binaryOptions.connect(sender).buy(true, { value: 2000000 });
      initialSupply = 2000000;
      timeStamp = getNextPlayableRound();
      await binToken.connect(sender).approve(address.binaryOptions, ethers.constants.MaxUint256);
    });

    it('should keep latest price if collateral goes to 0 for lower price', async () => {
      const bet = 1000000;
      await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), true, []);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);

      const expectedPayout = bet*(DEF_PAYOUT/100000);
      const expectedReadyToCollect = bet + expectedPayout;
      const expectedSupply = initialSupply + expectedPayout;
      const unlocked = expectedReadyToCollect + 1000000;

      await binaryOptions.connect(sender).unlock(getTokens(unlocked), [0]);
      await binaryOptions.connect(sender).sell(await binToken.balanceOf(address.sender), false, []);

      expect(await binToken.totalSupply()).to.equal(0);
      expect((await ethers.provider.getBalance(address.binaryOptions)).toNumber()).to.approximately(0, 1);

      const price = await binaryOptions.getPrice(0, 0);
      expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
        (initialSupply/getTokens(expectedSupply)).toFixed(18)
      ).toNumber(), 10);

      expect(await binaryOptions.lastComputedPrice()).to.equal(price);
      expect(price.toNumber()).to.be.lessThan(+ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)).toNumber());
    });

    it('should keep latest price if collateral goes to 0 for higher', async () => {
      const bet = 1000000;
      await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), false, []);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);

      const expectedPayout = 0;
      const expectedReadyToCollect = 0;
      const expectedSupply = initialSupply - bet;
      const unlocked = expectedReadyToCollect + 1000000;

      // Don't need to collect loosing bets
      await binaryOptions.connect(sender).unlock(getTokens(unlocked), []);
      await binaryOptions.connect(sender).sell(await binToken.balanceOf(address.sender), false, []);

      expect(await binToken.totalSupply()).to.equal(0);
      expect((await ethers.provider.getBalance(address.binaryOptions)).toNumber()).to.approximately(0, 1);

      const price = await binaryOptions.getPrice(0, 0);
      expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
        (initialSupply/getTokens(expectedSupply)).toFixed(18)
      ).toNumber(), 10);

      expect(await binaryOptions.lastComputedPrice()).to.equal(price);
      expect(price.toNumber()).to.be.greaterThan(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)).toNumber());
    });

    it('should keep latest price if collateral goes to 0 for lower price', async () => {
      const bet = 1000000;
      await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), true, []);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);

      const expectedPayout = bet*(DEF_PAYOUT/100000);
      const expectedReadyToCollect = bet + expectedPayout;
      const expectedSupply = initialSupply + expectedPayout;
      const unlocked = expectedReadyToCollect + 1000000;

      await binaryOptions.connect(sender).sell(getTokens(unlocked), true, [0]);

      expect(await binToken.totalSupply()).to.equal(0);
      expect((await ethers.provider.getBalance(address.binaryOptions)).toNumber()).to.approximately(0, 1);
      
      const price = await binaryOptions.getPrice(0, 0);
      expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
        (initialSupply/getTokens(expectedSupply)).toFixed(18)
        ).toNumber(), 10);
        
        expect(await binaryOptions.lastComputedPrice()).to.equal(price);
        expect(price.toNumber()).to.be.lessThan(+ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)).toNumber());
    });

    it('should keep latest price if collateral goes to 0 for higher', async () => {
      const bet = 1000000;
      await binaryOptions.connect(sender).place(timeStamp, getTokens(bet), false, []);
      timeTravel(INTERVAL*2);
      await EthPriceFeed.mock.latestRoundData.returns(0, ETH_PRICE + 100, getLastRound(), getLastRound(), 0);
      await binaryOptions.executeRound(timeStamp);

      const expectedPayout = 0;
      const expectedReadyToCollect = 0;
      const expectedSupply = initialSupply - bet;
      const unlocked = expectedReadyToCollect + 1000000;

      // Don't need to collect loosing bets
      await binaryOptions.connect(sender).sell(getTokens(unlocked), true, []);

      expect(await binToken.totalSupply()).to.equal(0);
      expect((await ethers.provider.getBalance(address.binaryOptions)).toNumber()).to.approximately(0, 1);

      const price = await binaryOptions.getPrice(0, 0);
      expect(price.toNumber()).to.approximately(ethers.utils.parseEther(
        (initialSupply/getTokens(expectedSupply)).toFixed(18)
      ).toNumber(), 10);

      expect(await binaryOptions.lastComputedPrice()).to.equal(price);
      expect(price.toNumber()).to.be.greaterThan(ethers.utils.parseEther(DEFAULT_PRICE.toFixed(18)).toNumber());
    });
  });
});
