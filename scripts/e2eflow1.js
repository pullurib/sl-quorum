const contract = require("../artifacts/contracts/securedLending.sol/SecuredLending.json");
const tokContract = require("../artifacts/contracts/BPToken.sol/BPToken.json");

const {ethers} = require("ethers");
const fs = require('fs');

async function main() {
  // Ethereum RPC URL
  const rpcUrl = "http://localhost:22000";

  const owner = "0xfb0fe94e8af3098a0254582a0c0d354829ef097b";
  const ownerPK = "0xc0fc234fd03805e00203278fdca45a2028f19a739525e0c259b95ab8e8ec7a45";

  // Specify addresses
  const borrower1Addr = "0xa241fa8f80b6662f59d0f2700da9e3b8bc5758fa";
  const lender1Addr = "0xad1b84f761fe758168ac482094d873f19f669062";

  const borrower1PK = "0x5e6ebd738be3ec783ecbeffb39f0f5f3f948a1e0ad336890a968e5cd03de326f";
  const lender1PK = "0xbb099041935bb9b56771e06f9d0fdb1d25fde7af1153cfd91921d76cd69f0d16";

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const bwallet1 = new ethers.Wallet(borrower1PK, provider);
  const lwallet1 = new ethers.Wallet(lender1PK, provider);
  const ownerWallet = new ethers.Wallet(ownerPK, provider);

  // check contract address -- write to a file in deploy.js and read back the file here
  const data = fs.readFileSync('deployed_addresses.json', 'utf8');
  const addresses = JSON.parse(data);

  const tokenContAddr = addresses.tokenAdd;
  const contractAddress = addresses.lendingAdd;

  // Load the lending contract
  const b1Contract = new ethers.Contract(contractAddress, contract.abi, bwallet1);
  const l1Contract = new ethers.Contract(contractAddress, contract.abi, lwallet1);

  const ownerContract = new ethers.Contract(contractAddress, contract.abi, ownerWallet);
  const ownerToken = new ethers.Contract(tokenContAddr, tokContract.abi, ownerWallet);

  const l1TokenContract = new ethers.Contract(tokenContAddr, tokContract.abi, lwallet1);
  const b1TokenContract = new ethers.Contract(tokenContAddr, tokContract.abi, bwallet1);

  // Perform the token transfer from owner to lender
  try {
    const tx = await ownerToken.transfer(lender1Addr, 100n);
    await tx.wait();
    console.log(`Transferred 100 BPT from ${owner} to ${lender1Addr}`);
    const tx2 = await l1TokenContract.approve(contractAddress, 100);
    await tx2.wait();


    const tx3 = await ownerToken.transfer(borrower1Addr, 100n);
    await tx3.wait();
    console.log(`Transferred 100 BPT from ${owner} to ${borrower1Addr}`);
    const tx4 = await b1TokenContract.approve(contractAddress, 100);
    await tx4.wait();

  } catch (error) {
    console.error("Error transferring tokens:", error);
  }

   //listen to events or check nft ownership

  filter = {
    topics: [
       // ethers.id("LoanStateChange(uint256,uint)")
    ]
  }
  provider.on(filter, async(log, event) => {
    console.log('Event log:', log);

  })

  const tx1 = await b1Contract.proposeLoan(5n,20n,5n,5n);
  await tx1.wait();

  console.log("sent borrower proposal ");

  const [borrower, lender, nftId, amount, interest, daysForRepayment, state] = await b1Contract.getLoanDetails(0n);
  console.log("Loan details: ", borrower, lender, nftId, amount, interest, daysForRepayment, state);

  const tx2 = await l1Contract.fundLoan(3n);
  await tx2.wait();
  console.log("lender funded proposal");

  const tx3 = await b1Contract.repayLoan(3n,25n);
  await tx3.wait();

  console.log("borrower paid back");

  

}

main();