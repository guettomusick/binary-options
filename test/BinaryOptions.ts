import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';

import {
    ether,
} from './utils/consts';


describe('BinaryOptions', function() {
  let BinaryOptions;
  let binaryOptions;
  let accounts: Signer[];
  let owner: Signer;
  let sender: Signer;

  beforeEach(async () => {
    const priceFeed = {
      eth: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      link: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
    };

    BinaryOptions = await ethers.getContractFactory('BinaryOptions');
    binaryOptions = await BinaryOptions.deploy(priceFeed.eth, priceFeed.link);
    await binaryOptions.deployed();

    accounts = await ethers.getSigners();
    owner = accounts[0];
    sender = accounts[1];
  });

  it('Default price must be 0.0001 ether', async () => {
    expect(await binaryOptions.getPrice(0)).to.equal(0.0001*ether);
  });
});
