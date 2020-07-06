require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const moment = require("moment-timezone");
const numeral = require("numeral");
const _ = require("lodash");

// SERVER CONFIG
const PORT = process.env.PORT || 5000;
const app = express();
const server = http
  .createServer(app)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// WEB3 CONFIG
const web3 = new Web3(
  new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL)
);

// Ropsten DAI
const DAI_ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "INITIAL_SUPPLY",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_value", type: "uint256" }],
    name: "burn",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "burnFrom",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_name", type: "string" },
      { name: "_symbol", type: "string" },
      { name: "_decimals", type: "uint256" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_burner", type: "address" },
      { indexed: false, name: "_value", type: "uint256" },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
];
const DAI_ADDRESS = "0xad6d458402f60fd3bd25163575031acdce07538d";
const daiContract = new web3.eth.Contract(DAI_ABI, DAI_ADDRESS);

// Ropsten Uniswap Dai Exchange: https://ropsten.etherscan.io/address/0xc0fc958f7108be4060F33a699a92d3ea49b0B5f0
const EXCHANGE_ABI = [
  {
    inputs: [
      { internalType: "contract IOneSplit", name: "impl", type: "address" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newImpl",
        type: "address",
      },
    ],
    name: "ImplementationUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_AAVE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_BANCOR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_BDAI",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_CHAI",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_COMPOUND",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_CURVE_BINANCE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_CURVE_COMPOUND",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_CURVE_SYNTHETIX",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_CURVE_USDT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_CURVE_Y",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_FULCRUM",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_IEARN",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_KYBER",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_OASIS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_SMART_TOKEN",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_UNISWAP",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_DISABLE_WETH",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_ENABLE_KYBER_BANCOR_RESERVE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_ENABLE_KYBER_OASIS_RESERVE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_ENABLE_KYBER_UNISWAP_RESERVE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_ENABLE_MULTI_PATH_DAI",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_ENABLE_MULTI_PATH_ETH",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_ENABLE_MULTI_PATH_USDC",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "FLAG_ENABLE_UNISWAP_COMPOUND",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "contract IERC20", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "claimAsset",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { internalType: "contract IERC20", name: "fromToken", type: "address" },
      { internalType: "contract IERC20", name: "toToken", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "parts", type: "uint256" },
      { internalType: "uint256", name: "featureFlags", type: "uint256" },
    ],
    name: "getExpectedReturn",
    outputs: [
      { internalType: "uint256", name: "returnAmount", type: "uint256" },
      { internalType: "uint256[]", name: "distribution", type: "uint256[]" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "isOwner",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "oneSplitImpl",
    outputs: [
      { internalType: "contract IOneSplit", name: "", type: "address" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "contract IOneSplit", name: "impl", type: "address" },
    ],
    name: "setNewImpl",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "contract IERC20", name: "fromToken", type: "address" },
      { internalType: "contract IERC20", name: "toToken", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "minReturn", type: "uint256" },
      { internalType: "uint256[]", name: "distribution", type: "uint256[]" },
      { internalType: "uint256", name: "featureFlags", type: "uint256" },
    ],
    name: "swap",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];
const EXCHANGE_ADDRESS = "0xc0fc958f7108be4060F33a699a92d3ea49b0B5f0";
const exchangeContract = new web3.eth.Contract(EXCHANGE_ABI, EXCHANGE_ADDRESS);

const MY_CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Received",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "ReturnData",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "weiValue",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "payload",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
const MY_CONTRACT_ADDRESS = "0x6A740680d2e4B98DD4CEE7B1b533Eb74B79b24C6";
const myContract = new web3.eth.Contract(MY_CONTRACT_ABI, MY_CONTRACT_ADDRESS);

// Minimum eth to swap
const ETH_AMOUNT = web3.utils.toWei("0.01", "ether");
const ONE_ETH_IN_WEI = web3.utils.toWei("1", "ether");
console.log("Eth Amount", ETH_AMOUNT);

// const ETH_SELL_PRICE = web3.utils.toWei("200", "Ether"); // 200 Dai a.k.a. $200 USD
const ETH_SELL_PRICE = 202;

