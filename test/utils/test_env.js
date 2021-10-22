const chai = require("chai");
const { solidity } = require("ethereum-waffle");

chai.use(solidity);

expect = chai.expect;

module.exports = { expect };
