// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BPNFT is ERC721 {
    uint256 public currentTokenId;

    constructor() ERC721("BPNFT", "BNFT") {
        currentTokenId = 0;
    }

    function safeMint(address to) public  {
        currentTokenId++;
        uint256 tokenId = currentTokenId;
        _safeMint(to, tokenId);
    }
}
