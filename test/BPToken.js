const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("BPToken", function () {
  it("Should mint initial supply of tokens to the owner", async function () {

    const [owner] = await ethers.getSigners();
    const bpToken = await ethers.deployContract("BPToken");

    // Validate that the initial supply was minted to the owner
    expect(await bpToken.balanceOf(owner.address)).to.equal(1000);
  });
});
