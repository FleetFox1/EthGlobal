// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockPYUSD
 * @dev Mock PYUSD token for testing (6 decimals like real PYUSD)
 */
contract MockPYUSD is ERC20 {
    constructor() ERC20("PayPal USD", "PYUSD") {
        // Mint 1 million PYUSD for testing
        _mint(msg.sender, 1_000_000 * 10**6); // 6 decimals
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    // Faucet for testing - anyone can mint PYUSD
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
