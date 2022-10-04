// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

import "./interfaces/IDutchAuction.sol";

// @autor donBarbos
// @notice Dutch auction is a price discovery process in which the auctioneer starts with the highest asking price and lowers it until it reaches a price level where the bids received will cover the entire offer quantity.
contract DutchAuction is IDutchAuction {
    uint constant DURATION = 2 days;
    Auction[] public auctions;  // see `./interfaces/IDutchAuction.sol`

    receive() external payable {
        require(false, "incorrect call!");
    }

    fallback() external payable{
        require(false, "incorrect call!");
    }

    function createAuction(
        uint _startingPrice,
        uint _discountRate,
        string memory _item,
        uint _duration
    ) external {
        uint duration = _duration == 0 ? DURATION : _duration;
        require(_startingPrice >= _discountRate * duration, "incorrect starting price!");

        Auction memory newAuction = Auction({
            seller: payable(msg.sender),
            startingPrice: _startingPrice,
            finalPrice: _startingPrice,
            discountRate: _discountRate,
            startAt: block.timestamp,
            endsAt: block.timestamp + duration,
            item: _item,
            stopped: false
        });
        auctions.push(newAuction);
        emit AuctionCreated(auctions.length - 1, _item, _startingPrice, duration);
    }

    function buy(uint index) external payable {
        Auction storage cAuction = auctions[index];
        require(!cAuction.stopped, "auction stopped!");
        require(block.timestamp < cAuction.endsAt, "auction ended!");
        uint cPrice = getPrice(index);
        require(msg.value >= cPrice, "not enough funds!");
        cAuction.stopped = true;
        cAuction.finalPrice = cPrice;
        uint refund = msg.value - cPrice;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
        cAuction.seller.transfer(cPrice);
        emit AuctionEnded(index, cPrice, msg.sender);
    }

    function getPrice(uint index) public view returns(uint) {
        Auction memory cAuction = auctions[index];
        require(!cAuction.stopped, "auction stopped!");
        uint elapsed = block.timestamp - cAuction.startAt;
        uint discount = cAuction.discountRate * elapsed;
        return cAuction.startingPrice - discount;
    }
}
