const ganache = require('ganache');
const { Web3 } = require('web3');
const assert = require('assert');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let accounts;
let donationCampaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  const minApprovals = 0;
  donationCampaign = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: [minApprovals] })
    .send({ from: accounts[0], gas: '1000000' });
  console.log(donationCampaign);
});

describe('DonationCampaign', () => {

  it('deploys a contract', async () => {
    assert.ok(donationCampaign.options.address);
  });

  it('marks caller as the manager', async () => {
    const manager = await donationCampaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('allows people to contribute money and marks them as approvers', async () => {
    await donationCampaign.methods.contribute().send({
      value: web3.utils.toWei('0.02', 'ether'),
      from: accounts[1]
    });
    const isContributor = await donationCampaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    try {
      await donationCampaign.methods.contribute().send({
        value: '10',
        from: accounts[2]
      });
      assert(false);
    }
    catch (err) {
      assert(err);
    }
  });

  it('allows a manager to create a payment request', async () => {
    await donationCampaign.methods
    .createRequest('Buy batteries', web3.utils.toWei('0.01', 'ether'), accounts[1])
    .send({
      from: accounts[0],
      gas: '1000000'
    });
    const request = await donationCampaign.methods.requests(0).call();
    assert.equal('Buy batteries', request.description);
  });

  it('processes requests', async () => {
    await donationCampaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await donationCampaign.methods
    .createRequest('A', web3.utils.toWei('0.01', 'ether'), accounts[1])
    .send({ from: accounts[0], gas: '1000000' });

    await donationCampaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    await donationCampaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);
    assert(balance > 103.99);
  });
});
