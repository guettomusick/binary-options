// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.8.0;

import './LinkTokenInterface.sol';
import './AggregatorV3Interface.sol';
import './BinToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract BinaryOptions {
  //Overflow safe operators
  using SafeMath for uint32;
  using SafeMath for uint256;
  address private owner;

  // Constants
  uint256 constant interval = 10 minutes;
  
  //Pricefeed interfaces
  AggregatorV3Interface internal ethFeed;
  AggregatorV3Interface internal linkFeed;
  uint256 ethPrice;
  uint256 linkPrice;

  //Precomputing hash of strings
  bytes32 ethHash = keccak256(abi.encodePacked('ETH'));

  BinToken public token;

  event Bought(uint256 amount);
  event Sold(uint256 amount);

  struct Round {
    uint32[] options; // Options on this round
    bool executed; // If the round has been executed
    uint256 price; // Price at the end of the round
    uint256 higherAmount;
    uint256 lowerAmount;
  }
  
  //Options stored in arrays of structs
  struct Option {
    uint256 price; // Price in USD (18 decimal places) when the option was issued
    bool higher; // Type of higher/lower bet
    uint32 execute; // Unix timeStamp of expiration time
    uint256 amount; // Amount of tokens the option contract is for
    uint32 id; // Unique ID of option, also array index
    uint256 payout; // Payout of winner bet with 3 decimal places
    address payable buyer; //Buyer of option
    bool winner;
  }

  Option[] public ethOpts;
  Option[] public linkOpts;
  mapping(uint32 => Round) public ethRounds;
  mapping(address => uint32[]) public pendingEthOps;
  mapping(address => uint32[]) public collectedEthOps;

  //Kovan feeds: https://docs.chain.link/docs/reference-contracts
  constructor() public {
    token = new BinToken();
    //ETH/USD Kovan feed
    ethFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
    //LINK/USD Kovan feed
    linkFeed = AggregatorV3Interface(0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0);

    owner = msg.sender;
  }

  /**
    @dev Returns the latest LINK price
   */ 
  function getLinkPrice() public view returns (uint256) {
    (
      uint80 roundID, 
      int price,
      uint256 startedAt,
      uint256 timeStamp,
      uint80 answeredInRound
    ) = linkFeed.latestRoundData();
    // If the round is not complete yet, timeStamp is 0
    require(timeStamp > 0, 'Round not complete');
    //Price should never be negative thus cast int to unit is ok
    //Price is 8 decimal places and will require 1e10 correction later to 18 places
    return uint256(price);
  }

  /**
    @dev Returns the latest LINK price
   */ 
  function getEthPrice() public view returns (uint256) {
    (
      uint80 roundID, 
      int price,
      uint256 startedAt,
      uint256 timeStamp,
      uint80 answeredInRound
    ) = ethFeed.latestRoundData();
    // If the round is not complete yet, timeStamp is 0
    require(timeStamp > 0, 'Round not complete');
    //Price should never be negative thus cast int to unit is ok
    //Price is 8 decimal places and will require 1e10 correction later to 18 places
    return uint256(price);
  }

  /**
    @dev Gets the BIN token supply
   */
  function getBinSupply() public view returns (uint256) {
    return token.totalSupply();
  }

  /**
    @dev Returns the current collateral balance
   */
  function getCollateral() public view returns (uint256) {
    return address(this).balance;
  }

  /**
    @dev Returns the price for the amount to purchase
    @param amountTobuy The number of tokens to purchase
   */
  function getPrice(uint256 amountTobuy) public view returns (uint256) {
    uint256 supply = token.totalSupply();
    uint256 collateral = address(this).balance.sub(amountTobuy);

    if(supply == 0 || collateral == 0) {
      return 0.0001 ether; 
    }

    
    return collateral.mul(1 ether).div(supply);
  }

  /**
    @dev Returns the token price in ether
    @param amount The amount of BIN tokens to buy
   */
  function ehterToBin(uint256 amount, uint256 price) public pure returns(uint256) {
    return amount.mul(1 ether).div(price);
  }

  /**
    @dev Returns the value of the token in ether
    @param amount The amount to convert
    @param price The price of the token
   */
  function binToEther(uint256 amount, uint256 price) public pure returns(uint256) {
    return amount.mul(price).div(1 ether);
  }

  /**
    @dev Returns the payout at a given timestamp
    @param timeStamp The timestamp at which to get the payout
   */
  function getPayOut(uint32 timeStamp) public view returns(uint256) {
    // TODO Get an accurate dynamic payout
    return 80000;
  }

  /**
    @dev Mint a given amount of tokens to the sender
   */
  function buy() payable public { 
    uint256 amountTobuy = msg.value;
    require(amountTobuy > 0, "You need to send some Ether");
    uint256 price = getPrice(amountTobuy);
    token.mint(msg.sender, ehterToBin(amountTobuy, price));
    emit Bought(amountTobuy);
  }

  /**
    @dev Burns a given number of tokens
    @param amount The number of tokens to sell/burn
   */
  function sell(uint256 amount) public {
    require(amount > 0, "You need to sell at least some tokens");
    uint256 allowance = token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Check the token allowance");
    uint256 price = getPrice(0);
    token.burnFrom(msg.sender, amount);
    msg.sender.transfer(binToEther(amount, price));
    emit Sold(amount);
  }

  /** TODO
    
   */
  function place(uint32 timeStamp, uint256 amount, bool higher) public {
    require(amount > 0, "You need to send some BIN");
    uint256 allowance = token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Check the token allowance");
    uint256 nextRound = now.sub(now.mod(interval)).add(interval);
    require(timeStamp > nextRound, "You can't bet for next round");
    require(timeStamp.mod(interval) == 0, "Timestamp must be multiple of interval");
    token.transferFrom(msg.sender, address(this), amount);

    Round storage round = ethRounds[timeStamp];
    if (higher) {
      round.higherAmount.add(amount);
    } else {
      round.lowerAmount.add(amount);
    }
    uint32 index = uint32(ethOpts.length);
    round.options.push(index);
    pendingEthOps[msg.sender].push(index);
    ethOpts.push(Option(
      getEthPrice(),
      higher,
      timeStamp,
      amount,
      index,
      getPayOut(timeStamp),
      msg.sender,
      false
    ));
  }

  function executeRound(uint32 timeStamp) public {
    require(msg.sender == owner);
    require(timeStamp.mod(interval) == 0, "timeStamp must be multiple of interval");
    require(ethRounds[timeStamp].options.length > 0, "No data for current round");
    require(!ethRounds[timeStamp].executed, "Round already executed");

    ethRounds[timeStamp].executed = true;
    ethRounds[timeStamp].price = getEthPrice();
  }

  function deletePending(uint32 index) internal {
    uint32[] storage pending = pendingEthOps[msg.sender];
    
    collectedEthOps[msg.sender].push(pending[index]);
    // remove element from array
    if (index < pending.length-1) {
      pending[index] = pending[pending.length-1];
    }
    delete pending[pending.length-1];
    pending.length--;
  }

  function collect() public {
    uint32[] storage pending = pendingEthOps[msg.sender];
    uint256 amount;

    for (uint32 i=0; i<pending.length;) {
      Option storage option = ethOpts[pending[i]];
      Round storage round = ethRounds[option.execute];
      if (round.options.length == 0) {
        // Inavlid bet, consider it a loose
        deletePending(i);

        // No need to increment, we need to process moved last element
      } else if (round.executed) {
        bool winner = option.higher ? round.price > option.price : round.price < option.price;
        if (winner) {
          amount += option.amount.mul(100000+option.payout).div(1000);
          option.winner = true;
        }

        deletePending(i);

        // No need to increment, we need to process moved last element
      } else {
        // increment position if not ready to collect
        i++;
      }
    }

    require(amount > 0, "Nothing to collect");
    uint256 balance = token.balanceOf(address(this));
    if (balance < amount) {
      uint256 mintAmount = amount.sub(balance);
      token.mint(address(this), mintAmount);
    }
    token.transfer(msg.sender, amount);
  }
}
