import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("DutchAuction", () => {
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2] = await ethers.getSigners()

    const DutchAuction = await ethers.getContractFactory("DutchAuction", owner)
    const auction = await DutchAuction.deploy()
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
      const startingPrice = 10_000_000
      const discountRate = 3
      const item = "Car"
      const duration = 86400 * 30 // 1 days = 86400

      it("Should invoke the createAuction function", async () => {
        const { auction, addr1 } = await loadFixture(deploy)
        const tx = await auction
          .connect(addr1)
          .createAuction(startingPrice, discountRate, item, duration)

        await expect(tx).not.to.be.reverted
      })

      it("Should invoke the buy function", async () => {
        const { auction, addr1, addr2 } = await loadFixture(deploy)
        await auction.connect(addr1).createAuction(startingPrice, discountRate, item, duration)
        const tx = await auction.connect(addr2).buy(0, { value: 10_000_000 })

        await expect(tx).not.to.be.reverted
      })

      it("Should invoke the getPrice function", async () => {
        const { auction, addr1, addr2 } = await loadFixture(deploy)
        await auction.connect(addr1).createAuction(startingPrice, discountRate, item, duration)
        const tx = await auction.connect(addr2).getPrice(0)

        await expect(tx).not.to.be.reverted
      })
    })

    describe("Events", () => {
      const startingPrice = 10_000_000
      const discountRate = 3
      const item = "Car"
      const duration = 86400 * 30

      it("Should emit an event on createAuction", async () => {
        const { auction, addr1 } = await loadFixture(deploy)
        const tx = auction.connect(addr1).createAuction(startingPrice, discountRate, item, duration)

        await expect(tx)
          .to.emit(auction, "AuctionCreated")
          .withArgs(0, item, startingPrice, duration)
      })

      it("Should emit an event on buy", async () => {
        const { auction, addr1, addr2 } = await loadFixture(deploy)
        await auction.connect(addr1).createAuction(startingPrice, discountRate, item, duration)
        const tx = await auction.connect(addr2).buy(0, { value: 10_000_000 })

        await expect(tx).to.emit(auction, "AuctionEnded").withArgs(0, anyValue, addr2.address)
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
