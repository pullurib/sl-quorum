require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    quorum: {
      url: "http://127.0.0.1:22000",
      chainId: 1337,
      
    }
  }
};
