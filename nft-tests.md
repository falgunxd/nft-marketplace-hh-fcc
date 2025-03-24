# Test Plan for NFT Marketplace
## User Registration Tests

    ✅ Should allow a new user to register

    ✅ Should not allow registering twice from the same address

    ✅ Should not allow registering with an already used roll number

    ✅ Should store correct user details

    ✅ Should correctly map roll number to address

    ✅ Should retrieve user by roll number correctly

    ✅ Should revert if retrieving unregistered roll number

## NFT Minting Tests

    ✅ Should allow a registered user to mint an NFT

    ✅ Should not allow an unregistered user to mint an NFT

    ✅ Should assign correct creator and owner

    ✅ Should increase nextTokenId after minting

    ✅ Should store NFT metadata and price correctly

    ✅ Should add minted NFT to user’s creates[] and owns[] arrays

    ✅ Should emit NFTCreated event with correct parameters

## NFT Listing Tests

    ✅ Should allow the owner to list their NFT for sale

    ✅ Should not allow non-owners to list an NFT

    ✅ Should not allow setting price to 0

    ✅ Should mark NFT as forSale and store the price correctly

    ✅ Should emit NFTListed event with correct parameters

## NFT Buying Tests

    ✅ Should allow a user to buy an NFT if it's for sale

    ✅ Should not allow buying an NFT that is not for sale

    ✅ Should not allow a user to buy their own NFT

    ✅ Should fail if insufficient ETH is sent

    ✅ Should transfer ownership of the NFT correctly

    ✅ Should mark NFT as not for sale after purchase

    ✅ Should transfer funds to the seller

    ✅ Should update owns[] of the buyer and seller correctly

    ✅ Should emit NFTBought event with correct parameters

## Retrieval & View Functions

    ✅ Should retrieve correct user details

    ✅ Should retrieve correct NFT details

    ✅ Should list all NFTs for sale

    ✅ Should return an empty list if no NFTs are for sale

    ✅ Should return correct NFTs after multiple users interact

## Additional Edge Case Tests

    ✅ Should not allow NFT transfer outside of marketplace functions

    ✅ Should handle large roll numbers and long names gracefully

    ✅ Should prevent overflows when minting multiple NFTs

    ✅ Should not allow negative or zero roll numbers

    ✅ Should handle multiple NFTs correctly for a single user