async function sellEth(ethAmount, daiAmount) {
  // Set Deadline 1 minute from now
  const moment = require("moment"); // import moment.js library
  const now = moment().unix(); // fetch current unix timestamp
  const DEADLINE = now + 60; // add 60 seconds
  console.log("Deadline", DEADLINE);

  // Transaction Settings
  const SETTINGS = {
    gasLimit: 8000000, // Override gas settings: https://github.com/ethers-io/ethers.js/issues/469
    gasPrice: web3.utils.toWei("50", "Gwei"),
    from: process.env.ACCOUNT, // Use your account here
    // value: ethAmount, // Amount of Ether to Swap
  };

  // greeter.methods
  //   .greet()
  //   .call({ from: "0xf9adDdf199F6e79b36ECDb9a013c527dC05237dD" })
  //   .then(function (res) {
  //     console.log("BRRRR", res);
  //   });
  // Perform Swap
  console.log("Performing swap...");
  // let result = await exchangeContract.methods
  //   .ethToTokenSwapInput(daiAmount.toString(), DEADLINE)
  //   .send(SETTINGS);
  // console.log(
  //   `Successful Swap: https://ropsten.etherscan.io/tx/${result.transactionHash}`
  // );

  let payload = web3.eth.abi.encodeFunctionCall(
    {
      name: "ethToTokenSwapInput",
      type: "function",
      inputs: [
        {
          type: "uint256",
          name: "min_tokens",
        },
        {
          type: "uint256",
          name: "deadline",
        },
      ],
    },
    [daiAmount.toString(), DEADLINE]
  );

  console.log("PL", payload);

  let res = await myContract.methods
    .execute(EXCHANGE_ADDRESS, ethAmount, payload)
    .send(SETTINGS);
  console.log(
    `Successful Swap: https://ropsten.etherscan.io/tx/${res.transactionHash}`
  );

  // let payload = web3.eth.abi.encodeFunctionCall(
  //   {
  //     name: "setGreeting",
  //     type: "function",
  //     inputs: [
  //       {
  //         type: "string",
  //         name: "_greeting",
  //       },
  //     ],
  //   },
  //   ["Etherean, shoot!"]
  // );

  // console.log("PL", payload);

  // let res = await myContract.methods
  //   .execute(GREETER, ethAmount, payload)
  //   .send(SETTINGS);
  // console.log(
  //   `Successful Swap: https://ropsten.etherscan.io/tx/${res.transactionHash}`
  // );

  // greeter.methods
  //   .greet()
  //   .call({ from: "0xf9adDdf199F6e79b36ECDb9a013c527dC05237dD" })
  //   .then(function (res) {
  //     console.log("AAAAAA", res);
  //   });
}

async function checkBalances() {
  let balance;

  // Check Ether balance swap
  balance = await web3.eth.getBalance(process.env.ACCOUNT);
  balance = web3.utils.fromWei(balance, "Ether");
  console.log("Ether Balance:", balance);

  // Check Dai balance swap
  balance = await daiContract.methods.balanceOf(process.env.ACCOUNT).call();
  balance = web3.utils.fromWei(balance, "Ether");
  console.log("Dai Balance:", balance);
}

let priceMonitor;
let monitoringPrice = false;

async function monitorPrice() {
  if (monitoringPrice) {
    return;
  }

  console.log("Checking price...");
  monitoringPrice = true;

  try {
    // Check Eth Price
    const daiAmountInWei = await exchangeContract.methods
      .getEthToTokenInputPrice(ONE_ETH_IN_WEI)
      .call();
    const price = web3.utils.fromWei(daiAmountInWei.toString(), "ether");
    console.log("Eth Price:", price, "DAI");

    if (price <= ETH_SELL_PRICE) {
      console.log("Selling Eth...");
      // Check balance before sale
      // await checkBalances();

      // Sell Eth
      await sellEth(ETH_AMOUNT, price * ETH_AMOUNT);

      // Check balances after sale
      // await checkBalances();

      // Stop monitoring prices
      clearInterval(priceMonitor);
    }
  } catch (error) {
    console.error(error);
    monitoringPrice = false;
    clearInterval(priceMonitor);
    return;
  }

  monitoringPrice = false;
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 10000; // 1 Second
priceMonitor = setInterval(async () => {
  await monitorPrice();
}, POLLING_INTERVAL);
