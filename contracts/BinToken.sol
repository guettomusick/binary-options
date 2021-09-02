// SPDX-License-Identifier: ISC

pragma solidity >=0.6.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol';

contract BinToken is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser('Bin', 'BIN') {
        _mint(msg.sender, 0);
    }
}