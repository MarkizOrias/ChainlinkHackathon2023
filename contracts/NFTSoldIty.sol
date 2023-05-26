// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTSoldIty is ERC721A {
    constructor() ERC721A("NFTSoldIty", "NFTSI") {}

    /**
     * @dev Functions list private, public and external
     */

    function mintNFT() external onlyOwner {}

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
