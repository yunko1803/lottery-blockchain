const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;
let MANAGERADDRESS;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	MANAGERADDRESS = accounts[0];

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
	it('deploys a contract', async () => {
		assert.ok(lottery.options.address);
	});
	it('has default manager address', async () => {
		let manager = await lottery.methods.manager().call();
		assert.equal(manager, MANAGERADDRESS);
	});
	it('allows one account to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether'),
		});
		//is from really needed?
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		//checking first account address with first address in the players list
		assert.equal(accounts[0], players[0]);
		//after adding one player, the length of list should equal 1
		assert.equal(1, players.length);
	});
	it('allows multiple accounts to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether'),
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether'),
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.02', 'ether'),
		});
		//is from really needed?
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		//checking each account address with each player address
		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		//checking 3
		assert.equal(3, players.length);
	});
	it('requires minimum amount of ether', async () => {
		let check;
		try {
			//something wrong here
			await lottery.methods.enter().send({ from: accounts[1], value: web3.util.toWei('0.0001', 'ether') });
			console.log('hi');
			check = 'success';
		} catch (e) {
			check = 'fail';
		}
		assert.equal('fail', check);
	});
	it('only manager can call pickWinner', async () => {
		let check;
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether'),
		});
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1],
			});
			check = 'success';
		} catch (e) {
			// assert(e);
			check = 'fail';
		}
		assert.equal('fail', check);
	});
	it('sends money to the winner and resets the players array', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether'),
		});
		const initialBalance = await web3.eth.getBalance(accounts[0]);

		await lottery.methods.pickWinner().send({ from: accounts[0] });
		const afterBalance = await web3.eth.getBalance(accounts[0]);

		const difference = afterBalance - initialBalance;
		assert(difference > web3.utils.toWei('1.8', 'ether'));
	});
	it('resets the players after picking winner', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether'),
		});

		await lottery.methods.pickWinner().send({ from: accounts[0] });

		const players = await lottery.methods.getPlayers().call();
		assert.equal(0, players.length);
	});
	it('resets the balance after picking winner', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('1', 'ether'),
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('2', 'ether'),
		});

		await lottery.methods.pickWinner().send({ from: accounts[0] });

		const balance = await web3.eth.getBalance(lottery.options.address);

		assert.equal(0, balance);
	});
});
