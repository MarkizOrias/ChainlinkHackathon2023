// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NFTSoldIty__NotEnoughETH();
error NFTSoldIty__TransferFailed();
error NFTSoldIty__AddressIsNotHighestBidder();

contract NFTSoldIty is ERC721A, Ownable, ReentrancyGuard {
    // Structs

    struct Auction {
        uint256 s_tokenIdToBid;
        address s_tokenIdToBidder;
        string s_tokenIdToTokenURI;
        uint256 s_tokenIdToAuctionStart;
        uint256 s_tokenIdToAuctionDuration;
    }

    // NFT Variables
    uint256 constant minBid = 0.01 ether;
    uint256 constant startPrice = 0.1 ether;

    // NFT Mappings
    mapping(uint256 => Auction) private auctions;
    mapping(address => uint256) private pendingReturns;

    // Events
    event NFT_Minted(address indexed minter, uint256 indexed tokenId);
    event NFT_SetTokenURI(string uri, uint256 indexed tokenId);
    event NFT_AuctionTimeUpdated(uint256 indexed time, uint256 indexed tokenId);
    event NFT_PendingBidsWithdrawal(
        uint256 indexed bid,
        address indexed bidder,
        bool indexed transfer
    );

    constructor() ERC721A("NFTSoldIty", "NFTSI") {}

    // Contract functions
    function mintNFT(string memory externalTokenURI, uint256 auctionDuration)
        external
        onlyOwner
    {
        if (auctionDuration < 10) revert NFTSoldIty__AuctionDurationTooShort();

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

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        Auction storage auction = auctions[tokenId];
        return auction.s_tokenIdToTokenURI;
    }

    function approve(address to, uint256 tokenId)
        public
        payable
        override
        biddingStateCheck(tokenId)
    {
        Auction storage auction = auctions[tokenId];
        if (to != auction.s_tokenIdToBidder)
            revert Abstract__AddressIsNotHighestBidder();

        super.approve(to, tokenId);
    }

    function withdrawPending() external payable nonReentrant {
        uint256 amount = pendingReturns[msg.sender];

        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
        } else {
            revert Abstract__NotEnoughETH();
        }

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            pendingReturns[msg.sender] = amount;
            revert Abstract__TransferFailed();
        }

        emit NFT_PendingBidsWithdrawal(amount, msg.sender, success);
    }

    function withdrawMoney() private onlyOwner {}

    function renewAuction() external {}

    modifier biddingStateCheck() {}

    function getHighestBidder() external {}

    function getHighestBid() external {}

    function getTime() external {}

    function getrejectedFunds() external {}
}
