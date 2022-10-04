// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

// @title Interface for EnglishAuction
// @author donBarbos
interface IEnglishAuction {
    // @notice this struct is immutable
    // @param seller Seller address
    // @param reservePrice Minimum price that a seller would be willing to accept from a buyer
    // (minimum bid)
    // @param currentPrice The price of potential buyers now offers
    // @param step This is the amount by which the price of the lot can change
    // @param item Unique product identifier
    // @param stopped Auction status (Still going / Ended) at start: `false`
    struct Auction {
        address payable seller;
        uint reservePrice;
        uint currentPrice;
        address payable currentBuyer;
        uint step;
        string item;
        bool stopped;
    }

    event AuctionCreated(uint index, string itemName, uint startingPrice, uint step);
    event AuctionUpdated(uint index, uint newPrice, address newBuyer);
    event AuctionEnded(uint index, uint finalPrice, address winner);

    receive() external payable;

    fallback() external payable;

    function createAuction(uint _startingPrice, string memory _item, uint _step) external;

    function makeBid(uint index) external payable;

    function getPrice(uint index) external view returns (uint);

    function addToQueue(uint index) external returns (bytes32);
}
