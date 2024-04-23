// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {OffchainDataFetcher} from "../src/OffchainDataFetcher.sol";
import {console} from "forge-std/console.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployOffChainDataFetcher is Script {
    using stdJson for string;

    function run() external returns (OffchainDataFetcher) {
        HelperConfig helperConfig = new HelperConfig();
        (address functionsRouter,,) = helperConfig.activeNetworkConfig();

        vm.startBroadcast();
        OffchainDataFetcher offchainDataFetcher = new OffchainDataFetcher(functionsRouter);
        vm.stopBroadcast();

        string memory jsonObj = "internal_key";

        string memory finalJson = vm.serializeAddress(jsonObj, "offchainDataFetcher", address(offchainDataFetcher));

        console.log(finalJson);

        vm.writeJson(finalJson, "./output/deployedOffchainDataFetcher.json");

        return (offchainDataFetcher);
    }
}
