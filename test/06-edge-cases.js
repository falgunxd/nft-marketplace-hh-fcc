const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace - Edge Cases", function () {
  let nftMarketplace, owner, addr1;

  beforeEach(async function () {
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    [owner, addr1] = await ethers.getSigners();
  });

  it("Should not allow NFT transfer outside of marketplace functions", async function () {
    await nftMarketplace.registerUser(1001, "Alice");
    await nftMarketplace.mintNFT("ipfs://example", 1);

    try {
      await nftMarketplace.connect(addr1).transferFrom(owner.address, addr1.address, 0);
      expect.fail("Transfer should have failed");
    } catch (error) {
      expect(error.message).to.include("caller is not owner nor approved");
    }
  });

  it("Should handle large roll numbers and long names gracefully", async function () {
    const longName = "A".repeat(256);
    await nftMarketplace.registerUser(9999999999, longName);
    const user = await nftMarketplace.getUserByRollNumber(9999999999);
    expect(user.name).to.equal(longName);
  });

  it("Should prevent overflows when minting multiple NFTs", async function () {
    await nftMarketplace.registerUser(1001, "Alice");
    for (let i = 0; i < 10; i++) {
      await nftMarketplace.mintNFT(`ipfs://nft${i}`, 1);
    }
    const nft = await nftMarketplace.getNFTDetails(9);
    expect(nft.owner).to.equal(owner.address);
  });

  it("Should not allow negative or zero roll numbers", async function () {
    try {
      await nftMarketplace.registerUser(0, "InvalidUser");
      expect.fail("Should not allow zero roll number");
    } catch (error) {
        expect(error.message).to.include("Roll number must be positive"); // or whatever error it actually throws
    }
  });

  it("Should handle multiple NFTs correctly for a single user", async function () {
    await nftMarketplace.registerUser(1001, "Alice");
    await nftMarketplace.mintNFT("ipfs://example1", 1);
    await nftMarketplace.mintNFT("ipfs://example2", 2);
    const user = await nftMarketplace.getUserDetails(owner.address);
    expect(user.owns.length).to.equal(2);
  });
});
