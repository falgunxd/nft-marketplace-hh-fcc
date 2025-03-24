const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace - NFT Minting", function () {
    let nftMarketplace, owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
        nftMarketplace = await NFTMarketplace.deploy();
        await nftMarketplace.deployed();

        // Register user1
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");
    });

    it("Should allow a registered user to mint an NFT", async function () {
        await nftMarketplace.connect(user1).mintNFT("ipfs://exampleURI", ethers.utils.parseEther("1"));
        assert.equal(await nftMarketplace.nextTokenId(), 1, "Next token ID should be 1");
    });

    it("Should not allow an unregistered user to mint an NFT", async function () {
        try {
            await nftMarketplace.connect(user2).mintNFT("ipfs://exampleURI", ethers.utils.parseEther("1"));
            assert.fail("Unregistered user was able to mint an NFT");
        } catch (error) {
            assert.include(error.message, "User not registered", "Expected revert message");
        }
    });

    it("Should assign correct creator and owner", async function () {
        await nftMarketplace.connect(user1).mintNFT("ipfs://exampleURI", ethers.utils.parseEther("1"));
        const nft = await nftMarketplace.getNFTDetails(0);
        assert.equal(nft.creator, user1.address, "Creator address mismatch");
        assert.equal(nft.owner, user1.address, "Owner address mismatch");
    });

    it("Should increase nextTokenId after minting", async function () {
        await nftMarketplace.connect(user1).mintNFT("ipfs://exampleURI", ethers.utils.parseEther("1"));
        assert.equal(await nftMarketplace.nextTokenId(), 1, "Next token ID should increment");
    });

    it("Should store NFT metadata and price correctly", async function () {
        await nftMarketplace.connect(user1).mintNFT("ipfs://exampleURI", ethers.utils.parseEther("1"));
        const nft = await nftMarketplace.getNFTDetails(0);
        assert.equal(nft.price.toString(), ethers.utils.parseEther("1").toString(), "Price mismatch");
    });

    it("Should add minted NFT to user’s creates[] and owns[] arrays", async function () {
        await nftMarketplace.connect(user1).mintNFT("ipfs://exampleURI", ethers.utils.parseEther("1"));
        const userDetails = await nftMarketplace.getUserDetails(user1.address);
        assert.equal(userDetails.creates.length, 1, "Creates array should have 1 NFT");
        assert.equal(userDetails.owns.length, 1, "Owns array should have 1 NFT");
    });

    it("Should emit NFTCreated event with correct parameters", async function () {
        const tx = await nftMarketplace.connect(user1).mintNFT("ipfs://exampleURI", ethers.utils.parseEther("1"));
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === "NFTCreated");
        assert.exists(event, "NFTCreated event not emitted");
        assert.equal(event.args.tokenId.toNumber(), 0, "Token ID mismatch in event");
        assert.equal(event.args.creator, user1.address, "Creator mismatch in event");
        assert.equal(event.args.tokenURI, "ipfs://exampleURI", "Token URI mismatch in event");
    });
});
