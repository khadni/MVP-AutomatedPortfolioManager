// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    NetworkConfig public activeNetworkConfig;

    struct NetworkConfig {
        address functionsRouter;
        bytes32 donId;
        uint64 subId;
    }

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getEthereumSepoliaConfig();
        }

        // } else if (block.chainid == 421614) {
        //     activeNetworkConfig = getArbitrumSepoliaConfig();
        // } else {
        //     activeNetworkConfig = getOrCreateAnvilEthConfig();
        // }
    }

    function getEthereumSepoliaConfig() public view returns (NetworkConfig memory) {
        NetworkConfig memory ethereumSepoliaConfig = NetworkConfig({
            functionsRouter: 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0,
            donId: 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000,
            subId: 0 // to do
        });
        return ethereumSepoliaConfig;
    }

    // function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
    //     // TO DO

    //     return anvilConfig;
    // }
}
