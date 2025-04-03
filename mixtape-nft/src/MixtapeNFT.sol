// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract MixtapeNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    event MixtapeMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("MixtapeNFT", "MTNFT") Ownable(msg.sender) {
        tokenCounter = 1; // Start from 1 to avoid token ID 0 issues
    }

    function mintMixtape(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        tokenCounter += 1;

        emit MixtapeMinted(recipient, newTokenId, tokenURI);
        return newTokenId;
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }
    function getOwner() public view returns (address) {
    return owner();
}

}