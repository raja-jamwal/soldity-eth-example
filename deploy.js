/**
 * Deploy the contract to the Sepolia network,
 * using the HDWalletProvider + MetaMask pass phrase.
 * and the Infura endpoint to access the Sepolia Network.
 */
const HDWalletProvider = require('@truffle/hdwallet-provider');
const {Web3} = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
    'exit message virus item next axis option gap ahead leaf nuclear culture',
    'https://sepolia.infura.io/v3/33da8fea3ed3476b850b4632a2025371'
);

const web3 = new Web3(provider);
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account', accounts[0]);
  const result = await new web3.eth.Contract(JSON.parse(interface))
  .deploy({data: bytecode, arguments: [0]})
  .send({gas: '1000000', from: accounts[0]});
  console.log(interface);
  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};
deploy();
