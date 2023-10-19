// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');

async function main() {

  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  const bpToken = await ethers.deployContract("BPToken");
  console.log("Deployed token contract :", await bpToken.getAddress());

  const lendingContractFactory = await hre.ethers.getContractFactory("SecuredLending");
  const lendingContract = await lendingContractFactory.deploy(bpToken.getAddress());

  console.log("lending contract address:", await lendingContract.getAddress());
  await lendingContract.waitForDeployment();

  const addresses = {
    tokenAdd: await bpToken.getAddress(),
    lendingAdd: await lendingContract.getAddress()
  };

  fs.writeFileSync('deployed_addresses.json', JSON.stringify(addresses));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
