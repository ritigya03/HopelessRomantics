// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Script.sol";
import "../src/MixtapeNFT.sol";

contract Deploy is Script {
    function run() external {
        // Load the private key from the environment variable
        uint256 privateKey = uint256(vm.envBytes32("PRIVATE_KEY"));

        vm.startBroadcast(privateKey);

        // Deploy the MixtapeNFT contract
        MixtapeNFT mixtapeNFT = new MixtapeNFT();

        console.log("MixtapeNFT deployed at:", address(mixtapeNFT));
        
        vm.stopBroadcast();
    }
}
