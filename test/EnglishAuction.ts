import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("EnglishAuction", () => {
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2] = await ethers.getSigners()

    const EnglishAuction = await ethers.getContractFactory("EnglishAuction", owner)
    const auction = await EnglishAuction.deploy()
    await auction.deployed()

    console.log("contract address: ", auction.address)
    return { auction, owner, addr1, addr2 }
  }

  describe("Deployment", () => {
    it("Should be deployed", async () => {
      const { auction } = await loadFixture(deploy)

      expect(auction.address).to.be.properAddress
    })
  })

  describe("Calls", () => {
    describe("Functions", () => {
      const expectedPrice = 10_000_000
      const item = "Car"
      const initialShare = 25_000
      const _step = 0

      it("Should invoke the createAuction function", async () => {
        const { auction, addr1 } = await loadFixture(deploy)
        const tx = await auction
          .connect(addr1)
          .createAuction(expectedPrice, item, _step, initialShare)

        await expect(tx).not.to.be.reverted
      })

      it("Should invoke the makeBid function", async () => {
        const { auction, addr1, addr2 } = await loadFixture(deploy)
        await auction.connect(addr1).createAuction(expectedPrice, item, _step, initialShare)
        const tx = await auction.connect(addr2).makeBid(0, 4_000_000, { value: 4_000_000 })

        await expect(tx).not.to.be.reverted
      })

      it("Should invoke the getPrice function", async () => {
        const { auction, addr1, addr2 } = await loadFixture(deploy)
        await auction.connect(addr1).createAuction(expectedPrice, item, _step, initialShare)
        const tx = await auction.connect(addr2).getPrice(0)

        await expect(tx).not.to.be.reverted
      })
    })

    describe("Events", () => {
      const expectedPrice = 10_000_000
      const item = "Car"
      const initialShare = 25_000
      const _step = 1_000

      it("Should emit an event on createAuction", async () => {
        const { auction, addr1 } = await loadFixture(deploy)
        const tx = await auction
          .connect(addr1)
          .createAuction(expectedPrice, item, _step, initialShare)
        const startingPrice = expectedPrice * (initialShare / 100_000)
        const step = startingPrice * (_step / 100000)

        await expect(tx).to.emit(auction, "AuctionCreated").withArgs(0, item, startingPrice, step)
      })

      it("Should emit an event on makeBid", async () => {
        const { auction, addr1, addr2 } = await loadFixture(deploy)
        await auction.connect(addr1).createAuction(expectedPrice, item, _step, initialShare)
        const tx = await auction.connect(addr2).makeBid(0, 4_000_000, { value: 4_000_000 })

        await expect(tx).to.emit(auction, "AuctionUpdated").withArgs(0, 4_000_000, addr2.address)
      })
    })

    describe("Other functions", () => {
      it("Should invoke the receive function", async () => {
        const { auction, addr1 } = await loadFixture(deploy)
        const tx = addr1.sendTransaction({
          to: auction.address,
          data: "0x",
          gasLimit: 210000,
        })

        await expect(tx).to.be.revertedWith("incorrect call!")
      })

      it("Should invoke the fallback function", async () => {
        const { auction, addr1 } = await loadFixture(deploy)
        const tx = addr1.sendTransaction({
          to: auction.address,
          data: "0x1234",
          gasLimit: 210000,
        })

        await expect(tx).to.be.revertedWith("incorrect call!")
      })
    })
  })
})
