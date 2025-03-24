// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "./node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "./node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    struct User {
        address account;
        uint256 rollNumber;
        string name;
        uint256[] owns;
        uint256[] creates;
    }
    
    struct NFT {
        uint256 id;
        address creator;
        address owner;
        uint256 price;
        bool forSale;
    }
    
    mapping(address => User) public users;
    mapping(uint256 => NFT) public nfts;
    uint256 public nextTokenId;
    mapping(uint256 => bool) private existingRollNumbers;
    mapping(uint256 => address) public rollNumberToAddress;

    
    event NFTCreated(uint256 indexed tokenId, address creator, string tokenURI);
    event NFTListed(address indexed owner, uint256 indexed tokenId, uint256 price);
    event NFTBought(uint256 indexed tokenId, address buyer, uint256 price);
    
    constructor() ERC721("InstituteNFT", "INFT")  {}
    

    function registerUser(uint256 rollNumber, string memory name) external {
        require(users[msg.sender].rollNumber == 0, "User already registered");
        require(!existingRollNumbers[rollNumber], "Roll number already exists");
        require(rollNumber > 0, "Roll number must be positive"); // ✅ Add this

        users[msg.sender] = User({
            account: msg.sender,
            rollNumber: rollNumber,
            name: name,
            owns: new uint256 [](0),
            creates: new uint256 [](0)
        });

        rollNumberToAddress[rollNumber] = msg.sender;
        existingRollNumbers[rollNumber] = true;
    }

    
    function getUserByRollNumber(uint256 rollNumber) external view returns (User memory) {
        address userAddress = rollNumberToAddress[rollNumber];
        require(userAddress != address(0), "Roll number not registered");
        return users[userAddress];
    }


    function mintNFT(string memory tokenURI, uint256 price) external {
        require(users[msg.sender].rollNumber != 0, "User not registered");
        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        nfts[tokenId] = NFT(tokenId, msg.sender, msg.sender, price, false);
        users[msg.sender].creates.push(tokenId);
        users[msg.sender].owns.push(tokenId);
        
        emit NFTCreated(tokenId, msg.sender, tokenURI);
    }
    
    
    function listNFT(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than zero");

        NFT storage nft = nfts[tokenId];
        require(!nft.forSale, "NFT is already listed");

        nft.forSale = true;
        nft.price = price;

        emit NFTListed(msg.sender, tokenId, price);  // ✅ Corrected event emission
    }

    
    function buyNFT(uint256 tokenId) external payable {
        NFT storage nft = nfts[tokenId];
        require(nft.forSale, "NFT not for sale");
        require(msg.value >= nft.price, "Insufficient funds");
        require(msg.sender != nft.owner, "Cannot buy your own NFT");
        
        address previousOwner = nft.owner;
        payable(previousOwner).transfer(msg.value);
        
        _transfer(previousOwner, msg.sender, tokenId);
        nft.owner = msg.sender;
        nft.forSale = false;
        
        users[previousOwner].owns.pop();
        users[msg.sender].owns.push(tokenId);
        
        emit NFTBought(tokenId, msg.sender, msg.value);
    }
    
    function getUserDetails(address userAddress) external view returns (User memory) {
        return users[userAddress];
    }
    
    function getNFTDetails(uint256 tokenId) external view returns (NFT memory) {
        return nfts[tokenId];
    }
    
    function listAllNFTsForSale() external view returns (NFT[] memory) {
        uint256 count;
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (nfts[i].forSale) {
                count++;
            }
        }
        NFT[] memory saleNFTs = new NFT[](count);
        uint256 index;
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (nfts[i].forSale) {
                saleNFTs[index++] = nfts[i];
            }
        }
        return saleNFTs;
    }
}
