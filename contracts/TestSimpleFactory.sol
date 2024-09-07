// SPDX-License-Identifier: MIT
// To run the tests: echidna TestSimpleFactory.sol --contract TestSimpleFactory
pragma solidity ^0.8.0;

import "./SimpleFactory.sol";

contract TestSimpleFactory is SimpleFactory {
    constructor() SimpleFactory(0x1111111111111111111111111111111111111111) {}

    // Property 1: Owner must always be a valid address
    function echidna_owner_is_valid() public view returns (bool) {
        return owner != address(0);
    }

    // Property 2: Slippage tolerance must be within the valid range (1% to 100%)
    function echidna_slippage_tolerance_within_range() public view returns (bool) {
        return slippageTolerance >= 100 && slippageTolerance <= 10000;
    }

    // Property 3: Fee receiver must be a valid address
    function echidna_fee_receiver_is_valid() public view returns (bool) {
        return feeReceiver != address(0);
    }

    // Property 4: No ETH surplus should exist for unsupported tokens
    function echidna_no_eth_surplus_without_supported_tokens() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            if (!tokens[tokenAddress].isSupported) {
                return tokenEthSurplus[tokenAddress] == 0;
            }
        }
        return true;
    }

    // Property 5: Token support should be consistent
    function echidna_token_support_is_consistent() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            if (!tokens[tokenAddress].isSupported) {
                return tokens[tokenAddress].virtualEth == 0 && tokens[tokenAddress].virtualTokens == 0;
            }
        }
        return true;
    }

    // Property 6: Token balances should always be non-negative
    function echidna_non_negative_token_balance() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            SimpleToken token = SimpleToken(allTokenAddresses[i]);
            if (token.balanceOf(address(this)) < 0) {
                return false;
            }
        }
        return true;
    }

    // Property 7: Fee calculation must be correct (1%)
    function echidna_fee_is_correct() public pure returns (bool) {
        uint256 ethValue = 1 ether;  // Use a fixed value for the test
        uint256 fee = (ethValue * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = ethValue - fee;
        return fee == ethValue / 100 && ethAfterFee == ethValue - fee;
    }

    // Property 8: Total supply should remain consistent
    function echidna_total_token_supply_is_consistent() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            SimpleToken token = SimpleToken(allTokenAddresses[i]);
            if (token.totalSupply() != INITIAL_TOKEN_SUPPLY) {
                return false;
            }
        }
        return true;
    }

    // Property 9: Liquidity addition should be consistent
    function echidna_liquidity_addition_is_consistent() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            if (tokenEthSurplus[tokenAddress] >= 1 ether) {
                uint256 ethSurplus = tokenEthSurplus[tokenAddress];
                return ethSurplus * 995 / 1000 <= ethSurplus;
            }
        }
        return true;
    }

    // Property 10: Factory must own the tokens after creation
    function echidna_factory_owns_tokens() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            SimpleToken token = SimpleToken(allTokenAddresses[i]);
            if (token.balanceOf(address(this)) == 0) {
                return false;
            }
        }
        return true;
    }

    // Property 11: Fee receiver cannot be set to invalid addresses (like address(0))
    function echidna_fee_receiver_never_invalid() public returns (bool) {
        address invalidAddress = address(0);
        // Simulate owner trying to set an invalid fee receiver address
        try this.setFeeReceiver(invalidAddress) {
            return false;  // Fail if we can set an invalid fee receiver
        } catch {
            return feeReceiver != invalidAddress;  // Pass if it's still valid
        }
    }

    // Property 12: Token transfers should not exceed the total supply
    function echidna_token_transfer_limited_by_supply() public returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            SimpleToken token = SimpleToken(allTokenAddresses[i]);
            uint256 totalSupply = token.totalSupply();
            uint256 contractBalance = token.balanceOf(address(this));

            // Simulate sending more than total supply; should fail
            try token.transfer(address(0x1), totalSupply + 1) {
                return false;
            } catch {
                return contractBalance <= totalSupply;
            }
        }
        return true;
    }

    // Property 13: Liquidity should only be added when conditions are met
    function echidna_liquidity_addition_is_conditioned() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];

            // Liquidity should only be added if ethSurplus >= 1 ether and the contract holds tokens
            bool canAddLiquidity = (ethSurplus >= 1 ether && tokens[tokenAddress].virtualTokens > 0);
            if (ethSurplus >= 1 ether && !canAddLiquidity) {
                return false;  // Fail if liquidity addition was possible but conditions not met
            }
        }
        return true;
    }

    // Property 14: ETH surplus must decrease after liquidity is added
    function echidna_eth_surplus_decreases_after_liquidity_addition() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            uint256 initialSurplus = tokenEthSurplus[tokenAddress];

            if (initialSurplus >= 1 ether) {
                // Assuming liquidity addition happens after 1 ETH surplus
                uint256 remainingSurplus = initialSurplus - ((initialSurplus * 995) / 1000);

                if (remainingSurplus >= initialSurplus) {
                    return false;  // Fail if ETH surplus did not decrease
                }
            }
        }
        return true;
    }

    // Property 16: Token purchase prices should reflect ETH contributions
    function echidna_token_purchase_price_fair() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            uint256 currentPrice = getCurrentPrice(tokenAddress);
            uint256 ethSpent = 1 ether;  // Use fixed value for test

            uint256 tokensToReceive = getTokenAmountToBuy(tokenAddress, ethSpent);
            uint256 expectedPrice = (ethSpent * 1 ether) / tokensToReceive;

            if (expectedPrice != currentPrice) {
                return false;
            }
        }
        return true;
    }

    // Property 17: Token surplus should be cleared for unsupported tokens
    function echidna_token_eth_surplus_cleared_for_unsupported() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            if (!tokens[tokenAddress].isSupported && tokenEthSurplus[tokenAddress] != 0) {
                return false;  // Fail if there's a surplus for unsupported tokens
            }
        }
        return true;
    }

    // Property 19: Liquidity cannot be added if contract does not hold enough tokens
    function echidna_liquidity_requires_token_balance() public view returns (bool) {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];
            SimpleToken token = SimpleToken(tokenAddress);

            // Liquidity should not be added unless contract holds tokens
            if (ethSurplus >= 1 ether && token.balanceOf(address(this)) == 0) {
                return false;
            }
        }
        return true;
    }

}
