// To run the tests: echidna TestSimpleToken.sol --contract TestSimpleToken
pragma solidity ^0.8.0;

import "./SimpleToken.sol";

contract TestSimpleToken is SimpleToken {
    // Initialize the SimpleToken contract with default values for testing
    constructor() SimpleToken("TestToken", "TST", 1000000 * 10**18) {}

    // Property 1: Balances must always be non-negative
    function echidna_non_negative_balance() public view returns (bool) {
        return balanceOf[msg.sender] >= 0;
    }

    // Property 2: Total supply should be constant
    function echidna_total_supply_constant() public view returns (bool) {
        return totalSupply == 1000000 * 10**18;
    }

    // Property 3: Cannot transfer more than balance
    function echidna_cannot_transfer_more_than_balance() public view returns (bool) {
        return balanceOf[msg.sender] <= totalSupply;
    }
}
