const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace - Retrieval and View", function () {
  let nftMarketplace, owner, addr1, addr2;

  beforeEach(async function () {
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    [owner, addr1, addr2] = await ethers.getSigners();

    await nftMarketplace.registerUser(1001, "Alice");
    await nftMarketplace.connect(addr1).registerUser(1002, "Bob");
    await nftMarketplace.connect(addr2).registerUser(1003, "Charlie");
  });

  it("Should retrieve correct user details", async function () {
    const user = await nftMarketplace.getUserDetails(owner.address);
    expect(user.rollNumber.toString()).to.equal("1001");
  });

  it("Should retrieve correct NFT details", async function () {
    await nftMarketplace.mintNFT("ipfs://example", 1);
    const nft = await nftMarketplace.getNFTDetails(0);
    expect(nft.price.toString()).to.equal("1");
  });

  it("Should list all NFTs for sale", async function () {
    await nftMarketplace.mintNFT("ipfs://example1", 1);
    await nftMarketplace.mintNFT("ipfs://example2", 2);
    await nftMarketplace.listNFT(0, 1);
    await nftMarketplace.listNFT(1, 2);
    const nftsForSale = await nftMarketplace.listAllNFTsForSale();
    expect(nftsForSale.length).to.equal(2);
  });

  it("Should return an empty list if no NFTs are for sale", async function () {
    const nftsForSale = await nftMarketplace.listAllNFTsForSale();
    expect(nftsForSale.length).to.equal(0);
  });

  it("Should return correct NFTs after multiple users interact", async function () {
    await nftMarketplace.mintNFT("ipfs://example1", 1);
    await nftMarketplace.connect(addr1).mintNFT("ipfs://example2", 2);
    await nftMarketplace.connect(addr2).mintNFT("ipfs://example3", 3);
    await nftMarketplace.listNFT(0, 1);
    await nftMarketplace.connect(addr1).listNFT(1, 2);
    await nftMarketplace.connect(addr2).listNFT(2, 3);
    const nftsForSale = await nftMarketplace.listAllNFTsForSale();
    expect(nftsForSale.length).to.equal(3);
  });
});
