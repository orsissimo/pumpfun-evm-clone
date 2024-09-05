// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SimpleToken.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract SimpleFactory {
    address owner;
    address feeReceiver;  // Address to receive the 1% fee
    address uniswapRouter;  // Uniswap V2 Router address
    uint256 constant FEE_PERCENTAGE = 1; // 1% fee
    uint256 constant INITIAL_ETH_LIQUIDITY = 1 ether;
    uint256 constant INITIAL_TOKEN_SUPPLY = 1000000000 * 10**18; // 1 billion tokens with 18 decimals

    mapping(address => TokenInfo) public tokens; // Public mapping of tokens created
    mapping(address => uint256) public tokenEthSurplus; // Track ETH surplus per token

    struct TokenInfo {
        bool isSupported;  // Indicates whether the token is still supported by the factory
        address tokenAddress;
        uint256 virtualEth;
        uint256 virtualTokens;
    }

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply,
        string description,
        string imageUrl,
        string twitterLink,
        string telegramLink,
        string websiteLink
    );

    event TokenPurchased(
        address indexed buyer,
        address indexed tokenAddress,
        uint256 ethSpent,
        uint256 tokensBought,
        uint256 pricePerToken
    );

    event TokenSold(
        address indexed seller,
        address indexed tokenAddress,
        uint256 ethReceived,
        uint256 tokensSold,
        uint256 pricePerToken
    );

    event LiquidityAdded(
        address indexed tokenAddress,
        uint256 ethAdded,
        uint256 tokensAdded,
        address indexed lpTokenAddress
    );

    // Set feeReceiver and uniswapRouter in the constructor
    constructor() {
        owner = msg.sender;
        feeReceiver = msg.sender;  // Set the fee receiver to the deployer's address
        uniswapRouter = 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24;  // Hardcoded Uniswap V2 router address
    }

    function createToken(
        string memory _name, 
        string memory _symbol, 
        string memory _description, 
        string memory _imageUrl, 
        string memory _twitterLink, 
        string memory _telegramLink, 
        string memory _websiteLink
    ) public {
        SimpleToken newToken = new SimpleToken(_name, _symbol, INITIAL_TOKEN_SUPPLY);

        tokens[address(newToken)] = TokenInfo({
            isSupported: true,
            tokenAddress: address(newToken),
            virtualEth: INITIAL_ETH_LIQUIDITY,
            virtualTokens: INITIAL_TOKEN_SUPPLY
        });

        newToken.transfer(address(this), INITIAL_TOKEN_SUPPLY);

        emit TokenCreated(
            address(newToken), 
            _name, 
            _symbol, 
            INITIAL_TOKEN_SUPPLY, 
            _description, 
            _imageUrl, 
            _twitterLink, 
            _telegramLink, 
            _websiteLink
        );
    }

    // Function to retrieve token info by token address
    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        require(tokens[tokenAddress].isSupported, "Token not supported");
        return tokens[tokenAddress];
    }

    function buyToken(address tokenAddress, uint256 maxEth) public payable {
        require(tokens[tokenAddress].isSupported, "Token not supported by this factory");
        require(msg.value > 0, "You must send ETH to buy tokens");
        require(msg.value <= maxEth, "You sent more ETH than the allowed maximum");

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        // Calculate the 1% fee
        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = msg.value - fee;

        // Send the fee to the feeReceiver
        payable(feeReceiver).transfer(fee);

        uint256 tokensToMint = getTokenAmountToBuy(tokenAddress, ethAfterFee);

        require(token.balanceOf(address(this)) >= tokensToMint, "Not enough tokens available for sale");

        token.transfer(msg.sender, tokensToMint);

        tokenInfo.virtualEth += ethAfterFee;
        tokenInfo.virtualTokens -= tokensToMint;

        // Track ETH surplus for liquidity
        tokenEthSurplus[tokenAddress] += ethAfterFee;

        // If surplus ETH reaches or exceeds 1 ETH, add liquidity to Uniswap V2 and burn LP tokens
        if (tokenEthSurplus[tokenAddress] >= 0.005 ether) {
            // Add liquidity and reset surplus
            uint256 remainingSurplus = tokenEthSurplus[tokenAddress] - 0.005 ether; // Carry over the extra ETH
            addLiquidityAndBurn(tokenAddress, 0.005 ether); // Add 1 ETH worth of liquidity
            tokenEthSurplus[tokenAddress] = remainingSurplus; // Update the surplus with remaining ETH

            // Mark token as no longer supported
            tokens[tokenAddress].isSupported = false;
        }

        emit TokenPurchased(
            msg.sender, 
            tokenAddress, 
            msg.value, 
            tokensToMint, 
            getCurrentPrice(tokenAddress)  // Include price per token in the event
        );
    }


    function sellToken(address tokenAddress, uint256 _tokenAmount) public {
        require(tokens[tokenAddress].isSupported, "Token not supported by this factory");
        require(_tokenAmount > 0, "You must specify a positive amount of tokens to sell");

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        require(token.balanceOf(msg.sender) >= _tokenAmount, "Not enough tokens to sell");

        uint256 ethToReturn = getEthAmountToSell(tokenAddress, _tokenAmount);

        // Calculate the 1% fee
        uint256 fee = (ethToReturn * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = ethToReturn - fee;

        require(address(this).balance >= ethAfterFee, "Not enough ETH in the contract to complete the sale");

        // Transfer tokens from the seller to the contract
        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");

        // Send the fee to the feeReceiver
        payable(feeReceiver).transfer(fee);

        // Send the remaining ETH to the seller
        payable(msg.sender).transfer(ethAfterFee);

        tokenInfo.virtualEth -= ethAfterFee;
        tokenInfo.virtualTokens += _tokenAmount;

        // Subtract ETH given to the user from the surplus
        tokenEthSurplus[tokenAddress] -= ethAfterFee;

        // If surplus ETH reaches 1 ETH, add liquidity to Uniswap V2 and burn LP tokens
        if (tokenEthSurplus[tokenAddress] >= 0.005 ether) {
            addLiquidityAndBurn(tokenAddress, tokenEthSurplus[tokenAddress]);

            // Mark token as no longer supported
            tokens[tokenAddress].isSupported = false;
        }

        emit TokenSold(
            msg.sender, 
            tokenAddress, 
            ethAfterFee, 
            _tokenAmount, 
            getCurrentPrice(tokenAddress)  // Include price per token in the event
        );
    }


    // Function to add liquidity to Uniswap V2 and directly burn LP tokens
    function addLiquidityAndBurn(address tokenAddress, uint256 ethToAdd) internal {
        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        uint256 tokenAmountToAdd = token.balanceOf(address(this));

        require(tokenAmountToAdd > 0, "Factory owns no tokens");
        require(ethToAdd > 0, "No ETH to add");

        // Approve the Uniswap router to spend all tokens owned by the factory
        token.approve(uniswapRouter, tokenAmountToAdd);

        // Add liquidity to Uniswap V2 and send LP tokens directly to the dead address
        IUniswapV2Router02(uniswapRouter).addLiquidityETH{value: ethToAdd}(
            tokenAddress,
            tokenAmountToAdd,
            0,  // Slippage is okay
            0,  // Slippage is okay
            address(0x040161ecD0557D111338CfCB458F66d2EFF0887C),  // LP tokens will be sent directly to the dead address (burned)
            block.timestamp + 300  // Deadline for the transaction
        );

        // Emit event for liquidity addition
        emit LiquidityAdded(tokenAddress, ethToAdd, tokenAmountToAdd, address(0));
    }


    function getTokenAmountToBuy(address tokenAddress, uint256 ethAmount) public view returns (uint256) {
        TokenInfo storage tokenInfo = tokens[tokenAddress];
        uint256 tokensToMint = (tokenInfo.virtualTokens * ethAmount) / (tokenInfo.virtualEth + ethAmount);
        return tokensToMint;
    }

    function getEthAmountToSell(address tokenAddress, uint256 tokenAmount) public view returns (uint256) {
        TokenInfo storage tokenInfo = tokens[tokenAddress];
        uint256 ethToReturn = (tokenInfo.virtualEth * tokenAmount) / (tokenInfo.virtualTokens + tokenAmount);
        return ethToReturn;
    }

    function getCurrentPrice(address tokenAddress) public view returns (uint256) {
        TokenInfo storage tokenInfo = tokens[tokenAddress];
        return (tokenInfo.virtualEth * 1 ether) / tokenInfo.virtualTokens;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        payable(owner).transfer(address(this).balance);
    }
}
