// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol';

contract BinToken is ERC20, ERC20Detailed, ERC20Mintable, ERC20Burnable {
    constructor() ERC20Detailed('Bin', 'BIN', 18) public {
        _mint(msg.sender, 0);
    }
}