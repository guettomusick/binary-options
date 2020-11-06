// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './LinkTokenInterface.sol';
import './AggregatorV3Interface.sol';
import './BinToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract BinaryOptions {
  //Overflow safe operators
  using SafeMath for uint32;
  using SafeMath for uint256;

  // Constants
  uint256 constant interval = 10 minutes;
  uint256 constant MAX_INT = 2**256 - 1;

  address private owner;
  
  //Pricefeed interfaces
  AggregatorV3Interface internal ethFeed;
  uint256 ethPrice;

  BinToken public token;

  event Bought(address indexed from);
  event Sold(address indexed from);
  event Place(address indexed from, uint32 timeStamp);
  event Execute(uint32 timeStamp);
  event Collect(address indexed from);

  struct Round {
    bool executed; // If the round has been executed
    uint32 options; // total options placed at round
    uint64 price; // Price at the end of the round
    uint256 higherAmount;
    uint256 lowerAmount;
  }
  
  //Options stored in arrays of structs
  struct Option {
    uint64 price; // Price in USD (18 decimal places) when the option was issued
    bool higher; // Type of higher/lower bet
    uint32 execute; // Unix timeStamp of expiration time
    uint256 amount; // Amount of tokens the option contract is for
    uint32 id; // Unique ID of option, also array index
    uint256 payout; // Payout of winner bet with 3 decimal places
    address payable buyer; //Buyer of option
    bool winner;
  }

  struct LockBalance {
    uint256 total;
    uint256 available;
  }

  Option[] public options;
  mapping(uint32 => Round) public rounds;
  mapping(address => uint32[]) public pendingOptions;
  mapping(address => uint32[]) public collectedOptions;
  mapping(address => LockBalance) public lockBalance;

  //Kovan feeds: https://docs.chain.link/docs/reference-contracts
  constructor(address ethFeedAddress) public {
    token = new BinToken();
    token.approve(address(this), MAX_INT);

    //ETH/USD Kovan feed
    ethFeed = AggregatorV3Interface(ethFeedAddress);

    owner = msg.sender;

  }

  /**
    @dev Returns the total number of options
   */ 
  function getOptionsLength() public view returns (uint256) {
    return options.length;
  }

  /**
    @dev Returns the total number of pending options
   */ 
  function getPendingOptionsLength(address wallet) public view returns (uint256) {
    return pendingOptions[wallet].length;
  }

  /**
    @dev Returns the total number of collected options
   */ 
  function getCollectedOptionsLength(address wallet) public view returns (uint256) {
    return collectedOptions[wallet].length;
  }

  /**
    @dev Returns the latest ETH price
   */ 
  function getEthPrice() public view returns (uint64) {
    ( , int price, , uint256 timeStamp, ) = ethFeed.latestRoundData();
    // If the round is not complete yet, timeStamp is 0
    require(timeStamp > 0, 'Round not complete');
    //Price should never be negative thus cast int to unit is ok
    //Price is 8 decimal places and will require 1e10 correction later to 18 places
    return uint64(price);
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
    @param amountTobuy The number of tokens to purchase if called from buy method or 0
   */
  function getPrice(uint256 amountTobuy) public view returns (uint256) {
    uint256 supply = token.totalSupply();
    // need to substract Ether amount to buy as it's already present on wallet
    // when called from buy method, otherwise use amountToBuy = 0
    uint256 collateral = address(this).balance.sub(amountTobuy);

    // Initial price
    if(supply == 0 || collateral == 0) {
      return 0.0001 ether; 
    }

    // return price in wei
    return collateral.mul(1 ether).div(supply);
  }

  /**
    @dev Returns the token amount from ether using current token price
    @param amount The amount of BIN tokens to buy
   */
  function ehterToBin(uint256 amount, uint256 price) public pure returns(uint256) {
    return amount.mul(1 ether).div(price);
  }

  /**
    @dev Returns the ether amount from token using current token price
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
  function getPayOut(uint32 timeStamp, bool higher) public view returns(uint256) {
    // TODO Get an accurate dynamic payout
    return 80000;
  }

  /**
    @dev Mint a given amount of tokens to the sender paying with ether at current price
   */
  function buy(bool lock) payable public { 
    uint256 amount = msg.value;
    require(amount > 0, "You need to send some Ether");

    // get the current price for convertion
    uint256 price = getPrice(amount);
    
    if (lock) {
      // add balance to lockBalance
      token.mint(address(this), ehterToBin(amount, price));
      // mint new tokens to contract wallet
      lockBalance[msg.sender].total += ehterToBin(amount, price);
      lockBalance[msg.sender].available += ehterToBin(amount, price);
    } else {
      // mint new tokens and transfer to wallet
      token.mint(msg.sender, ehterToBin(amount, price));
    }
    emit Bought(msg.sender);
  }

  /**
    @dev Burns a given number of tokens on the sender wallet and transfer ether at current price
    @param amount The number of tokens to sell/burn
   */
  function sell(uint256 amount, bool fromLock) public {
    require(amount > 0, "You need to sell at least some tokens");
    
    // get the current price for convertion
    uint256 price = getPrice(0);

    if (fromLock) {
      ( bool valid, uint256 burn ) = collect(amount);
      require(valid, "Not enough balance");

      uint256 balance = token.balanceOf(address(this));
      uint256 totalBurn = (amount + burn) > balance ? balance : (amount + burn);
      token.burnFrom(address(this), totalBurn);
    } else {
      uint256 allowance = token.allowance(msg.sender, address(this));
      require(allowance >= amount, "Check the token allowance");
      uint256 balance = token.balanceOf(msg.sender);
      require(balance >= amount, "Not enough balance");

      // burn tokens form wallet
      token.burnFrom(msg.sender, amount);
    }
    // transfer ETH from contract
    msg.sender.transfer(binToEther(amount, price));
    emit Sold(msg.sender);
  }

  /**
    @dev Place a new binary option for ether price
    @param timeStamp The round to execute, must be interval multiplus and greater than next round
    @param amount The number of tokens to bet
    @param higher bet for higher or lower
   */
  function place(uint32 timeStamp, uint256 amount, bool higher, bool doCollect) public {
    require(amount > 0, "You need to send some BIN");
    require(timeStamp.mod(interval) == 0, "Timestamp must be multiple of interval");
    // Get next round timestamp
    uint256 nextRound = now.sub(now.mod(interval)).add(interval);
    require(timeStamp > nextRound, "You can't bet for next round");

    if (doCollect) {
      collect(0);
    }

    LockBalance storage balance = lockBalance[msg.sender];
    require(balance.available >= amount, "Not enough locked balance");
    
    balance.available -= amount;

    Round storage round = rounds[timeStamp];
    // Keep track of total higher and lower bets for future reference
    if (higher) {
      round.higherAmount += amount;
    } else {
      round.lowerAmount += amount;
    }
    round.options++;

    // Save option and index of option on round and pending
    uint32 index = uint32(options.length);
    pendingOptions[msg.sender].push(index);
    options.push(Option(
      getEthPrice(),
      higher,
      timeStamp,
      amount,
      index,
      getPayOut(timeStamp, higher),
      msg.sender,
      false
    ));
    emit Place(msg.sender, timeStamp);
  }

  /**
    @dev Owner can execute the round at the end of each interval
    @param timeStamp The round to execute, must be interval multiplus and in the past
   */
  function executeRound(uint32 timeStamp) public {
    Round storage round = rounds[timeStamp];
    require(msg.sender == owner, "Only owner can execute round");
    require(timeStamp <= now, "Can't execute a future round");
    require(timeStamp.mod(interval) == 0, "Timestamp must be multiple of interval");
    require(round.options > 0, "No data for current round");
    require(!round.executed, "Round already executed");

    // Marks round as executed and set price feed
    round.executed = true;
    round.price = getEthPrice();
    emit Execute(timeStamp);
  }

  /**
    @dev Returns the amount and length of ready to collect options
   */
  function getReadyToCollect() public view returns (uint256, uint256) {
    uint32[] storage pending = pendingOptions[msg.sender];
    uint256 amount;
    uint256 readyToCollectLength;

    for (uint32 i=0; i<pending.length; i++) {
      Option storage option = options[pending[i]];
      Round storage round = rounds[option.execute];
      if (round.executed) {
        readyToCollectLength++;
        // Round executed, can process option
        bool winner = option.higher ? round.price > option.price : round.price < option.price;
        if (winner) {
          // add amount to total transaction
          amount += option.amount.mul(100000+option.payout).div(100000);
        }
      }
    }

    return (readyToCollectLength, amount);
  }

  /**
    @dev Removes pending option and move it to collected options
    @param index The pending option to remove
   */
  function deletePending(uint32 index) internal {
    uint32[] storage pending = pendingOptions[msg.sender];
    
    collectedOptions[msg.sender].push(pending[index]);
    // remove element from array
    if (index < pending.length-1) {
      pending[index] = pending[pending.length-1];
    }
    pending.pop();
  }

  /**
    @dev Collect pending executed options
    @param unlockAmount Optional amount to unlock
   */
  function collect(uint256 unlockAmount) internal returns (bool, uint256) {
    uint32[] storage pending = pendingOptions[msg.sender];
    LockBalance storage balance = lockBalance[msg.sender];

    for (uint32 i=0; i<pending.length;) {
      Option storage option = options[pending[i]];
      Round storage round = rounds[option.execute];
      if (round.executed) {
        // Round executed, can process option
        bool winner = option.higher ? round.price > option.price : round.price < option.price;
        if (winner) {
          // add amount to total transaction
          balance.available += option.amount.mul(100000+option.payout).div(100000);
          option.winner = true;
        }

        deletePending(i);
        continue;
        // After deleting, No need to increment, we need to process moved last element
      }
      // Not executed yet, leave on pending and check next one
      i++;
    }

    if (unlockAmount > 0) {
      if (balance.available < unlockAmount) {
        return (false, 0);
      }

      balance.available -= unlockAmount;

      if (pending.length == 0 && balance.available == 0 && balance.total > unlockAmount) {
        balance.total = 0;
        return (true, balance.total - unlockAmount);
      }
      
      balance.total = balance.total > unlockAmount ? balance.total - unlockAmount : 0;
    }
    return (true, 0);
  }

  function unlock(uint256 amount) public {
    require(amount > 0, "You need to unlock some Token");
    ( bool valid, uint256 burn ) = collect(amount);
    require(valid, "Not enough balance");

    uint256 balance = token.balanceOf(address(this));
    if (balance < amount) {
      // Not enough balance, we mint new tokens to pay the bets
      token.mint(address(this), amount.sub(balance));
    } else if (burn > 0) {
      // Player quitting, burning excess
      token.burnFrom(address(this), burn > (balance-amount) ? balance-amount : burn);
    }
    // Send the total amount to the player
    token.transfer(msg.sender, amount);
  }
}
