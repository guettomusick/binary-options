// SPDX-License-Identifier: ISC

pragma solidity >=0.6.0 <0.9.0;

import './BinToken.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/math/Math.sol';

import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol';
import '@uniswap/lib/contracts/libraries/FixedPoint.sol';

contract BinaryOptions {
  //Overflow safe operators
  using SafeMath for uint32;
  using SafeMath for uint256;
  address private owner;

  // Constants
  uint256 constant interval = 10 minutes;
  uint256 constant MAX_INT = 2**256 - 1;
  
  IUniswapV2Router01 immutable router;
  address immutable tokenIn;
  address immutable tokenOut;
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

  Option[] public options;
  mapping(uint32 => Round) public rounds;
  mapping(address => uint32[]) public pendingOptions;
  mapping(address => uint32[]) public collectedOptions;

  //Kovan feeds: https://docs.chain.link/docs/reference-contracts
  constructor(address routerAddress, address _tokenIn, address _tokenOut) {
    BinToken _token = new BinToken();
    token = _token;

    _token.approve(address(this), MAX_INT);

    IUniswapV2Router01 _router = IUniswapV2Router01(routerAddress);
    router = _router;
    tokenIn = _tokenIn;
    tokenOut = _tokenOut;

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
    address[] memory path;
    // if (_tokenIn == WETH || _tokenOut == WETH) {
    //   path = new address[](2);
    //   path[0] = _tokenIn;
    //   path[1] = _tokenOut;
    // } else {
    //   path = new address[](3);
    //   path[0] = _tokenIn;
    //   path[1] = WETH;
    //   path[2] = _tokenOut;
    // }
    path = new address[](2);
    path[0] = tokenIn;
    path[1] = tokenOut;
    uint256[] memory amountOut = router.getAmountsOut(1000, path);

    return uint64(amountOut[path.length -1]);
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
  function buy() payable public { 
    uint256 amountTobuy = msg.value;
    require(amountTobuy > 0, "You need to send some Ether");

    // get the current price for convertion
    uint256 price = getPrice(amountTobuy);
    
    // mint new tokens and transfer to wallet
    token.mint(msg.sender, ehterToBin(amountTobuy, price));
    emit Bought(msg.sender);
  }

  /**
    @dev Burns a given number of tokens on the sender wallet and transfer ether at current price
    @param amount The number of tokens to sell/burn
   */
  function sell(uint256 amount) public {
    require(amount > 0, "You need to sell at least some tokens");
    uint256 allowance = token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Check the token allowance");
    uint256 balance = token.balanceOf(msg.sender);
    require(balance >= amount, "Not enough balance");

    // get the current price for convertion
    uint256 price = getPrice(0);

    // burn tokens form wallet
    token.burnFrom(msg.sender, amount);

    // transfer ETH from contract
    payable(msg.sender).transfer(binToEther(amount, price));
    emit Sold(msg.sender);
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
    uint256 nextRound = block.timestamp.sub(block.timestamp.mod(interval)).add(interval);
    require(timeStamp > nextRound, "You can't bet for next round");
    
    // Collect Tokens on internal wallet
    token.transferFrom(msg.sender, address(this), amount);

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
      payable(msg.sender),
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
    require(timeStamp <= block.timestamp, "Can't execute a future round");
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
   */
  function collect() public {
    uint32[] storage pending = pendingOptions[msg.sender];
    uint256 amount;

    for (uint32 i=0; i<pending.length;) {
      Option storage option = options[pending[i]];
      Round storage round = rounds[option.execute];
      if (round.executed) {
        // Round executed, can process option
        bool winner = option.higher ? round.price > option.price : round.price < option.price;
        if (winner) {
          // add amount to total transaction
          amount += option.amount.mul(100000+option.payout).div(100000);
          option.winner = true;
        }

        deletePending(i);

        // After deleting, No need to increment, we need to process moved last element
      } else {
        // Not executed yet, leave on pending and check next one
        i++;
      }
    }

    if (amount > 0) {
      uint256 balance = token.balanceOf(address(this));
      if (balance < amount) {
        // Not enough balance, we mint new tokens to pay the bets
        uint256 mintAmount = amount.sub(balance);
        token.mint(address(this), mintAmount);
      }
      // Send the total amount to the winner
      token.transfer(msg.sender, amount);
    }
    emit Collect(msg.sender);
  }
}
