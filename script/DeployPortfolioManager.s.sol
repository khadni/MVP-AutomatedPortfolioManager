// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {AutomatedPortfolioManager} from "../src/AutomatedPortfolioManager.sol";
import {console} from "forge-std/console.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployPortfolioManager is Script {
    using stdJson for string;

    function run() external returns (AutomatedPortfolioManager) {
        // HelperConfig helperConfig = new HelperConfig();

        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/output/deployedOffchainDataFetcher.json");
        string memory json = vm.readFile(path);

        address offchainDataFetcher = json.readAddress(".offchainDataFetcher");

        vm.startBroadcast();
        AutomatedPortfolioManager automatedPortfolioManager = new AutomatedPortfolioManager(offchainDataFetcher);
        vm.stopBroadcast();

        string memory jsonObj = "internal_key";

        string memory finalJson = vm.serializeAddress(jsonObj, "PortfolioManager", address(automatedPortfolioManager));

        console.log(finalJson);

        vm.writeJson(finalJson, "./output/deployedPortfolioManager.json");

        return (automatedPortfolioManager);
    }
}
