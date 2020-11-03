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
  constructor(address ethFeedAddress, address linkFeedAddress) public {
    token = new BinToken();
    //ETH/USD Kovan feed
    ethFeed = AggregatorV3Interface(ethFeedAddress);
    //LINK/USD Kovan feed
    linkFeed = AggregatorV3Interface(linkFeedAddress);

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
    @dev Returns the latest ETH price
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
  function getPayOut(uint32 timeStamp) public view returns(uint256) {
    // TODO Get an accurate dynamic payout
    return 80000;
  }

  /**
    @dev Mint a given amount of tokens to the sender paying with ether at current price
   */
  function buy() payable public { 
    uint256 amountTobuy = msg.value;
    require(amountTobuy > 0, "You need to send some Ether");

    // get the current price for convertion
    uint256 price = getPrice(amountTobuy);
    
    // mint new tokens and transfer to wallet
    token.mint(msg.sender, ehterToBin(amountTobuy, price));
    emit Bought(amountTobuy);
  }

  /**
    @dev Burns a given number of tokens on the sender wallet and transfer ether at current price
    @param amount The number of tokens to sell/burn
   */
  function sell(uint256 amount) public {
    require(amount > 0, "You need to sell at least some tokens");
    uint256 allowance = token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Check the token allowance");

    // get the current price for convertion
    uint256 price = getPrice(0);

    // burn tokens form wallet
    token.burnFrom(msg.sender, amount);

    // transfer ETH from contract
    msg.sender.transfer(binToEther(amount, price));
    emit Sold(amount);
  }

  /**
    @dev Place a new binary option for ether price
    @param timeStamp The round to execute, must be interval multiplus and greater than next round
    @param amount The number of tokens to bet
    @param higher bet for higher or lower
   */
  function place(uint32 timeStamp, uint256 amount, bool higher) public {
    require(amount > 0, "You need to send some BIN");
    uint256 allowance = token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Check the token allowance");
    require(timeStamp.mod(interval) == 0, "Timestamp must be multiple of interval");
    // Get next round timestamp
    uint256 nextRound = now.sub(now.mod(interval)).add(interval);
    require(timeStamp > nextRound, "You can't bet for next round");
    
    // Collect Tokens on internal wallet
    token.transferFrom(msg.sender, address(this), amount);

    Round storage round = ethRounds[timeStamp];
    // Keep track of total higher and lower bets for future reference
    if (higher) {
      round.higherAmount.add(amount);
    } else {
      round.lowerAmount.add(amount);
    }

    // Save option and index of option on round and pending
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

  /**
    @dev Owner can execute the round at the end of each interval
    @param timeStamp The round to execute, must be interval multiplus and in the past
   */
  function executeRound(uint32 timeStamp) public {
    require(msg.sender == owner);
    require(timeStamp <= now, "Can't execute a future round");
    require(timeStamp.mod(interval) == 0, "timeStamp must be multiple of interval");
    require(ethRounds[timeStamp].options.length > 0, "No data for current round");
    require(!ethRounds[timeStamp].executed, "Round already executed");

    // Marks round as executed and set price feed
    ethRounds[timeStamp].executed = true;
    ethRounds[timeStamp].price = getEthPrice();
  }

  /**
    @dev Removes pending option and move it to collected options
    @param index The pending option to remove
   */
  function deletePending(uint32 index) internal {
    uint32[] storage pending = pendingEthOps[msg.sender];
    
    collectedEthOps[msg.sender].push(pending[index]);
    // remove element from array
    if (index < pending.length-1) {
      pending[index] = pending[pending.length-1];
    }
    pending.pop();
  }

  /**
    @dev Collect pending executed options
   */
  function collect() public {
    uint32[] storage pending = pendingEthOps[msg.sender];
    uint256 amount;

    for (uint32 i=0; i<pending.length;) {
      Option storage option = ethOpts[pending[i]];
      Round storage round = ethRounds[option.execute];
      if (round.options.length == 0) {
        // Inavlid bet, consider it a loose
        deletePending(i);

        // After deleting, No need to increment, we need to process moved last element
      } else if (round.executed) {
        // Round executed, can process option
        bool winner = option.higher ? round.price > option.price : round.price < option.price;
        if (winner) {
          // add amount to total transaction
          amount += option.amount.mul(100000+option.payout).div(1000);
          option.winner = true;
        }

        deletePending(i);

        // After deleting, No need to increment, we need to process moved last element
      } else {
        // Not executed yet, leave on pending and check next one
        i++;
      }
    }

    require(amount > 0, "Nothing to collect");
    uint256 balance = token.balanceOf(address(this));
    if (balance < amount) {
      // Not enough balance, we mint new tokens to pay the bets
      uint256 mintAmount = amount.sub(balance);
      token.mint(address(this), mintAmount);
    }
    // Send the total amount to the winner
    token.transfer(msg.sender, amount);
  }
}
