// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

// @title Interface for DutchAuction
// @author donBarbos
interface IDutchAuction {
    // @notice this struct is immutable
    // @param seller Seller address
    // @param startingPrice Price at which bidding starts (highest)
    // @param finalPrice Last price to be offered (lowest)
    // @param startAt
    // @param endsAt
    // @param discountRate
    // @param item Unique product identifier
    // @param stopped Auction status (Still going / Ended) at start: `false`
    struct Auction {
        address payable seller;
        uint startingPrice;
        uint finalPrice;
        uint startAt;
        uint endsAt;
        uint discountRate;
        string item;
        bool stopped;
    }

    event AuctionCreated(uint index, string itemName, uint startingPrice, uint duration);
    event AuctionEnded(uint index, uint finalPrice, address winner);

    receive() external payable;

    fallback() external payable;

    function createAuction(
        uint _startingPrice,
        uint _discountRate,
        string memory _item,
        uint _duration
    ) external;

    function buy(uint index) external payable;

    function getPrice(uint index) external view returns (uint);
}
