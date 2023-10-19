const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");

describe("secured lending contract", function () {

    async function deployContractFixture(){
        //get three addresses - users
        const [owner, addr1, addr2] = await ethers.getSigners();

        //deploy token contract
        const tokenFactory = await ethers.getContractFactory("BPToken");
        const tokenContract = await tokenFactory.deploy();


        const slFactory = await ethers.getContractFactory("SecuredLending");
        const slContract = await slFactory.deploy(tokenContract.address);


        //return what's needed for the testcases
        return {slContract, owner, addr1, addr2};

    }

    it("Borrower should be able to propose loan terms", async function () {

        const { slContract, owner, addr1 } = await loadFixture(deployContractFixture);
        filter = {
            topics: [
                ethers.id("LoanProposed(uint256)")
            ]
          }
          provider.on(filter, (log, event) => {
        
          })


        // propose loan 
        tx = await slContract.proposeLoan(5n, 10n, 10n, 10n);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "LoanProposed(uint256)");

    });

});