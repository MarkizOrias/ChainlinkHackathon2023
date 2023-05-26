// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTSoldIty is ERC721A, Ownable {
    // Structs

    struct Auction {
        uint256 s_tokenIdToBid;
        string s_tokenIdToTokenURI;
        uint256 s_tokenIdToAuctionStart;
        uint256 s_tokenIdToAuctionDuration;
    }
    // Mappings
    mapping(uint256 => Auction) private auctions;

    // Events
    event NFT_Minted(address indexed minter, uint256 indexed tokenId);
    event NFT_SetTokenURI(string uri, uint256 indexed tokenId);
    event NFT_AuctionTimeUpdated(uint256 indexed time, uint256 indexed tokenId);

    constructor() ERC721A("NFTSoldIty", "NFTSI") {}

    // Contract functions
    function mintNFT(string memory externalTokenURI, uint256 auctionDuration)
        external
        onlyOwner
    {
        if (auctionDuration < 10) revert Abstract__AuctionDurationTooShort();

        uint256 newTokenId = totalSupply();
        Auction storage auction = auctions[newTokenId];

        _mint(msg.sender, 1);

        auction.s_tokenIdToBid = startPrice;
        auction.s_tokenIdToTokenURI = externalTokenURI;
        auction.s_tokenIdToAuctionStart = block.timestamp;
        auction.s_tokenIdToAuctionDuration = auctionDuration;

        emit NFT_Minted(msg.sender, newTokenId);
        emit NFT_SetTokenURI(auction.s_tokenIdToTokenURI, newTokenId);
        emit NFT_AuctionTimeUpdated(auctionDuration, newTokenId);
    }

    function tokenURI(uint256 tokenURI) public returns (string memory) {
        Auction storage auctions = auctions[tokenId];
        return auction.s_tokenIdToTokenURI;
    }

    function approve() public {}

    function withdrawMoney() private onlyOwner {}

    function renewAuction() external {}

    modifier biddingStateCheck() {}

    function getHighestBidder() external {}

    function getHighestBid() external {}

    function getTime() external {}

    function getPendingReturns() external {}
}
