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
        bool exists;
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

    constructor(address _feeReceiver, address _uniswapRouter) {
        owner = msg.sender;
        feeReceiver = _feeReceiver;  // Set the fee receiver address during contract deployment
        uniswapRouter = _uniswapRouter;  // Set the Uniswap V2 Router address
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
            exists: true,
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
        require(tokens[tokenAddress].exists, "Token not found");
        return tokens[tokenAddress];
    }

    function createAndBuyToken(
        string memory _name, 
        string memory _symbol, 
        string memory _description, 
        string memory _imageUrl, 
        string memory _twitterLink, 
        string memory _telegramLink, 
        string memory _websiteLink,
        uint256 maxEthToSpend // Developer can specify how much ETH they want to use to buy the token
    ) public payable {
        // Create the token
        createToken(_name, _symbol, _description, _imageUrl, _twitterLink, _telegramLink, _websiteLink);

        // Get the newly created token's address
        address tokenAddress = address(new SimpleToken(_name, _symbol, INITIAL_TOKEN_SUPPLY));

        // Developer buys the tokens using the provided ETH
        buyToken(tokenAddress, maxEthToSpend);
    }

    function buyToken(address tokenAddress, uint256 maxEth) public payable {
        require(tokens[tokenAddress].exists, "Token non creato da questa factory");
        require(msg.value > 0, "Devi inviare ETH per acquistare token");
        require(msg.value <= maxEth, "Hai inviato piu ETH del massimo consentito");

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        // Calculate the 1% fee
        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = msg.value - fee;

        // Send the fee to the feeReceiver
        payable(feeReceiver).transfer(fee);

        uint256 tokensToMint = getTokenAmountToBuy(tokenAddress, ethAfterFee);

        require(token.balanceOf(address(this)) >= tokensToMint, "Non ci sono abbastanza token disponibili per la vendita");

        token.transfer(msg.sender, tokensToMint);

        tokenInfo.virtualEth += ethAfterFee;
        tokenInfo.virtualTokens -= tokensToMint;

        // Track ETH surplus for liquidity
        tokenEthSurplus[tokenAddress] += ethAfterFee;

        // If surplus ETH reaches 1 ETH, add liquidity to Uniswap V2 and burn LP tokens
        if (tokenEthSurplus[tokenAddress] >= 1 ether) {
            addLiquidityAndBurn(tokenAddress, tokenEthSurplus[tokenAddress]);
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
        require(tokens[tokenAddress].exists, "Token non creato da questa factory");
        require(_tokenAmount > 0, "Devi specificare un numero positivo di token da vendere");

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        require(token.balanceOf(msg.sender) >= _tokenAmount, "Non hai abbastanza token da vendere");

        uint256 ethToReturn = getEthAmountToSell(tokenAddress, _tokenAmount);

        // Calculate the 1% fee
        uint256 fee = (ethToReturn * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = ethToReturn - fee;

        require(address(this).balance >= ethAfterFee, "Non hai abbastanza ETH nel contratto per completare la vendita");

        // Transfer tokens from the seller to the contract
        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");

        // Send the fee to the feeReceiver
        payable(feeReceiver).transfer(fee);

        // Send the remaining ETH to the seller
        payable(msg.sender).transfer(ethAfterFee);

        tokenInfo.virtualEth -= ethAfterFee;
        tokenInfo.virtualTokens += _tokenAmount;

        // Track ETH surplus for liquidity
        tokenEthSurplus[tokenAddress] += ethAfterFee;

        // If surplus ETH reaches 1 ETH, add liquidity to Uniswap V2 and burn LP tokens
        if (tokenEthSurplus[tokenAddress] >= 1 ether) {
            addLiquidityAndBurn(tokenAddress, tokenEthSurplus[tokenAddress]);
        }

        emit TokenSold(
            msg.sender, 
            tokenAddress, 
            ethAfterFee, 
            _tokenAmount, 
            getCurrentPrice(tokenAddress)  // Include price per token in the event
        );
    }

    // Function to add liquidity to Uniswap V2 and burn LP tokens
    function addLiquidityAndBurn(address tokenAddress, uint256 ethSurplus) internal {
        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        uint256 ethToAdd = (ethSurplus * 90) / 100; // 90% of surplus to be added to liquidity
        uint256 tokenAmountToAdd = getTokenAmountToBuy(tokenAddress, ethToAdd);

        require(token.balanceOf(address(this)) >= tokenAmountToAdd, "Non ci sono abbastanza token");

        // Approve the Uniswap router to spend tokens
        token.approve(uniswapRouter, tokenAmountToAdd);

        // Add liquidity to Uniswap V2
        IUniswapV2Router02(uniswapRouter).addLiquidityETH{value: ethToAdd}(
            tokenAddress,
            tokenAmountToAdd,
            0,  // Slippage is okay
            0,  // Slippage is okay
            address(this),  // LP tokens will be sent to this contract
            block.timestamp + 300  // Deadline for the transaction
        );

        // Reset the ETH surplus after adding liquidity
        tokenEthSurplus[tokenAddress] = 0;

        // Burn the LP tokens
        burnLiquidityTokens();
    }

    // Burn liquidity tokens after adding liquidity
    function burnLiquidityTokens() internal {
        // Logic to burn LP tokens
        // This would involve transferring the LP tokens to the zero address
        // Assuming the contract holds the LP tokens after liquidity is added
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
