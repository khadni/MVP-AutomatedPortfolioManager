// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMimicToken is IERC20 {
    function buyMimicTokenWithUSDCAmount(uint256 usdcAmount) external;
    function buyMimicTokenWithTokenAmount(uint256 tokenCount) external;
    function sellMimicTokenForUSDC(uint256 mimicTokenAmount) external returns (uint256);
}
