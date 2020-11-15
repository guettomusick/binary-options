// SPDX-License-Identifier: ISC

pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol';

contract BinToken is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser('Bin', 'BIN') public {
        _mint(msg.sender, 0);
    }
}