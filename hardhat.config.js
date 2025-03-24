require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const GETH_RPC_URL = process.env.GETH_RPC_URL || "http://127.0.0.1:8545"; // Geth default RPC URL

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
          chainId: 31337,
      },
      sepolia: {
          url: SEPOLIA_RPC_URL,
          accounts: [PRIVATE_KEY],
          chainId: 11155111,
          blockConfirmations: 6,
      },
      geth: {
          url: GETH_RPC_URL,
          accounts: [PRIVATE_KEY], // Uses the same private key as other networks
          chainId: 1337, // Adjust if your Geth network uses a different chain ID
          gas: "auto",
          gasPrice: "auto",
      },
  },
  solidity: {
      compilers: [
          {
              version: "0.8.8",
          },
          {
              version: "0.6.6",
          },
      ],
  },
  etherscan: {
      apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter : {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,  
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC"
  },
  namedAccounts: {
      deployer: {
          default: 0,
          1: 0,
      },
  },
  mocha: {
      timeout: 200000,
  },
};
