// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTSoldIty is ERC721A, Ownable {
    // Structs

    struct Auction {
        string s_tokenIdToTokenURI;
    }
    // Mappings
    mapping(uint256 => Auction) private auctions;

    // Events
    event NFT_Minted(address indexed minter, uint256 indexed tokenId);

    constructor() ERC721A("NFTSoldIty", "NFTSI") {}

    // Contract functions
    function mintNFT(string memory externalTokenURI, uint256 auctionDuration)
        external
        onlyOwner
    {}

    function tokenURI(uint256 tokenId)
        override
        publicview
        returns (string memory)
    {}

    function approve() public {}

    function withdrawMoney() private onlyOwner {}

    function renewAuction() external {}

    modifier biddingStateCheck() {}

    function getHighestBidder() external {}

    function getHighestBid() external {}

    function getTime() external {}

    function getPendingReturns() external {}
}
