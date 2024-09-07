// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SimpleToken.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract SimpleFactory {
    address owner;
    address feeReceiver;
    address public uniswapRouter;
    uint256 constant FEE_PERCENTAGE = 1;
    uint256 constant INITIAL_ETH_LIQUIDITY = 1 ether;
    uint256 constant INITIAL_TOKEN_SUPPLY = 1000000000 * 10**18;

    mapping(address => TokenInfo) public tokens;
    mapping(address => uint256) public tokenEthSurplus;

    struct TokenInfo {
        bool isSupported;
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

    // Modified constructor to accept router address
    constructor(address _uniswapRouter) {
        owner = msg.sender;
        feeReceiver = msg.sender;
        uniswapRouter = _uniswapRouter == address(0) ? 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D : _uniswapRouter;
    }

    // Function to allow the owner to update the Uniswap router address
    function setUniswapRouter(address _uniswapRouter) external {
        require(msg.sender == owner, "Only owner can set the router");
        require(_uniswapRouter != address(0), "Router address cannot be zero");
        uniswapRouter = _uniswapRouter;
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

    function createAndBuyToken(
        string memory _name, 
        string memory _symbol, 
        string memory _description, 
        string memory _imageUrl, 
        string memory _twitterLink, 
        string memory _telegramLink, 
        string memory _websiteLink
    ) public payable {
        require(msg.value > 0, "You must send ETH to buy tokens");

        // Create the token
        SimpleToken newToken = new SimpleToken(_name, _symbol, INITIAL_TOKEN_SUPPLY);

        // Add the token to the mapping
        tokens[address(newToken)] = TokenInfo({
            isSupported: true,
            tokenAddress: address(newToken),
            virtualEth: INITIAL_ETH_LIQUIDITY,
            virtualTokens: INITIAL_TOKEN_SUPPLY
        });

        // Calculate the 1% fee
        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = msg.value - fee;

        // Send the fee to the feeReceiver
        payable(feeReceiver).transfer(fee);

        // Calculate how many tokens the buyer will receive
        uint256 tokensToTransfer = getTokenAmountToBuy(address(newToken), ethAfterFee);

        // Ensure there are enough tokens to transfer
        require(INITIAL_TOKEN_SUPPLY >= tokensToTransfer, "Not enough tokens available to buy");

        // Transfer the calculated tokens to the buyer
        newToken.transfer(msg.sender, tokensToTransfer);

        // Transfer the remaining tokens to the contract
        uint256 remainingTokens = INITIAL_TOKEN_SUPPLY - tokensToTransfer;
        newToken.transfer(address(this), remainingTokens);

        // Update token information
        tokens[address(newToken)].virtualEth += ethAfterFee;
        tokens[address(newToken)].virtualTokens -= tokensToTransfer;

        // Add the ETH from this transaction to the ETH surplus for this token
        tokenEthSurplus[address(newToken)] += ethAfterFee;

        // If the total ETH surplus is >= 1 ETH, add liquidity on Uniswap V2
        if (tokenEthSurplus[address(newToken)] >= 1 ether) {
            uint256 ethSurplus = tokenEthSurplus[address(newToken)];

            // Add 90% of the total ETH surplus to liquidity
            uint256 ethToAdd = (ethSurplus * 99) / 100;

            // Call the liquidity function
            addLiquidityAndBurn(address(newToken), ethToAdd, 400);

            // Update the remaining 10% surplus after liquidity is added
            tokenEthSurplus[address(newToken)] = ethSurplus - ethToAdd;

            // Optionally mark token as no longer supported if needed
            tokens[address(newToken)].isSupported = false;
        }

        // Emit token creation and purchase events
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

        emit TokenPurchased(
            msg.sender, 
            address(newToken), 
            msg.value, 
            tokensToTransfer, 
            getCurrentPrice(address(newToken))
        );
    }

    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        require(tokens[tokenAddress].isSupported, "Token not supported");
        return tokens[tokenAddress];
    }

    function buyToken(address tokenAddress, uint256 maxEth) public payable {
        require(tokens[tokenAddress].isSupported, "Token not supported by this factory");
        require(msg.value > 0, "You must send ETH to buy tokens");
        require(msg.value <= maxEth, "You sent more ETH than the maximum allowed");

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

        // Add the ETH from this transaction to the ETH surplus for this token
        tokenEthSurplus[tokenAddress] += ethAfterFee;

        // If the total ETH surplus is >= 1 ETH, add liquidity
        if (tokenEthSurplus[tokenAddress] >= 1 ether) {
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];
            uint256 ethToAdd = (ethSurplus * 99) / 100;

            // Call the liquidity function
            addLiquidityAndBurn(tokenAddress, ethToAdd, 400);

            // Update the remaining surplus after liquidity is added
            tokenEthSurplus[tokenAddress] = ethSurplus - ethToAdd;
        }

        emit TokenPurchased(
            msg.sender, 
            tokenAddress, 
            msg.value, 
            tokensToMint, 
            getCurrentPrice(tokenAddress)
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

        // Add the ETH from this transaction to the ETH surplus for this token
        tokenEthSurplus[tokenAddress] += ethAfterFee;

        // If the total ETH surplus is >= 1 ETH, add liquidity
        if (tokenEthSurplus[tokenAddress] >= 1 ether) {
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];
            uint256 ethToAdd = (ethSurplus * 99) / 100;

            // Call the liquidity function
            addLiquidityAndBurn(tokenAddress, ethToAdd, 400);

            // Update the remaining surplus after liquidity is added
            tokenEthSurplus[tokenAddress] = ethSurplus - ethToAdd;
        }

        emit TokenSold(
            msg.sender, 
            tokenAddress, 
            ethAfterFee, 
            _tokenAmount, 
            getCurrentPrice(tokenAddress)
        );
    }

    // Function to add liquidity to Uniswap V2 and directly burn LP tokens, and then remove the token from the mapping
    function addLiquidityAndBurn(
        address tokenAddress, 
        uint256 ethToAdd, 
        uint256 slippageTolerance  // slippage tolerance in basis points (100 = 1%)
    ) internal {
        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        uint256 tokenAmountToAdd = token.balanceOf(address(this));

        require(tokenAmountToAdd > 0, "Factory owns no tokens");
        require(ethToAdd > 0, "No ETH to add");

        // Calculate 90% of the ETH surplus to be added as liquidity
        uint256 ethToAddLiquidity = (ethToAdd * 90) / 100;

        // Calculate 9.9% of the ETH surplus to be sent to the feeReceiver
        uint256 ethToFeeReceiver = (ethToAdd * 99) / 1000;

        // 0.1% of the surplus remains in the contract as the new surplus
        uint256 remainingSurplus = ethToAdd - ethToAddLiquidity - ethToFeeReceiver;

        // Get the current price ratio of token to ETH from Uniswap pool
        (uint256 reserveToken, uint256 reserveETH) = getReservesFromUniswap(tokenAddress);
        
        // Calculate the expected amount of tokens based on the current price ratio
        uint256 expectedTokenAmount = (ethToAddLiquidity * reserveToken) / reserveETH;

        // Calculate the minimum amounts to account for slippage tolerance
        uint256 minTokenAmount = (expectedTokenAmount * (10000 - slippageTolerance)) / 10000;  // 10000 basis points = 100%
        uint256 minEthAmount = (ethToAddLiquidity * (10000 - slippageTolerance)) / 10000;

        // Approve the Uniswap router to spend the token amount
        token.approve(uniswapRouter, tokenAmountToAdd);

        // Add liquidity to Uniswap V2 with slippage control
        IUniswapV2Router02(uniswapRouter).addLiquidityETH{value: ethToAddLiquidity}(
            tokenAddress,
            tokenAmountToAdd,
            minTokenAmount,  // Minimum token amount with slippage tolerance
            minEthAmount,    // Minimum ETH amount with slippage tolerance
            address(0),      // Burn LP tokens (send to the dead address)
            block.timestamp + 300  // Deadline for the transaction
        );

        // Send 9.9% of the ETH surplus to the feeReceiver
        payable(feeReceiver).transfer(ethToFeeReceiver);

        // Emit event for liquidity addition
        emit LiquidityAdded(tokenAddress, ethToAddLiquidity, tokenAmountToAdd, address(0));
        
        // Update the remaining 0.1% surplus for the token
        tokenEthSurplus[tokenAddress] = remainingSurplus;

        // Remove the token from the mapping after liquidity is added
        delete tokens[tokenAddress];
    }

    // Helper function to get reserves from Uniswap pair contract
    function getReservesFromUniswap(address tokenAddress) internal view returns (uint256 reserveToken, uint256 reserveETH) {
        address pair = IUniswapV2Factory(uniswapFactory).getPair(tokenAddress, uniswapRouter.WETH());
        (reserveToken, reserveETH,) = IUniswapV2Pair(pair).getReserves();
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

    function withdraw(uint256 amount) public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        require(address(this).balance >= amount, "Not enough ETH in the contract");
        payable(owner).transfer(amount);
    }

    function withdrawAll() public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        payable(owner).transfer(address(this).balance);
    }

    function removeToken(address tokenAddress) public {
        require(msg.sender == owner, "Only the owner can remove tokens");
        delete tokens[tokenAddress];  // This will remove the token's info from the mapping
    }
}
