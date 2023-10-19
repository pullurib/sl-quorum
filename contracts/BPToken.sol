// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BPToken is Context, ERC20 {
    constructor() public ERC20("BPToken", "BPT") {
        _mint(msg.sender, 10000 * (10 ** uint256(decimals())));
    }
}