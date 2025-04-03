// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import "../src/MixtapeNFT.sol";

contract MixtapeNFTTest is Test {
    MixtapeNFT mixtape;
    address owner = address(0x123);
    address recipient = address(0x456);

    function setUp() public {
        vm.startPrank(owner);
        mixtape = new MixtapeNFT();
        vm.stopPrank();  // Ensure prank ends after the setup
    }

    function testMintMixtape() public {
        vm.startPrank(owner);

        uint256 tokenId = mixtape.mintMixtape(recipient, "ipfs://sample-uri");
        assertEq(tokenId, 0); // Adjust if the minting logic assigns a different ID for the first token

        vm.stopPrank();  // Ensure prank ends after the test
    }
}
