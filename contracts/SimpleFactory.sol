// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SimpleToken.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimpleFactory is ReentrancyGuard {
    address public owner;
    address public feeReceiver;
    address public uniswapRouter;
    uint256 public slippageTolerance = 500;
    uint256 public ethCap = 4 ether;
    uint256 constant FEE_PERCENTAGE = 1;
    uint256 constant INITIAL_ETH_LIQUIDITY = 1 ether;
    uint256 constant INITIAL_TOKEN_SUPPLY = 1000000000 * 10**18;

    mapping(address => TokenInfo) public tokens;
    mapping(address => uint256) public tokenEthSurplus;
    address[] public allTokenAddresses;

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

    event TokenRemoved(address indexed tokenAddress);
    event TokenAddedManually(address indexed tokenAddress);

    constructor(address _uniswapRouter) {
        owner = msg.sender;
        feeReceiver = msg.sender;
        uniswapRouter = _uniswapRouter;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
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

        allTokenAddresses.push(address(newToken));
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
    ) public payable nonReentrant {
        require(msg.value > 0, "You must send ETH to buy tokens");

        SimpleToken newToken = new SimpleToken(_name, _symbol, INITIAL_TOKEN_SUPPLY);

        tokens[address(newToken)] = TokenInfo({
            isSupported: true,
            tokenAddress: address(newToken),
            virtualEth: INITIAL_ETH_LIQUIDITY,
            virtualTokens: INITIAL_TOKEN_SUPPLY
        });

        allTokenAddresses.push(address(newToken));

        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = msg.value - fee;

        payable(feeReceiver).transfer(fee);

        uint256 tokensToTransfer = getTokenAmountToBuy(address(newToken), ethAfterFee);

        require(INITIAL_TOKEN_SUPPLY >= tokensToTransfer, "Not enough tokens available to buy");

        newToken.transfer(msg.sender, tokensToTransfer);

        uint256 remainingTokens = INITIAL_TOKEN_SUPPLY - tokensToTransfer;
        newToken.transfer(address(this), remainingTokens);

        tokens[address(newToken)].virtualEth += ethAfterFee;
        tokens[address(newToken)].virtualTokens -= tokensToTransfer;

        tokenEthSurplus[address(newToken)] += ethAfterFee;

        if (tokenEthSurplus[address(newToken)] >= ethCap) {
            uint256 ethSurplus = tokenEthSurplus[address(newToken)];
            uint256 ethToAdd = (ethSurplus * 999) / 1000;
            addLiquidityAndBurn(address(newToken), ethToAdd);
            tokenEthSurplus[address(newToken)] = ethSurplus - ethToAdd;
            tokens[address(newToken)].isSupported = false;
        }

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

    function buyToken(address tokenAddress, uint256 maxEth) public payable nonReentrant {
        require(tokens[tokenAddress].isSupported, "Token not supported by this factory");
        require(msg.value > 0, "You must send ETH to buy tokens");
        require(msg.value <= maxEth, "You sent more ETH than the allowed maximum");

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = msg.value - fee;

        payable(feeReceiver).transfer(fee);

        uint256 tokensToMint = getTokenAmountToBuy(tokenAddress, ethAfterFee);

        require(token.balanceOf(address(this)) >= tokensToMint, "Not enough tokens available for sale");

        token.transfer(msg.sender, tokensToMint);

        tokenInfo.virtualEth += ethAfterFee;
        tokenInfo.virtualTokens -= tokensToMint;

        tokenEthSurplus[tokenAddress] += ethAfterFee;

        if (tokenEthSurplus[tokenAddress] >= ethCap) {
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];
            uint256 ethToAdd = (ethSurplus * 999) / 1000;
            addLiquidityAndBurn(tokenAddress, ethToAdd);
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

    function sellToken(address tokenAddress, uint256 _tokenAmount) public nonReentrant {
        require(tokens[tokenAddress].isSupported, "Token not supported by this factory");
        require(_tokenAmount > 0, "You must specify a positive amount of tokens to sell");

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        SimpleToken token = SimpleToken(tokenAddress);

        require(token.balanceOf(msg.sender) >= _tokenAmount, "Not enough tokens to sell");

        uint256 ethToReturn = getEthAmountToSell(tokenAddress, _tokenAmount);

        uint256 fee = (ethToReturn * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = ethToReturn - fee;

        require(address(this).balance >= ethAfterFee, "Not enough ETH in the contract to complete the sale");

        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");

        payable(feeReceiver).transfer(fee);

        payable(msg.sender).transfer(ethAfterFee);

        tokenInfo.virtualEth -= ethAfterFee;
        tokenInfo.virtualTokens += _tokenAmount;

        tokenEthSurplus[tokenAddress] += ethAfterFee;

        if (tokenEthSurplus[tokenAddress] >= ethCap) {
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];
            uint256 ethToAdd = (ethSurplus * 999) / 1000;
            addLiquidityAndBurn(tokenAddress, ethToAdd);
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

    function addLiquidityAndBurn(address tokenAddress, uint256 ethToAdd) internal {
        SimpleToken token = SimpleToken(tokenAddress);

        uint256 tokenAmountToAdd = token.balanceOf(address(this));

        require(tokenAmountToAdd > 0, "Factory owns no tokens");
        require(ethToAdd > 0, "No ETH to add");

        uint256 ethToAddLiquidity = (ethToAdd * 96) / 100;

        uint256 ethToFeeReceiver = (ethToAdd * 39) / 1000;

        uint256 remainingSurplus = ethToAdd - ethToAddLiquidity - ethToFeeReceiver;

        token.approve(uniswapRouter, tokenAmountToAdd);

        uint256 minTokenAmount = tokenAmountToAdd * (10000 - slippageTolerance) / 10000;
        uint256 minEthAmount = ethToAddLiquidity * (10000 - slippageTolerance) / 10000;

        IUniswapV2Router02(uniswapRouter).addLiquidityETH{value: ethToAddLiquidity}(
            tokenAddress,
            tokenAmountToAdd,
            minTokenAmount,
            minEthAmount,
            address(0),
            block.timestamp + 300
        );

        payable(feeReceiver).transfer(ethToFeeReceiver);

        emit LiquidityAdded(tokenAddress, ethToAddLiquidity, tokenAmountToAdd, address(0));
        
        tokenEthSurplus[tokenAddress] = remainingSurplus;
        tokens[tokenAddress].isSupported = false;
    }

    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        require(tokens[tokenAddress].isSupported, "Token not supported");
        return tokens[tokenAddress];
    }

    function getAllTokenAddresses() external view returns (address[] memory) {
        return allTokenAddresses;
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

    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "Fee receiver cannot be the zero address");
        feeReceiver = _feeReceiver;
    }

    function setUniswapRouter(address _uniswapRouter) external onlyOwner {
        require(_uniswapRouter != address(0), "Router address cannot be zero");
        uniswapRouter = _uniswapRouter;
    }

    function setSlippageTolerance(uint256 _inputPercentage) public onlyOwner {
        require(_inputPercentage >= 1 && _inputPercentage <= 100, "Slippage tolerance must be between 1% and 100%");
        slippageTolerance = _inputPercentage * 100; // 1% = 100 basis points, 100% = 10,000 basis points
    }

    function setEthCap(uint256 _ethCap) public onlyOwner {
        require(_ethCap > 0, "EthCap must be greater than 0.");
        ethCap = _ethCap * 1e15; // 1 = 0.001 Ether
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "Not enough ETH in the contract");
        payable(owner).transfer(amount);
    }

    function withdrawAll() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function removeUnsupportedTokens() external onlyOwner {
        for (uint256 i = 0; i < allTokenAddresses.length; i++) {
            address tokenAddress = allTokenAddresses[i];
            if (!tokens[tokenAddress].isSupported) {
                delete tokens[tokenAddress];
                delete tokenEthSurplus[tokenAddress];

                allTokenAddresses[i] = allTokenAddresses[allTokenAddresses.length - 1];
                allTokenAddresses.pop();

                emit TokenRemoved(tokenAddress);
            }
        }
    }

    function addTokenManually(
        address tokenAddress, 
        uint256 virtualEth, 
        uint256 virtualTokens
    ) external onlyOwner {
        require(!tokens[tokenAddress].isSupported, "Token is already supported");

        tokens[tokenAddress] = TokenInfo({
            isSupported: true,
            tokenAddress: tokenAddress,
            virtualEth: virtualEth,
            virtualTokens: virtualTokens
        });

        emit TokenAddedManually(tokenAddress);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
