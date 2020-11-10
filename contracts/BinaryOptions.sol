// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './LinkTokenInterface.sol';
import './AggregatorV3Interface.sol';
import './BinToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/math/Math.sol';

contract BinaryOptions {
  //Overflow safe operators
  using SafeMath for uint32;
  using SafeMath for uint256;

  // Constants
  uint256 constant interval = 10 minutes;
  uint256 constant MAX_INT = 2**256 - 1;

  address private owner;
  uint256 public lastComputedPrice = 0.0001 ether;
  
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
    bool executed;
  }

  struct LockBalance {
    uint256 total;
    uint256 available;
  }

  Option[] public options;
  mapping(uint32 => Round) public rounds;
  mapping(address => uint32[]) public playerOptions;
  mapping(address => LockBalance) public lockBalances;

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
    @dev Returns the total number of options
   */ 
  function getPlayerOptionsLength(address wallet) public view returns (uint256) {
    return playerOptions[wallet].length;
  }

  /**
    @dev Returns the total number of pending options
   */ 
  function getPendingOptionsLength(address wallet) public view returns (uint256) {
    uint32[] storage player = playerOptions[wallet];
    uint256 pending;
    for (uint256 i; i < player.length; i++) {
      Option storage option = options[player[i]];
      Round storage round = rounds[option.execute];

      if (!round.executed) {
        pending++;
      }
    }
    return pending;
  }

  function getReadyToCollectOption(address wallet, uint256 index) public view returns (int256) {
    uint32[] storage player = playerOptions[wallet];
    uint256 readyToCollect;

    for (uint256 i=0; i<player.length; i++) {
      uint256 optionIndex = player[i];
      Option storage option = options[optionIndex];
      Round storage round = rounds[option.execute];
      if (round.executed && !option.executed && (option.higher ? round.price > option.price : round.price < option.price)) {
        if (readyToCollect == index) {
          return int256(optionIndex);
        }
        readyToCollect++;
      }
    }

    return -1;
  }
  /**
    @dev Returns the amount and length of ready to collect options
   */
  function getReadyToCollect(address wallet) public view returns (uint256, uint256) {
    uint32[] storage player = playerOptions[wallet];
    uint256 amount;
    uint256 readyToCollect;

    for (uint256 i=0; i<player.length; i++) {
      Option storage option = options[player[i]];
      Round storage round = rounds[option.execute];
      if (round.executed && !option.executed && (option.higher ? round.price > option.price : round.price < option.price)) {
        readyToCollect++;
        // add amount to total transaction
        amount += option.amount.mul(100000+option.payout).div(100000);
      }
    }

    return (readyToCollect, amount);
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
  function getPrice(uint256 amountTobuy, uint256 supplyChange) public view returns (uint256) {
    uint256 supply = supplyChange == 0 ? token.totalSupply() : supplyChange;
    // need to substract Ether amount to buy as it's already present on wallet
    // when called from buy method, otherwise use amountToBuy = 0
    uint256 collateral = address(this).balance.sub(amountTobuy);

    // Initial price
    if(supply == 0 || collateral == 0) {
      return lastComputedPrice; 
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
    lastComputedPrice = getPrice(amount, 0);
    
    if (lock) {
      // add balance to lockBalances
      token.mint(address(this), ehterToBin(amount, lastComputedPrice));
      // mint new tokens to contract wallet
      lockBalances[msg.sender].total += ehterToBin(amount, lastComputedPrice);
      lockBalances[msg.sender].available += ehterToBin(amount, lastComputedPrice);
    } else {
      // mint new tokens and transfer to wallet
      token.mint(msg.sender, ehterToBin(amount, lastComputedPrice));
    }
    emit Bought(msg.sender);
  }

  /**
    @dev Burns a given number of tokens on the sender wallet and transfer ether at current price
    @param amount The number of tokens to sell/burn
   */
  function sell(uint256 amount, bool fromLock, uint256[] calldata collectOptions) public {
    require(amount > 0, "You need to sell at least some tokens");
  
    if (fromLock) {
      collect(collectOptions);
      LockBalance storage lockBalance = lockBalances[msg.sender];
      require(lockBalance.available >= amount, "Not enough balance");

      lockBalance.available -= amount;

      uint256 balance = token.balanceOf(address(this));
      uint256 burn;
      uint256 totalBurn;

      if (lockBalance.available == 0) {
        burn = lockBalance.total > amount ? lockBalance.total - amount : lockBalance.total;
        lockBalance.total = 0;
      } else {
        lockBalance.total = lockBalance.total > amount ? lockBalance.total - amount : 0;
      }

      uint256 finalBalance = amount > balance ? 0 : balance - amount;
      if (finalBalance > 0) {
        burn = Math.min(burn, finalBalance);
        // record lastComputedPrice before transaction
        // add amount to be transfer and extract totalBurn to get the correct supply before transaction
        lastComputedPrice = getPrice(0, getBinSupply() - burn);
        totalBurn = amount + burn;
      } else {
        // record lastComputedPrice before transaction
        // add amount to be transfer and extract totalBurn to get the correct supply before transaction
        lastComputedPrice = getPrice(0, getBinSupply() + amount - balance);
        totalBurn = balance;
      }

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
    uint256 txAmount = binToEther(amount, lastComputedPrice);
    uint256 collateral = getCollateral();
    msg.sender.transfer(collateral >= txAmount ? txAmount : collateral);
    emit Sold(msg.sender);
  }

  /**
    @dev Place a new binary option for ether price
    @param timeStamp The round to execute, must be interval multiplus and greater than next round
    @param amount The number of tokens to bet
    @param higher bet for higher or lower
   */
  function place(uint32 timeStamp, uint256 amount, bool higher, uint256[] calldata collectOptions) public {
    require(amount > 0, "You need to send some BIN");
    require(timeStamp.mod(interval) == 0, "Timestamp must be multiple of interval");
    // Get next round timestamp
    uint256 nextRound = now.sub(now.mod(interval)).add(interval);
    require(timeStamp > nextRound, "You can't bet for next round");

    collect(collectOptions);

    LockBalance storage balance = lockBalances[msg.sender];
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
    playerOptions[msg.sender].push(index);
    options.push(Option(
      getEthPrice(),
      higher,
      timeStamp,
      amount,
      index,
      getPayOut(timeStamp, higher),
      msg.sender,
      false,
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
    @dev Collect pending executed options
    @param collectOptions list of options to unlock
   */
  function collect(uint256[] calldata collectOptions) internal {
    LockBalance storage balance = lockBalances[msg.sender];

    for (uint256 i; i<collectOptions.length; i++) {
      uint256 index = collectOptions[i];
      require(index < options.length, "Index out of bounds");
      Option storage option = options[index];
      require(option.buyer == msg.sender, "Option not owned by sender");
      
      Round storage round = rounds[option.execute];
      if (round.executed) {
        // Round executed, can process option
        bool winner = option.higher ? round.price > option.price : round.price < option.price;
        if (winner) {
          // add amount to total transaction
          balance.available += option.amount.mul(100000+option.payout).div(100000);
          option.winner = true;
        }
        option.executed = true;
      }
    }
  }

  function unlock(uint256 amount, uint256[] calldata collectOptions) public {
    require(amount > 0, "You need to unlock some Token");
    collect(collectOptions);
    LockBalance storage lockBalance = lockBalances[msg.sender];
    require(lockBalance.available >= amount, "Not enough balance");

    lockBalance.available -= amount;

    uint256 balance = token.balanceOf(address(this));
    if (balance < amount) {
      // Not enough balance, we mint new tokens to pay the bets
      token.mint(address(this), amount.sub(balance));
      lockBalance.total = lockBalance.total > amount ? lockBalance.total - amount : 0;
    } else {
      if (lockBalance.available == 0) {
        uint256 burn = lockBalance.total > amount ? lockBalance.total - amount : lockBalance.total;
        lockBalance.total = 0;
        // Player quitting, burning excess
        token.burnFrom(address(this), burn > (balance-amount) ? balance-amount : burn);
      } else {
        lockBalance.total = lockBalance.total > amount ? lockBalance.total - amount : 0;
      }
    }
    // Send the total amount to the player
    token.transfer(msg.sender, amount);
    lastComputedPrice = getPrice(0, 0);
  }

  function lock(uint256 amount) public {
    require(amount > 0, "You need to unlock some Token");  
    uint256 balance = token.balanceOf(msg.sender);
    require(balance >= amount, "Not enough balance");
    
    token.transferFrom(msg.sender, address(this), amount);

    lockBalances[msg.sender].total += amount;
    lockBalances[msg.sender].available += amount;
  }
}
