// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.8.0;

import '@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol';

contract BinToken is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser('Bin', 'BIN') public {
        _mint(msg.sender, 0);
    }
}