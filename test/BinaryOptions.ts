import { waffle, ethers } from 'hardhat';
import { Signer, Contract } from 'ethers';

import { expect } from 'chai';

const {
} = waffle;

const DEFAULT_PRICE = 0.0001;
const getTokens = (amount: number, price = DEFAULT_PRICE) => amount / price;
const getEthers = (amount: number, price = DEFAULT_PRICE) => amount * price;

describe('BinaryOptions', function() {
  let binaryOptions: Contract;
  let binToken: Contract;
  let accounts: Signer[];
  let owner: Signer;
  let sender: Signer;

  beforeEach(async () => {
    const priceFeed = {
      eth: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      link: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
    };

    const BinaryOptions = await ethers.getContractFactory('BinaryOptions');
    binaryOptions = await BinaryOptions.deploy(priceFeed.eth, priceFeed.link);
    await binaryOptions.deployed();

    const token = await binaryOptions.token();
    binToken = await ethers.getContractAt('BinToken', token);
    
    accounts = await ethers.getSigners();
    owner = accounts[0];
    sender = accounts[1];
  });

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

  it('should fail if sell with amount 0', async () => {
    await expect(
      binaryOptions.connect(sender).sell(getTokens(0), { gasPrice: 0 })
    ).to.be.revertedWith('You need to sell at least some tokens');

    // no tokens minted
    expect(await binToken.totalSupply()).to.equal(0);
    // No ether transfer
    expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(0);
  });

  it('should fail if sell is not allowed before', async () => {
    await expect(
      binaryOptions.connect(sender).sell(getTokens(1), { gasPrice: 0 })
    ).to.be.revertedWith('Check the token allowance');

    // no tokens minted
    expect(await binToken.totalSupply()).to.equal(0);
    // No ether transfer
    expect(await ethers.provider.getBalance(binaryOptions.address)).to.equal(0);
  });

  it('should fail if wallet is out of balance', async () => {
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

  it('should fail if wallet has not enough balance', async () => {
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
