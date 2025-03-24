const { expect, assert } = require("chai");

describe("NFTMarketplace - NFT Listing", function () {
    let NFTMarketplace, nftMarketplace, owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
        nftMarketplace = await NFTMarketplace.deploy();
        await nftMarketplace.deployed();

        // Register user1
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");

        // Mint NFT by user1
        await nftMarketplace.connect(user1).mintNFT("ipfs://somehash", ethers.utils.parseEther("1"));
    });

    it("Should allow the owner to list their NFT for sale", async function () {
        await nftMarketplace.connect(user1).listNFT(0, ethers.utils.parseEther("2"));
    });

    it("Should not allow non-owners to list an NFT", async function () {
        try {
            await nftMarketplace.connect(user2).listNFT(0, ethers.utils.parseEther("2"));
            assert.fail("Transaction should have reverted!");
        } catch (error) {
            assert(error.message.includes("Not the owner"), `Unexpected error message: ${error.message}`);
        }
    });

    it("Should not allow setting price to 0", async function () {
        try {
            await nftMarketplace.connect(user1).listNFT(0, 0);
            assert.fail("Transaction should have reverted!");
        } catch (error) {
            assert(error.message.includes("Price must be greater than zero"), `Unexpected error message: ${error.message}`);
        }
    });

    it("Should mark NFT as forSale and store the price correctly", async function () {
        await nftMarketplace.connect(user1).listNFT(0, ethers.utils.parseEther("3"));
        const nft = await nftMarketplace.getNFTDetails(0);
        assert.equal(nft.forSale, true, "NFT should be marked as for sale");
        assert(nft.price.eq(ethers.utils.parseEther("3")), "Price mismatch");
    });

    it("Should emit NFTListed event with correct parameters", async function () {
        const price = ethers.utils.parseEther("3");
        const tx = await nftMarketplace.connect(user1).listNFT(0, price);
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === "NFTListed");
    
        // console.log("NFTListed Event Args:", event?.args);  // Debugging line
    
        assert(event, "NFTListed event not emitted!");
        assert.equal(event.args[0], user1.address, "Owner address mismatch");
        assert.equal(event.args[1].toString(), "0", "Token ID mismatch");
        assert(event.args[2].eq(price), "Price mismatch");
    });
    
    
});
