// Tests in progress...
const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFTSoldIty Unit Tests", function () {
        let nftSoldIty, nftSoldItyInstanceExternal, deployer, user

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["NFTSoldIty"])
            nftSoldIty = await ethers.getContract("NFTSoldIty")
        })

        /**
          * @dev Tests to be done in order:
           
          1. Constructor()
             * It assigns correct owner ✔️
             * It gives contract correct name and symbol
             * It shows 0 minted tokens
          2. mintNFT()
             * It creates new tokenId (NFT) and emit's (minter, tokenId)
             * It assigns correct tokenURI to created NFT and emit's (tokenURI)
             * It set's correct starting price for created NFT
             * It set's auction starting time for created NFT
             * It throws error if called by external user (only owner can mint NFT)
          3. placeBid()
             * It is nonReentrant
             * It reverts if called by contract owner
             * It reverts if tokenId doesn't exist
             * It reverts if auction still ongoing for given tokenId
             * It extends auction time if auction is close to ending and bid is received
             * It reverts if amount sent is less than start price for given tokenId if first bid
             * It reverts if amount sent is less than lastest bid plus min bid amount for given tokenId if not first bid
             * It transfers latest lower bid to correct bidder if higher bid received and emit's (bid, transfer) if not first bid
             * It assigns highestBidder per tokenId
             * It assigns highestBid per tokenId
             * It emit's (bid, bidder, tokenId)
          4. tokenURI()
             * It returns correct tokenURI per tokenId
          5. approve(), transferFrom(), safeTransferFrom(), safeTransferFrom()
             * It is usable for tokenId's, which auction's have finished and minBid received
             * It is not allowed to use for tokenId's for which bidding is still ongoing            
          6. setApprovalForAll()
             * It reverts once used
          7. acceptBid()
             * It is usable for only owner
             * It is usable for tokenId's for which auction already finished only
             * It reverts if given tokenId doesn't exist
             * It reverts if there was no bid received for given tokenId
             * It withdraw's money back to owner for each tokenId and emit's (bid, transfer)
             * It approve's highest bidding address per tokenId to claim NFT and emit's (owner, approvedAddress, tokenId)
          8. withdrawMoney()
             * It is usable for only owner
             * It is usable for tokenId's for which auction already finished only
             * It reverts if given tokenId doesn't exist
             * It withdraw's money back to owner for each tokenId and emit's (bid, transfer)
          9. renewAuction()
             * It is usable for only owner
             * It is usable for tokenId's for which auction already finished only
             * It reverts if given tokenId doesn't exist
             * It reverts if there was bid received for given tokenId
             * It renew and sets correct auction time for given tokenId and emit's (time, tokenId)
          10. getters()
             * It displays correct data
          */

        describe("Constructor", () => {
            it("Initializes the NFT Correctly.", async () => {
                const owner = await nftSoldIty.owner()
                const name = await nftSoldIty.name()
                const symbol = await nftSoldIty.symbol()
                const tokenCounter = await nftSoldIty.getTokenCounter()

                assert.equal(owner, deployer.address)
                assert.equal(name, "NftSoldIty")
                assert.equal(symbol, "AIN")
                assert.equal(tokenCounter.toString(), "0")
            })
        })

        describe("Mint NFT", () => {
            beforeEach(async () => {
                const txResponse = await nftSoldIty.mintNFT("tokenURI", "nftTitle")
                await txResponse.wait(1)
            })
            it("Allows owner to mint an NFT", async function () {
                const tokenCounter = await nftSoldIty.getTokenCounter()
                const txResponse = await nftSoldIty.mintNFT("tokenURI", "nftTitle")

                assert(txResponse)
                assert.equal(tokenCounter.toString(), "1")
            })
            it("Emits event when NFT is minted", async function () {
                const txResponse = await nftSoldIty.mintNFT("Token_URI", "NFT_Title")
                const txReceipt = await txResponse.wait()
                // We have to use 1 index as "_mint" function has index 0
                const minter = txReceipt.events[1].args.minter
                const title = txReceipt.events[1].args.title
                console.log(`Minter: ${minter} Title: ${title}`)

                assert.equal(minter == deployer.address, title == "NFT_Title")
                await expect(nftSoldIty.mintNFT("Token_URI", "NFT_Title")).to.emit(nftSoldIty, `NFTMinted`)
            })
            it("Not allows accounts other than owner to mint an NFT", async function () {
                const maliciousAccount = accounts[2]
                // In order to use above account we have to first connect it to our mother contract instance
                const nftSoldItyExternal = await nftSoldIty.connect(maliciousAccount)

                await expect(nftSoldItyExternal.mintNFT("tokenURI", "nftTitle")).to.be.revertedWith("Ownable: caller is not the owner")
            })
            it("Show the correct owner and balance of NFT's", async function () {
                const deployerAddress = deployer.address
                const deployerBalance = await nftSoldIty.balanceOf(deployerAddress)
                const owner = await nftSoldIty.ownerOf("0")

                // Second Mint
                await nftSoldIty.mintNFT("tokenURI2", "nftTitle2")
                const secBalance = await nftSoldIty.balanceOf(deployerAddress)
                const secOwner = await nftSoldIty.ownerOf("1")

                assert.equal(deployerBalance.toString(), "1")
                assert.equal(owner, deployerAddress)
                assert.equal(secBalance.toString(), "2")
                assert.equal(secOwner, deployerAddress)
                await expect(nftSoldIty.ownerOf("2")).to.be.revertedWith("ERC721: invalid token ID")
            })
            it("Assigns correct tokenId to tokenURI", async function () {
                const assignedURI = await nftSoldIty.getTokenIdToTokenURI(0)
                await nftSoldIty.mintNFT("Token_URI", "NFT_Title")
                const secondAssignedURI = await nftSoldIty.getTokenIdToTokenURI(1)

                assert.equal(assignedURI, "tokenURI")
                assert.equal(secondAssignedURI, "Token_URI")
            })
        })
        describe("Place Bid", () => {
            beforeEach(async () => {
                const txResponse = await nftSoldIty.mintNFT("tokenURI", "nftTitle")
                await txResponse.wait(1)
                // External User Of Our Contract
                user = accounts[2]
                nftSoldItyInstanceExternal = await nftSoldIty.connect(user)
                //const owner = await nftSoldIty.owner()
            })
            it("Not allows owner to bid an NFT", async function () {
                await expect(nftSoldIty.placeBid(0, { value: ethers.utils.parseEther("0.15") })).to.be.revertedWith(
                    "nftSoldIty__ContractOwnerIsNotAllowedToBid"
                )
            })
            it("Revert if passed tokenId does not exist", async () => {
                await expect(nftSoldItyInstanceExternal.placeBid(1, { value: ethers.utils.parseEther("0.15") })).to.be.revertedWith(
                    "nftSoldIty__NotExistingTokenId"
                )
            })
            it("For first NFT revert if placed bid value is 0 or less", async () => {
                await expect(nftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("0") })).to.be.revertedWith("nftSoldIty__NotEnoughETH")
            })
            it("Stores highest bid on contract and doesn't allow to bid if next bid value is less or the same as highest one", async () => {
                const txResponse = await nftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("0.15") })
                const txReceipt = await txResponse.wait()
                const our_val = txReceipt.events[0].args.amount
                console.log(`Bid Value: ${our_val.toString()}`)
                const contractBalance = await ethers.provider.getBalance(nftSoldIty.address)

                assert.equal(our_val.toString(), contractBalance)
                await expect(nftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("0.15") })).to.be.revertedWith("nftSoldIty__NotEnoughETH")
            })
            it("For first and rest NFT bidding emits event and return previous bid to owner", async () => {
                const userBal = await ethers.provider.getBalance(user.address)
                const txResponse = await nftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("0.15") })
                const txReceipt = await txResponse.wait()
                const { gasUsed, effectiveGasPrice } = txReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                await expect(txResponse).to.emit(nftSoldItyInstanceExternal, "FirstNFTBidPlaced")
                const userAfterBid = await ethers.provider.getBalance(user.address)

                bidder = accounts[3]
                secnftSoldItyInstanceExternal = await nftSoldIty.connect(bidder)

                await expect(secnftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("0.27") })).to.emit(
                    nftSoldItyInstanceExternal,
                    "NFTBidPlaced"
                )
                const userEndBalance = await ethers.provider.getBalance(user.address)

                assert.equal(userBal.sub(ethers.utils.parseEther("0.15")).sub(gasCost).toString(), userAfterBid.toString())
                assert.equal(userBal.sub(gasCost), userEndBalance.toString())
            })
            it("Allows user to bid an NFT", async function () {
                const tx = await nftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("1") })

                assert(tx)
            })
            it("Revert if bidding is closed for NFT", async () => {
                await nftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("0.45") })
                await nftSoldIty.tokenBiddingEnder(0)

                await expect(nftSoldItyInstanceExternal.placeBid(0, { value: ethers.utils.parseEther("0.77") })).to.be.revertedWith(
                    "nftSoldIty__BiddingClosedForThisNFT"
                )
            })
        })
    })