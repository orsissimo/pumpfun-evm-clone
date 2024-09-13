// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PumpToken.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PumpFactory is ReentrancyGuard {
    address public owner;
    address public feeReceiver;
    address public uniswapRouter;
    uint256 public slippageTolerance = 500;
    uint256 public ethCap = 1 ether;
    uint256 constant FEE_PERCENTAGE = 1;
    uint256 constant INITIAL_ETH_LIQUIDITY = 1 ether;
    uint256 constant INITIAL_TOKEN_SUPPLY = 1000000000 * 10**18;
    string constant PUMP_STYLE_WEBSITE = "https://pump.style";
    string constant PUMP_STYLE_X = "https://x.com/pumpdotstyle";
    string constant PUMP_STYLE_TELEGRAM = "https://t.me/pumpdotstyle";

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
        string websiteLink,
        string pumpstyleWebsiteLink,
        string pumpstyleXLink,
        string pumpstyleTelegramLink
    );

    event TokenPurchased(
        address indexed buyer,
        address indexed tokenAddress,
        uint256 ethSpent,
        uint256 tokensBought,
        uint256 pricePerToken,
        string pumpstyleWebsiteLink,
        string pumpstyleXLink,
        string pumpstyleTelegramLink
    );

    event TokenSold(
        address indexed seller,
        address indexed tokenAddress,
        uint256 ethReceived,
        uint256 tokensSold,
        uint256 pricePerToken,
        string pumpstyleWebsiteLink,
        string pumpstyleXLink,
        string pumpstyleTelegramLink
    );

    event LiquidityAdded(
        address indexed tokenAddress,
        uint256 ethAdded,
        uint256 tokensAdded,
        uint256 tokensToBurn,
        address indexed lpTokenAddress,
        string pumpstyleWebsiteLink,
        string pumpstyleXLink,
        string pumpstyleTelegramLink
    );

    event TokenRemoved(address indexed tokenAddress);
    event TokenAddedManually(address indexed tokenAddress);

    constructor(address _uniswapRouter) {
        owner = msg.sender;
        feeReceiver = msg.sender;
        uniswapRouter = _uniswapRouter;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
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
        PumpToken newToken = new PumpToken(_name, _symbol, INITIAL_TOKEN_SUPPLY);

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
            _websiteLink,
            PUMP_STYLE_WEBSITE,
            PUMP_STYLE_X,
            PUMP_STYLE_TELEGRAM
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
        require(msg.value > 0);

        PumpToken newToken = new PumpToken(_name, _symbol, INITIAL_TOKEN_SUPPLY);

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

        require(INITIAL_TOKEN_SUPPLY >= tokensToTransfer);

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
            _websiteLink,
            PUMP_STYLE_WEBSITE,
            PUMP_STYLE_X,
            PUMP_STYLE_TELEGRAM
        );

        emit TokenPurchased(
            msg.sender, 
            address(newToken), 
            msg.value, 
            tokensToTransfer, 
            getCurrentPrice(address(newToken)),
            PUMP_STYLE_WEBSITE,
            PUMP_STYLE_X,
            PUMP_STYLE_TELEGRAM
        );
    }

    function buyToken(address tokenAddress, uint256 maxEth) public payable nonReentrant {
        require(tokens[tokenAddress].isSupported);
        require(msg.value > 0);
        require(msg.value <= maxEth);

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        PumpToken token = PumpToken(tokenAddress);

        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = msg.value - fee;

        payable(feeReceiver).transfer(fee);

        uint256 tokensToMint = getTokenAmountToBuy(tokenAddress, ethAfterFee);

        require(token.balanceOf(address(this)) >= tokensToMint);

        token.transfer(msg.sender, tokensToMint);

        tokenInfo.virtualEth += ethAfterFee;
        tokenInfo.virtualTokens -= tokensToMint;

        tokenEthSurplus[tokenAddress] += ethAfterFee;

        if (tokenEthSurplus[tokenAddress] >= ethCap) {
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];
            uint256 ethToAdd = (ethSurplus * 999) / 1000;
            addLiquidityAndBurn(tokenAddress, ethToAdd);
        }

        emit TokenPurchased(
            msg.sender, 
            tokenAddress, 
            msg.value, 
            tokensToMint, 
            getCurrentPrice(tokenAddress),
            PUMP_STYLE_WEBSITE,
            PUMP_STYLE_X,
            PUMP_STYLE_TELEGRAM
        );
    }

    function sellToken(address tokenAddress, uint256 _tokenAmount) public nonReentrant {
        require(tokens[tokenAddress].isSupported);
        require(_tokenAmount > 0);

        TokenInfo storage tokenInfo = tokens[tokenAddress];
        PumpToken token = PumpToken(tokenAddress);

        require(token.balanceOf(msg.sender) >= _tokenAmount);

        uint256 ethToReturn = getEthAmountToSell(tokenAddress, _tokenAmount);

        uint256 fee = (ethToReturn * FEE_PERCENTAGE) / 100;
        uint256 ethAfterFee = ethToReturn - fee;

        require(tokenInfo.virtualEth >= ethAfterFee);
        require(tokenEthSurplus[tokenAddress] >= ethAfterFee);

        require(address(this).balance >= ethAfterFee);

        require(token.transferFrom(msg.sender, address(this), _tokenAmount));

        payable(feeReceiver).transfer(fee);

        payable(msg.sender).transfer(ethAfterFee);

        tokenInfo.virtualEth -= ethAfterFee;
        tokenInfo.virtualTokens += _tokenAmount;

        tokenEthSurplus[tokenAddress] -= ethAfterFee;

        if (tokenEthSurplus[tokenAddress] >= ethCap) {
            uint256 ethSurplus = tokenEthSurplus[tokenAddress];
            uint256 ethToAdd = (ethSurplus * 999) / 1000;
            addLiquidityAndBurn(tokenAddress, ethToAdd);
        }

        emit TokenSold(
            msg.sender, 
            tokenAddress, 
            ethAfterFee, 
            _tokenAmount, 
            getCurrentPrice(tokenAddress),
            PUMP_STYLE_WEBSITE,
            PUMP_STYLE_X,
            PUMP_STYLE_TELEGRAM
        );
    }
    
    
    function addLiquidityAndBurn(address tokenAddress, uint256 ethToAdd) internal {
        PumpToken token = PumpToken(tokenAddress);
        
        uint256 tokenFactoryBalance = token.balanceOf(address(this));
        require(tokenFactoryBalance > 0);
        require(ethToAdd > 0);

        uint256 tokensToBurn = (tokenFactoryBalance * INITIAL_ETH_LIQUIDITY) / (ethToAdd + INITIAL_ETH_LIQUIDITY);
        if (tokensToBurn > 0) {
            token.transfer(address(0), tokensToBurn);
            tokenFactoryBalance -= tokensToBurn;
        }

        uint256 ethToAddLiquidity = (ethToAdd * 96) / 100;
        uint256 ethToFeeReceiver = (ethToAdd * 39) / 1000;
        // uint256 remainingSurplus = ethToAdd - ethToAddLiquidity - ethToFeeReceiver;

        token.approve(uniswapRouter, tokenFactoryBalance);

        uint256 minTokenAmount = tokenFactoryBalance * (10000 - slippageTolerance) / 10000;
        uint256 minEthAmount = ethToAddLiquidity * (10000 - slippageTolerance) / 10000;

        IUniswapV2Router02(uniswapRouter).addLiquidityETH{value: ethToAddLiquidity}(
            tokenAddress,
            tokenFactoryBalance,
            minTokenAmount,
            minEthAmount,
            address(0),
            block.timestamp + 300
        );

        payable(feeReceiver).transfer(ethToFeeReceiver);

        emit LiquidityAdded(tokenAddress, ethToAddLiquidity, tokenFactoryBalance, tokensToBurn, address(0), PUMP_STYLE_WEBSITE, PUMP_STYLE_X, PUMP_STYLE_TELEGRAM);
        
        tokenEthSurplus[tokenAddress] = ethCap;
        tokens[tokenAddress].isSupported = false;
    }

    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        require(tokens[tokenAddress].isSupported);
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
        require(_feeReceiver != address(0));
        feeReceiver = _feeReceiver;
    }

    function setUniswapRouter(address _uniswapRouter) external onlyOwner {
        require(_uniswapRouter != address(0));
        uniswapRouter = _uniswapRouter;
    }

    function setSlippageTolerance(uint256 _inputPercentage) public onlyOwner {
        require(_inputPercentage >= 1 && _inputPercentage <= 100);
        slippageTolerance = _inputPercentage * 100; // 1% = 100 basis points, 100% = 10,000 basis points
    }

    function setEthCap(uint256 _ethCapInFinney) public onlyOwner {
        require(_ethCapInFinney > 0);
        ethCap = _ethCapInFinney * 1e15; // 1 = 0.001 Ether
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount);
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
        require(!tokens[tokenAddress].isSupported);

        tokens[tokenAddress] = TokenInfo({
            isSupported: true,
            tokenAddress: tokenAddress,
            virtualEth: virtualEth,
            virtualTokens: virtualTokens
        });

        emit TokenAddedManually(tokenAddress);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }
}
