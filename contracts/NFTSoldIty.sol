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

    /**
     * @dev Functions list private, public and external
     */

    function mintNFT(string memory externalTokenURI, uint256 auctionDuration)
        external
        onlyOwner
    {
        uint256 newTokenId = totalSupply();
        Auction storage auction = auctions[newTokenId];

        auction.s_tokenIdToTokenURI = externalTokenURI;
        auction.s_tokenIdToAuctionDuration = auctionDuration;

        emit NFT_Minted(msg.sender, newTokenId);
    }

    function tokenURI() public {}

    function approve() public {}

    function withdrawMoney() private onlyOwner {}

    function renewAuction() external {}

    modifier biddingStateCheck() {}

    function getHighestBidder() external {}

    function getHighestBid() external {}

    function getTime() external {}

    function getPendingReturns() external {}
}
