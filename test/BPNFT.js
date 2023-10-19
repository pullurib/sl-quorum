const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("BPNFT", function () {
  it("Should mint a new NFT", async function () {

    const [owner] = await ethers.getSigners();

    //const BPNFT = await ethers.deployContract("BPNFT");
    const BPNFTFactory = await ethers.getContractFactory("BPNFT");
    const BPNFT = await BPNFTFactory.deploy();


    // Mint a new NFT
    const tokenId = await BPNFT.safeMint(owner.address);
    console.log(`done minting nft ${tokenId}`);

    // Validate that the NFT was minted and belongs to the owner
    expect(await BPNFT.ownerOf(tokenId)).to.equal(owner.address);
  });
});
