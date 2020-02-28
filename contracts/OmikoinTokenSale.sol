pragma solidity ^0.5.11;
import "./OmikoinToken.sol";

contract OmikoinTokenSale {
    address payable admin;
    OmikoinToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(OmikoinToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    // multiply
    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "multiplication");
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(
            msg.value == multiply(_numberOfTokens, tokenPrice),
            "msg.value not equal to price"
        );
        require(
            tokenContract.balanceOf(address(this)) >= _numberOfTokens,
            "youre short m8"
        );
        require(tokenContract.transfer(msg.sender, _numberOfTokens), "message");

        tokensSold = tokensSold + _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);

    }

    function endSale() public {
        // require admin
        // transfer remaining back to admin
        //destroy contract
        require(msg.sender == admin);
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );

        admin.transfer(address(this).balance);

    }

}
