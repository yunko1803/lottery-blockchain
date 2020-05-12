const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
	'enemy reason upon disagree popular pitch about harbor wheat game type riot',
	'https://rinkeby.infura.io/v3/1f26f97b9fca4a4da64d4439a58a668e'
);
const web3 = new Web3(provider);

// const result = await new web3.eth.Contract(JSON.parse(interface))
// 	.deploy({ data: bytecode, arguments: ['Hi there!'] })
// 	.send({ gas: '1000000', from: accounts[0] });

// const result = await new web3.eth.Contract(JSON.parse(interface))
// 	.deploy({ data: '0x' + bytecode, arguments: ['Hi there!'] }) // add 0x bytecode
// 	.send({ from: accounts[0] }); // remove 'gas'

const deploy = async () => {
	const accounts = await web3.eth.getAccounts();
	console.log(accounts);

	const result = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ gas: '1000000', from: accounts[0] });
	console.log(result.options.address);
};

deploy();
