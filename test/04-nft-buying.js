const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace - NFT Buying", function () {
    let marketplace, owner, seller, buyer, anotherUser, nftId, price;

    beforeEach(async function () {
        [owner, seller, buyer, anotherUser] = await ethers.getSigners();
        const Marketplace = await ethers.getContractFactory("NFTMarketplace");
        marketplace = await Marketplace.deploy();
        await marketplace.deployed();

        // Register the seller
        await marketplace.connect(seller).registerUser(12345, "Alice");
        // Mint NFT
        await marketplace.connect(seller).mintNFT("ipfs://metadata", ethers.utils.parseEther("1"));
        nftId = 0; // First minted NFT has ID 0
        price = ethers.utils.parseEther("1");

        // List NFT for sale
        await marketplace.connect(seller).listNFT(nftId, price);
    });

    it("Should allow a user to buy an NFT if it's for sale", async function () {
        await marketplace.connect(buyer).buyNFT(nftId, { value: price });
        expect(await marketplace.ownerOf(nftId)).to.equal(buyer.address);
    });

    it("Should not allow buying an NFT that is not for sale", async function () {
        await marketplace.connect(buyer).buyNFT(nftId, { value: price }); // Buyer purchases it

        try {
            await marketplace.connect(anotherUser).buyNFT(nftId, { value: price });
            expect.fail("Expected transaction to fail but it succeeded");
        } catch (error) {
            expect(error.message).to.include("NFT not for sale");
        }
    });

    it("Should not allow a user to buy their own NFT", async function () {
        try {
            await marketplace.connect(seller).buyNFT(nftId, { value: price });
            expect.fail("Expected transaction to fail but it succeeded");
        } catch (error) {
            expect(error.message).to.include("Cannot buy your own NFT");
        }
    });

    it("Should fail if insufficient ETH is sent", async function () {
        const insufficientAmount = ethers.utils.parseEther("0.5");
        try {
            await marketplace.connect(buyer).buyNFT(nftId, { value: insufficientAmount });
            expect.fail("Expected transaction to fail but it succeeded");
        } catch (error) {
            expect(error.message).to.include("Insufficient funds");
        }
    });

    it("Should transfer ownership of the NFT correctly", async function () {
        await marketplace.connect(buyer).buyNFT(nftId, { value: price });
        expect(await marketplace.ownerOf(nftId)).to.equal(buyer.address);
    });

    it("Should mark NFT as not for sale after purchase", async function () {
        await marketplace.connect(buyer).buyNFT(nftId, { value: price });
        const nft = await marketplace.getNFTDetails(nftId);
        expect(nft.forSale).to.be.false;
    });

    it("Should transfer funds to the seller", async function () {
        const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
        const tx = await marketplace.connect(buyer).buyNFT(nftId, { value: price });
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
        const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

        const expectedBalance = sellerBalanceBefore.add(price);
        // expect(sellerBalanceAfter.toString()).to.be.closeTo(expectedBalance.toString(), ethers.utils.parseEther("0.001").toString()); // Allow minor difference
        // expect(sellerBalanceAfter.toBigInt()).to.be.closeTo(expectedBalance.toBigInt(), ethers.utils.parseEther("0.001").toBigInt());
        expect(Number(sellerBalanceAfter)).to.be.closeTo(Number(expectedBalance), Number(ethers.utils.parseEther("0.001")));

    });

    it("Should update owns[] of the buyer and seller correctly", async function () {
        await marketplace.connect(buyer).buyNFT(nftId, { value: price });

        const sellerData = await marketplace.getUserDetails(seller.address);
        const buyerData = await marketplace.getUserDetails(buyer.address);

        expect(sellerData.owns.length).to.equal(0); // Ensure seller no longer owns it
        expect(buyerData.owns.length).to.equal(1);
        expect(buyerData.owns[0].toNumber()).to.equal(nftId); // Convert BigNumber to Number
    });

    it("Should emit NFTBought event with correct parameters", async function () {
        const tx = await marketplace.connect(buyer).buyNFT(nftId, { value: price });
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === "NFTBought");

        expect(event).to.not.be.undefined;
        expect(event.args.tokenId.toNumber()).to.equal(nftId); // Convert BigNumber to Number
        expect(event.args.buyer).to.equal(buyer.address);
        expect(event.args.price.toString()).to.equal(price.toString()); // Convert to string for comparison
    });
});
