// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IOffchainDataFetcher {
    function getLastResponse() external view returns (uint256[] memory);
}
