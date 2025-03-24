const { ethers } = require("hardhat");
const assert = require("assert");

describe("NFTMarketplace - User Registration", function () {
    let nftMarketplace;
    let owner, user1, user2;

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();
        const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
        nftMarketplace = await NFTMarketplace.deploy();
        await nftMarketplace.deployed();
    });

    it("Should allow a new user to register", async () => {
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");
        const userDetails = await nftMarketplace.getUserDetails(user1.address);
        assert.strictEqual(userDetails.rollNumber.toNumber(), 12345, "Roll number mismatch");
        assert.strictEqual(userDetails.name, "Alice", "Name mismatch");
    });

    it("Should not allow registering twice from the same address", async () => {
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");

        try {
            await nftMarketplace.connect(user1).registerUser(67890, "Bob");
            assert.fail("Expected an error but didn't get one");
        } catch (error) {
            assert(error.message.includes("User already registered"), "Wrong error message");
        }
    });

    it("Should not allow registering with an already used roll number", async () => {
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");

        try {
            await nftMarketplace.connect(user2).registerUser(12345, "Bob");
            assert.fail("Expected an error but didn't get one");
        } catch (error) {
            assert(error.message.includes("Roll number already exists"), "Wrong error message");
        }
    });

    it("Should store correct user details", async () => {
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");
        const userDetails = await nftMarketplace.getUserDetails(user1.address);
        assert.strictEqual(userDetails.rollNumber.toNumber(), 12345, "Roll number mismatch");
        assert.strictEqual(userDetails.name, "Alice", "Name mismatch");
    });

    it("Should correctly map roll number to address", async () => {
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");
        const userAddress = await nftMarketplace.rollNumberToAddress(12345);
        assert.strictEqual(userAddress, user1.address, "Roll number mapping incorrect");
    });

    it("Should retrieve user by roll number correctly", async () => {
        await nftMarketplace.connect(user1).registerUser(12345, "Alice");
        const userDetails = await nftMarketplace.getUserByRollNumber(12345);
        assert.strictEqual(userDetails.account, user1.address, "Account address mismatch");
        assert.strictEqual(userDetails.name, "Alice", "Name mismatch");
        assert.strictEqual(userDetails.rollNumber.toNumber(), 12345, "Roll number mismatch");
    });

    it("Should revert if retrieving unregistered roll number", async () => {
        try {
            await nftMarketplace.getUserByRollNumber(99999);
            assert.fail("Expected an error but didn't get one");
        } catch (error) {
            assert(error.message.includes("Roll number not registered"), "Wrong error message");
        }
    });
});
