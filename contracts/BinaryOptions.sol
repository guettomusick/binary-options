// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.8.0;

import './LinkTokenInterface.sol';
import './AggregatorV3Interface.sol';
import './BinToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract BinaryOptions {
  //Overflow safe operators
  using SafeMath for uint;
  
  //Pricefeed interfaces
  AggregatorV3Interface internal ethFeed;
  AggregatorV3Interface internal linkFeed;
  uint ethPrice;
  uint linkPrice;

  //Precomputing hash of strings
  bytes32 ethHash = keccak256(abi.encodePacked('ETH'));
  address payable contractAddr;

  BinToken public token;

  event Bought(uint256 amount);
  event Sold(uint256 amount);
  
  //Options stored in arrays of structs
  struct option {
    uint price; // Price in USD (18 decimal places) when the option was issued
    bool higher; // higher/lower bet
    uint expiry; //Unix timestamp of expiration time
    uint amount; //Amount of tokens the option contract is for
    uint id; //Unique ID of option, also array index
    address payable buyer; //Buyer of option
  }
  option[] public ethOpts;
  option[] public linkOpts;

  //Kovan feeds: https://docs.chain.link/docs/reference-contracts
  constructor() public {
    token = new BinToken();
    //ETH/USD Kovan feed
    ethFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
    //LINK/USD Kovan feed
    linkFeed = AggregatorV3Interface(0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0);

    contractAddr = address(uint160(address(this)));
  }

  //Returns the latest LINK price
  function getLinkPrice() public view returns (uint) {
    (
      uint80 roundID, 
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
    ) = linkFeed.latestRoundData();
    // If the round is not complete yet, timestamp is 0
    require(timeStamp > 0, 'Round not complete');
    //Price should never be negative thus cast int to unit is ok
    //Price is 8 decimal places and will require 1e10 correction later to 18 places
    return uint(price);
  }

  //Returns the latest LINK price
  function getEthPrice() public view returns (uint) {
    (
      uint80 roundID, 
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
    ) = ethFeed.latestRoundData();
    // If the round is not complete yet, timestamp is 0
    require(timeStamp > 0, 'Round not complete');
    //Price should never be negative thus cast int to unit is ok
    //Price is 8 decimal places and will require 1e10 correction later to 18 places
    return uint(price);
  }

  function getPrice() public view returns (uint256) {
    uint256 supply = token.totalSupply();
    uint256 collateral = token.balanceOf(address(this));

    if(supply == 0 || collateral == 0) {
      return 1;
    }
    return collateral.div(supply);
  }

  function buy() payable public {
    uint256 amountTobuy = msg.value;
    uint256 price = getPrice();
    require(amountTobuy > 0, "You need to send some Ether");
    token.mint(msg.sender, amountTobuy.div(price));
    emit Bought(amountTobuy);
  }

  function sell(uint256 amount) public {
    require(amount > 0, "You need to sell at least some tokens");
    uint256 allowance = token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Check the token allowance");
    uint256 price = getPrice();
    token.burnFrom(msg.sender, amount);
    msg.sender.transfer(amount.mul(price));
    emit Sold(amount);
  }
}
