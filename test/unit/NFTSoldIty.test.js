const { assert, expect } = require("chai")
const { parseEther } = require("ethers/lib/utils")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, AUCTION_DURATION } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFTSoldIty NFT Unit Tests", function () {
        let nftSoldIty, nftSoldItyInstance, resMintTx, recMintTx, tokenId, deployer, user, auctionDuration

        beforeEach(async () => {
            auctionDuration = 30
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            // Deploying NFTSoldIty
            await deployments.fixture(["NFTSoldIty"])
            nftSoldIty = await ethers.getContract("NFTSoldIty")
        })

        /**
          * @dev Tests to be done in order:
           
          1. Constructor()
             * It assigns correct owner ✔️
             * It gives contract correct name and symbol ✔️
             * It shows 0 minted tokens ✔️
          2. mintNFT()
             * It creates new tokenId (NFT) and emit's (minter, tokenId) ✔️
             * It assigns correct tokenURI to created NFT and emit's (tokenURI) ✔️
             * It set's correct starting price for created NFT ✔️
             * It set's auction starting time for created NFT ✔️
             * It throws error if called by external user (only owner can mint NFT) ✔️
          3. placeBid()
             * It reverts if called by contract owner ✔️
             * It reverts if tokenId doesn't exist ✔️
             * It reverts if auction already finished for given tokenId ✔️
             * It extends auction time if auction is close to ending and bid is received ✔️
             * It reverts if amount sent is less than start price for given tokenId if first bid ✔️
             * It reverts if amount sent is less than lastest bid plus min bid amount for given tokenId if not first bid ✔️
             * It transfers latest lower bid to correct bidder if higher bid received and emit's (bid, transfer) if not first bid ✔️
             * It assigns highestBidder per tokenId ✔️
             * It assigns highestBid per tokenId ✔️
             * It emit's (bid, bidder, tokenId) ✔️
          4. tokenURI()
             * It returns correct tokenURI per tokenId ✔️
          5. approve(), transferFrom(), safeTransferFrom(), safeTransferFrom()
             * It is usable for tokenId's, which auction's have finished and minBid received ✔️
             * It is not allowed to use for tokenId's for which bidding is still ongoing ✔️
          6. setApprovalForAll()
             * It reverts once used ✔️
          7. acceptBid()
             * It is usable for only owner and tokenId's received bid and only if auction already finished and emits three confirmations ✔️
             * It reverts if given tokenId doesn't exist ✔️
             * It reverts if auction not finished for given tokenId ✔️
             * It reverts if there was no bid received for given tokenId ✔️
             * It withdraw's money back to owner for each tokenId and emit's (bid, transfer) ✔️
             * It approve's highest bidding address per tokenId to claim NFT and emit's (owner, approvedAddress, tokenId) ✔️
          8. withdrawMoney()
             * It is usable for only owner and tokenId's received bid and only if auction already finished and emit's (bid, transfer) ✔️
             * It reverts if given tokenId doesn't exist ✔️
             * It reverts if auction not finished for given tokenId ✔️
             * It reverts if there was no bid received for given tokenId ✔️
             * It withdraw's money back to owner for each tokenId and emit's (bid, transfer) ✔️
          9. renewAuction()
             * It is usable for only owner ✔️
             * It is usable for tokenId's for which auction already finished only ✔️
             * It reverts if given tokenId doesn't exist ✔️
             * It reverts if there was bid received for given tokenId ✔️
             * It renew and sets correct auction time for given tokenId and emit's (time, tokenId) ✔️
          10. getters()
             * It displays correct data ✔️
          */
        // --------------------------------------------------------------------------------------------------------------------------
        describe("Constructor", () => {
            it("Initializes the NFT Correctly.", async () => {
                const owner = await nftSoldIty.owner()
                const name = await nftSoldIty.name()
                const symbol = await nftSoldIty.symbol()
                const tokenCounter = await nftSoldIty.totalSupply()

                assert.equal(owner, deployer.address)
                assert.equal(name, "NFTSoldIty")
                assert.equal(symbol, "AIN")
                assert.equal(tokenCounter.toString(), "0")
            })
        })
        // --------------------------------------------------------------------------------------------------------------------------
        describe("Mint NFT", () => {
            beforeEach(async () => {
                // Minting NFT
                resMintTx = await nftSoldIty.mintNFT("tokenURIx", auctionDuration)
                recMintTx = await resMintTx.wait()
                tokenId = recMintTx.events[1].args.tokenId
            })
            it("It reverts if auction duration argument is too low", async () => {
                await expect(nftSoldIty.mintNFT("tokenURIxx", 9)).to.be.revertedWith("NFTSoldIty__AuctionDurationTooShort")
            })
            it("It creates new tokenId (NFT) and emit's (minter, tokenId)", async function () {
                // We have to use 1 index as "_mint" function has index 0
                const minter = recMintTx.events[1].args.minter
                console.log(`Minter: ${minter} TokenId: ${tokenId}`)
                const tokenCounter = await nftSoldIty.totalSupply()

                assert.equal(tokenCounter, 1)
                assert.equal(minter == deployer.address, tokenId == 0)
                await expect(nftSoldIty.mintNFT("tokenURIx", auctionDuration)).to.emit(nftSoldIty, `NFT_Minted`)
            })
            it("It assigns correct tokenURI to created NFT and emit's (tokenURI)", async function () {
                const tokenURI = recMintTx.events[2].args.uri
                tokenId = recMintTx.events[2].args.tokenId
                console.log(`TokenURI: ${tokenURI} TokenId: ${tokenId}`)
                const setTokenURI = await nftSoldIty.tokenURI(tokenId)

                assert.equal(tokenURI, setTokenURI)
                await expect(nftSoldIty.mintNFT("tokenURIx", auctionDuration)).to.emit(nftSoldIty, `NFT_SetTokenURI`)
            })
            it("It assigns correct auction duration per tokenId and emit's (time)", async () => {
                auctionDuration = 180
                const mintResponseTx = await nftSoldIty.mintNFT("tokenURI_T", auctionDuration)
                const mintReceiptTx = await mintResponseTx.wait()
                const time = mintReceiptTx.events[3].args.time
                tokenId = mintReceiptTx.events[3].args.tokenId

                assert.equal(tokenId, 1)
                assert.equal(time, auctionDuration)
                await expect(nftSoldIty.mintNFT("tokenURIz", auctionDuration)).to.emit(nftSoldIty, `NFT_AuctionTimeUpdated`)
            })
            it("It set's correct starting price for created NFT", async function () {
                const price = await nftSoldIty.getHighestBid(tokenId)
                console.log(`Price: ${price}`)

                // 0.1 ETH
                assert.equal(price.toString(), parseEther("0.1").toString())
            })
            it("It set's auction starting time for created NFT", async function () {
                const time = await nftSoldIty.getTime(0)
                console.log(`Time: ${time}`)

                assert.equal(time, 30)
            })
            it("It throws error if called by external user (only owner can mint NFT)", async function () {
                user = accounts[1]
                // In order to use above account we have to first connect it to our mother contract instance
                nftSoldItyInstance = await nftSoldIty.connect(user)

                await expect(nftSoldItyInstance.mintNFT("tokenURIxx", auctionDuration)).to.be.revertedWith("Ownable: caller is not the owner")
            })
        })
        // --------------------------------------------------------------------------------------------------------------------------
        describe("Place Bid", () => {
            beforeEach(async () => {
                // Minting NFT
                resMintTx = await nftSoldIty.mintNFT("tokenURIx", auctionDuration)
                recMintTx = await resMintTx.wait()
                tokenId = recMintTx.events[1].args.tokenId

                // Connecting External User
                user = accounts[1]
                nftSoldItyInstance = await nftSoldIty.connect(user)
            })
            it("It reverts if called by contract owner", async function () {
                await expect(nftSoldIty.placeBid(0, { value: parseEther("0.15") })).to.be.revertedWith("NFTSoldIty__ContractOwnerIsNotAllowedToBid")
            })
            it("It reverts if tokenId doesn't exist", async function () {
                await expect(nftSoldItyInstance.placeBid(1, { value: parseEther("0.15") })).to.be.revertedWith("NFTSoldIty__NotExistingTokenId")
            })
            it("It reverts if auction already finished for given tokenId", async function () {
                // Increasing time by 30s
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION])
                // Mining new block
                await network.provider.send("evm_mine", [])

                await expect(nftSoldItyInstance.placeBid(0, { value: parseEther("0.15") })).to.be.revertedWith("NFTSoldIty__AuctionFinishedForThisNFT")
            })
            it("It extends auction time if auction is close to ending and bid is received and emit's time and tokenId", async function () {
                let auctionTime = await nftSoldIty.getTime(tokenId)
                console.log(`Auction Time For ${tokenId} NFT Left: ${auctionTime}`)

                const resBidTx = await nftSoldItyInstance.placeBid(0, { value: parseEther("0.15") })
                const recBidTx = await resBidTx.wait()
                const time = recBidTx.events[0].args.time
                tokenId = recBidTx.events[0].args.tokenId

                auctionTime = await nftSoldIty.getTime(tokenId)
                console.log(`Auction Time For ${tokenId} NFT Left: ${time} After New Bid`)

                assert.equal(auctionTime.toString(), time.toString()) // 120 + 29 as 1s passed after bidding
                await expect(resBidTx).to.emit(nftSoldIty, `NFT_AuctionTimeUpdated`)
            })
            it("It reverts if amount sent is less than start price for given tokenId if first bid", async function () {
                await expect(nftSoldItyInstance.placeBid(0, { value: parseEther("0.09") })).to.be.revertedWith("NFTSoldIty__NotEnoughETH")
            })
            it("It reverts if amount sent is less than lastest bid plus min bid amount for given tokenId if not first bid", async function () {
                await nftSoldItyInstance.placeBid(0, { value: parseEther("0.15") })
                await expect(nftSoldItyInstance.placeBid(0, { value: parseEther("0.159") })).to.be.revertedWith("NFTSoldIty__NotEnoughETH")
            })
            it("It adds previous bids for pending withdrawal for losing bidder's and allow them to withdraw those", async function () {
                // Below are also included in this test
                // it("It assigns highestBidder per tokenId")
                // it("It assigns highestBid per tokenId")
                // it("It emit's (bid, bidder, tokenId)")
                sec_user = accounts[2]
                const startingBalance = parseEther("10000")
                const txResponse = await nftSoldItyInstance.placeBid(0, { value: parseEther("15") })
                let txReceipt = await txResponse.wait()
                let bidVal = txReceipt.events[1].args.amount
                const bidder = txReceipt.events[1].args.bidder
                tokenId = txReceipt.events[1].args.tokenId
                const time = txReceipt.events[0].args.time

                console.log(`Bid Value: ${bidVal.toString()} WEI Bidder: ${bidder} tokenId: ${tokenId} Time Left: ${time}`)

                let pendingWithdrawal = await nftSoldIty.getPendingReturns(user.address)
                let contractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                let balanceETH = await ethers.provider.getBalance(user.address)
                let secBalETH = await ethers.provider.getBalance(sec_user.address)
                console.log(`Balance Of First User: ${balanceETH} ETH Second User: ${secBalETH} WEI Pending Withdrawal Balance: ${pendingWithdrawal}`)

                let highestBid = await nftSoldIty.getHighestBid(tokenId)
                let highestBidder = await nftSoldIty.getHighestBidder(tokenId)
                console.log(`Highest Bid: ${highestBid} Highest Bidder: ${highestBidder}`)

                const { gasUsed, effectiveGasPrice } = txReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                assert.equal(pendingWithdrawal, 0)
                assert.equal(bidder, user.address, highestBidder)
                assert.equal(bidVal.toString(), contractBalance, highestBid)
                assert.equal(balanceETH, startingBalance.sub(bidVal).sub(gasCost).toString())
                await expect(txResponse).to.emit(nftSoldIty, "NFT_BidPlaced")

                nftSoldItyInstance = await nftSoldIty.connect(sec_user)

                const resRetTx = await nftSoldItyInstance.placeBid(0, { value: parseEther("30") })
                const recRetTx = await resRetTx.wait()
                const pendingBid = recRetTx.events[0].args.bid
                const pendingBidder = recRetTx.events[0].args.bidder
                const newBid = recRetTx.events[1].args.amount
                pendingWithdrawal = await nftSoldIty.getPendingReturns(user.address)
                contractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                console.log(`Pending Bid: ${pendingBid} For: ${pendingBidder} Pending Bid Added: ${bidVal} Pending Withdrawal Balance: ${pendingWithdrawal}`)

                balanceETH = await ethers.provider.getBalance(user.address)
                secBalETH = await ethers.provider.getBalance(sec_user.address)
                console.log(`Balance Of First User: ${balanceETH} ETH Second User: ${secBalETH} WEI`)

                highestBid = await nftSoldIty.getHighestBid(tokenId)
                highestBidder = await nftSoldIty.getHighestBidder(tokenId)
                console.log(`New Highest Bid: ${highestBid} New Highest Bidder: ${highestBidder}`)

                const newGas = recRetTx.gasUsed
                const newGasPrice = recRetTx.effectiveGasPrice
                const newGasCost = newGas.mul(newGasPrice)

                assert.equal(pendingWithdrawal, parseEther("15").toString())
                assert.equal(contractBalance.toString(), newBid.add(pendingBid).toString())
                assert.equal(balanceETH.toString(), startingBalance.sub(bidVal).sub(gasCost).toString())
                assert.equal(secBalETH.toString(), startingBalance.sub(newBid).sub(newGasCost).toString())
                await expect(resRetTx).to.emit(nftSoldIty, `NFT_AddedPendingBidsForWithdrawal`)

                nftSoldItyInstance = await nftSoldIty.connect(user)
                const respTx = await nftSoldItyInstance.withdrawPending()
                const recpTx = await respTx.wait()
                const firstBidderBid = recpTx.events[0].args.bid
                const firstBidder = recpTx.events[0].args.bidder
                const firstBidderTx = recpTx.events[0].args.transfer
                contractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                balanceETH = await ethers.provider.getBalance(user.address)
                console.log(`Pending Bid: ${firstBidderBid} Has Been Returned To: ${firstBidder} Transfer: ${firstBidderTx}`)

                const newestGas = recpTx.gasUsed
                const newestGasPrice = recpTx.effectiveGasPrice
                const newestGasCost = newestGas.mul(newestGasPrice)

                assert.equal(firstBidderBid.toString(), bidVal.toString())
                assert.equal(firstBidder, user.address)
                assert.equal(firstBidderTx, true)
                assert.equal(contractBalance, parseEther("30").toString())
                assert.equal(balanceETH.toString(), startingBalance.sub(gasCost).sub(newestGasCost).toString())
                await expect(respTx).to.emit(nftSoldIty, `NFT_PendingBidsWithdrawal`)
            })
        })
        describe("Withdraw Pending", () => {
            beforeEach(async () => {
                user = accounts[3]
                nftSoldItyInstance = await nftSoldIty.connect(user)
                await nftSoldIty.mintNFT("SomeNFT", auctionDuration)
                await nftSoldIty.mintNFT("SomeOtherNFT", auctionDuration)
            })
            it("It reverts if amount to withdraw is 0", async () => {
                await expect(nftSoldItyInstance.withdrawPending()).to.be.revertedWith("NFTSoldIty__NotEnoughETH")
            })
            it("It reverts if transaction fails and keep pending amount to withdraw", async () => { })
            it("It withdraws bids from multiple tokens", async () => {
                const startingContractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                const startingUserBalance = await ethers.provider.getBalance(user.address)

                assert.equal(startingContractBalance, 0)
                assert.equal(startingUserBalance, parseEther("10000").toString())

                const firstResTx = await nftSoldItyInstance.placeBid(0, { value: parseEther("10") })
                const firstRecTx = await firstResTx.wait()

                const gas = firstRecTx.gasUsed
                const gasPrice = firstRecTx.effectiveGasPrice
                const gasCost = gas.mul(gasPrice)

                const anotherBidder = accounts[4]
                nftSoldItyInstance = await nftSoldIty.connect(anotherBidder)
                await nftSoldItyInstance.placeBid(0, { value: parseEther("20") })

                nftSoldItyInstance = await nftSoldIty.connect(user)
                const secondResTx = await nftSoldItyInstance.placeBid(1, { value: parseEther("16") })
                const secondRecTx = await secondResTx.wait()

                const newGas = secondRecTx.gasUsed
                const newGasPrice = secondRecTx.effectiveGasPrice
                const newGasCost = newGas.mul(newGasPrice)

                nftSoldItyInstance = await nftSoldIty.connect(anotherBidder)
                await nftSoldItyInstance.placeBid(1, { value: parseEther("26") })
                const midContractBalance = await ethers.provider.getBalance(nftSoldIty.address)

                assert.equal(midContractBalance, parseEther("72").toString())

                nftSoldItyInstance = await nftSoldIty.connect(user)
                const thirdResTx = await nftSoldItyInstance.withdrawPending()
                const thirdRecTx = await thirdResTx.wait()

                const newestGas = thirdRecTx.gasUsed
                const newestGasPrice = thirdRecTx.effectiveGasPrice
                const newestGasCost = newestGas.mul(newestGasPrice)

                const postContractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                const finalUserBalance = await ethers.provider.getBalance(user.address)

                assert.equal(postContractBalance, parseEther("46").toString())
                assert.equal(finalUserBalance, startingUserBalance.sub(gasCost).sub(newGasCost).sub(newestGasCost).toString())
            })
        })
        describe("Save And Read TokenURI", () => {
            it("It returns correct tokenURI per tokenId", async () => {
                await nftSoldIty.mintNFT("FirstTokenURI", auctionDuration)
                await nftSoldIty.mintNFT("SecondTokenURI", auctionDuration)

                let tokenURI = await nftSoldIty.tokenURI(0)
                assert.equal(tokenURI, "FirstTokenURI")
                tokenURI = await nftSoldIty.tokenURI(1)
                assert.equal(tokenURI, "SecondTokenURI")
            })
        })
        describe("Functions allowed to use: approve(), transferFrom(), safeTransferFrom(), safeTransferFrom()", () => {
            beforeEach(async () => {
                user = accounts[3]
                nftSoldItyInstance = await nftSoldIty.connect(user)
                await nftSoldIty.mintNFT("FirstTokenURI", auctionDuration)
                await nftSoldItyInstance.placeBid(0, { value: parseEther("0.1") })
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION + 119])
                await network.provider.send("evm_mine", [])

                tokenId = (await nftSoldIty.totalSupply()) - 1
            })
            it("It is usable for tokenId's, which auction's have finished and minBid received if called by not approved owner it reverts approve() transferFrom()", async () => {
                const highestBid = await nftSoldIty.getHighestBid(tokenId)
                const highestBidder = await nftSoldIty.getHighestBidder(tokenId)
                console.log(`Bid: ${highestBid} Bidder: ${highestBidder} TokenId: ${tokenId}`)

                await expect(nftSoldItyInstance.approve(user.address, tokenId)).to.be.revertedWith("ApprovalCallerNotOwnerNorApproved")
                await expect(nftSoldItyInstance.transferFrom(deployer.address, user.address, tokenId)).to.be.revertedWith(
                    "TransferCallerNotOwnerNorApproved"
                )
                await expect(nftSoldIty.approve(user.address, tokenId)).to.emit(nftSoldIty, "Approval")
                await expect(nftSoldIty.transferFrom(deployer.address, user.address, tokenId)).to.emit(nftSoldIty, "Transfer")
            })
            it("It is usable for tokenId's, which auction's have finished and minBid received if called by not approved owner it reverts safeTransferFrom()", async () => {
                await expect(
                    nftSoldItyInstance["safeTransferFrom(address,address,uint256)"](deployer.address, user.address, tokenId)
                ).to.be.revertedWith("TransferCallerNotOwnerNorApproved")
                await expect(nftSoldIty["safeTransferFrom(address,address,uint256)"](deployer.address, user.address, tokenId)).to.emit(
                    nftSoldIty,
                    "Transfer"
                )
            })
            it("It is usable for tokenId's, which auction's have finished and minBid received if called by not approved owner it reverts safeTransferFrom(_data)", async () => {
                await expect(
                    nftSoldItyInstance["safeTransferFrom(address,address,uint256,bytes)"](deployer.address, user.address, tokenId, user.address)
                ).to.be.revertedWith("TransferCallerNotOwnerNorApproved")
                await expect(
                    nftSoldIty["safeTransferFrom(address,address,uint256,bytes)"](deployer.address, user.address, tokenId, user.address)
                ).to.emit(nftSoldIty, "Transfer")
            })
        })
        describe("Functions not allowed to be used by owner for lower bidder", () => {
            beforeEach(async () => {
                user = accounts[3]
                const anotherBidder = accounts[4]
                nftSoldItyInstance = await nftSoldIty.connect(user)
                const nftSoldItyInstanceSecond = await nftSoldIty.connect(anotherBidder)
                await nftSoldIty.mintNFT("FirstTokenURI", auctionDuration)
                await nftSoldItyInstance.placeBid(0, { value: parseEther("0.1") })
                await nftSoldItyInstanceSecond.placeBid(0, { value: parseEther("0.2") })
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION + 119])
                await network.provider.send("evm_mine", [])

                tokenId = (await nftSoldIty.totalSupply()) - 1
            })
            it("It is not allowed to approve or transfer to other address than highest bidder", async () => {
                await expect(nftSoldIty.approve(user.address, tokenId)).to.be.revertedWith("NFTSoldIty__AddressIsNotHighestBidder")
                await expect(nftSoldIty.transferFrom(deployer.address, user.address, tokenId)).to.be.revertedWith(
                    "NFTSoldIty__AddressIsNotHighestBidder"
                )
                await expect(
                    nftSoldIty["safeTransferFrom(address,address,uint256,bytes)"](deployer.address, user.address, tokenId, user.address)
                ).to.be.revertedWith("NFTSoldIty__AddressIsNotHighestBidder")
                await expect(nftSoldIty["safeTransferFrom(address,address,uint256)"](deployer.address, user.address, tokenId)).to.be.revertedWith(
                    "NFTSoldIty__AddressIsNotHighestBidder"
                )
            })
        })
        describe("Functions not allowed to use: approve(), transferFrom(), safeTransferFrom(), safeTransferFrom()", () => {
            beforeEach(async () => {
                user = accounts[3]
                nftSoldItyInstance = await nftSoldIty.connect(user)
                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)
                await nftSoldItyInstance.placeBid(0, { value: parseEther("0.1") })
            })
            it("It is not allowed to use any of above functions for tokenId's for which bidding is still ongoing", async () => {
                // nftSoldItyInstance ------------------------------------------------------------------------------------------------------------------
                await expect(nftSoldItyInstance.approve(user.address, tokenId)).to.be.revertedWith("NFTSoldIty__AuctionStillOpenForThisNFT")
                await expect(nftSoldItyInstance.transferFrom(deployer.address, user.address, tokenId)).to.be.revertedWith(
                    "NFTSoldIty__AuctionStillOpenForThisNFT"
                )
                await expect(
                    nftSoldItyInstance["safeTransferFrom(address,address,uint256)"](deployer.address, user.address, tokenId)
                ).to.be.revertedWith("NFTSoldIty__AuctionStillOpenForThisNFT")
                await expect(
                    nftSoldItyInstance["safeTransferFrom(address,address,uint256,bytes)"](deployer.address, user.address, tokenId, user.address)
                ).to.be.revertedWith("NFTSoldIty__AuctionStillOpenForThisNFT")

                // nftSoldIty ------------------------------------------------------------------------------------------------------------------
                await expect(nftSoldIty.approve(user.address, tokenId)).to.be.revertedWith("NFTSoldIty__AuctionStillOpenForThisNFT")
                await expect(nftSoldIty.transferFrom(deployer.address, user.address, tokenId)).to.be.revertedWith(
                    "NFTSoldIty__AuctionStillOpenForThisNFT"
                )
                await expect(nftSoldIty["safeTransferFrom(address,address,uint256)"](deployer.address, user.address, tokenId)).to.be.revertedWith(
                    "NFTSoldIty__AuctionStillOpenForThisNFT"
                )
                await expect(
                    nftSoldIty["safeTransferFrom(address,address,uint256,bytes)"](deployer.address, user.address, tokenId, user.address)
                ).to.be.revertedWith("NFTSoldIty__AuctionStillOpenForThisNFT")
            })
        })
        describe("Set Approval For All Function", () => {
            it("It reverts once used", async () => {
                user = accounts[4]
                nftSoldItyInstance = await nftSoldIty.connect(user)
                await expect(nftSoldItyInstance.setApprovalForAll(user.address, true)).to.be.revertedWith("NFTSoldIty__FunctionDisabled")
                await expect(nftSoldIty.setApprovalForAll(user.address, true)).to.be.revertedWith("NFTSoldIty__FunctionDisabled")
            })
        })
        describe("Accept Bid", () => {
            beforeEach(async () => {
                tokenId = 0
                user = accounts[1]
                nftSoldItyInstance = await nftSoldIty.connect(user)
            })
            it("It is usable for only owner and tokenId's received bid and only if auction already finished and emits three confirmations", async () => {
                // Below is also included in this test
                // it("It approve's highest bidding address per tokenId to claim NFT and emit's (owner, approvedAddress, tokenId)")
                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)
                await nftSoldItyInstance.placeBid(0, { value: parseEther("0.1") })
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION + 119])
                await network.provider.send("evm_mine", [])

                await expect(nftSoldItyInstance.acceptBid(tokenId)).to.be.revertedWith("Ownable: caller is not the owner")
                await expect(
                    nftSoldItyInstance["safeTransferFrom(address,address,uint256)"](deployer.address, user.address, tokenId)
                ).to.be.revertedWith("TransferCallerNotOwnerNorApproved")

                const resTx = await nftSoldIty.acceptBid(tokenId)
                const recTx = await resTx.wait()

                const amount = recTx.events[0].args.amount // from withdrawMoney()
                const transfer = recTx.events[0].args.transfer // from withdrawMoney()
                const owner = recTx.events[1].args.owner // from approve()
                const approved = recTx.events[1].args.approved // from approve()
                tokenId = recTx.events[1].args.tokenId // from approve()
                const tokenBidAccepted = recTx.events[2].args.tokenId // from NFT_BidAccepted()

                console.log(
                    `Bid Accepted Amount: ${amount} Transfer: ${transfer} Owner: ${owner} Winner: ${approved} TokenId: ${tokenId} Bid Emit TokenId ${tokenBidAccepted}`
                )
                assert.equal(deployer.address, owner)
                await expect(resTx).to.emit(nftSoldIty, "NFT_BidAccepted")
                await expect(nftSoldItyInstance["safeTransferFrom(address,address,uint256)"](deployer.address, user.address, tokenId)).to.emit(
                    nftSoldIty,
                    "Transfer"
                )
            })
            it("It reverts if given tokenId doesn't exist", async () => {
                await expect(nftSoldIty.acceptBid(tokenId)).to.be.revertedWith("NFTSoldIty__NotExistingTokenId")
            })
            it("It reverts if auction not finished for given tokenId", async () => {
                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)
                await expect(nftSoldIty.acceptBid(tokenId)).to.be.revertedWith("NFTSoldIty__AuctionStillOpenForThisNFT")
            })
            it("It reverts if there was no bid received for given tokenId", async () => {
                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION])
                await network.provider.send("evm_mine", [])
                await expect(nftSoldIty.acceptBid(tokenId)).to.be.revertedWith("NFTSoldIty__NoBidReceivedForThisNFT")
            })
            it("It withdraw's money back to owner for each tokenId and emit's (bid, transfer)", async () => {
                let contractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                console.log(`Contract Starting Balance: ${contractBalance}`)

                assert.equal(contractBalance, 0)

                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)
                await nftSoldIty.mintNFT("Tokki", auctionDuration)
                const startingOwnerBalance = await ethers.provider.getBalance(deployer.address)
                let resTx = await nftSoldItyInstance.placeBid(0, { value: parseEther("7") })
                let recTx = await resTx.wait()
                const firstBid = recTx.events[1].args.amount

                contractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                assert.equal(contractBalance, firstBid.toString())

                resTx = await nftSoldItyInstance.placeBid(1, { value: parseEther("500") })
                recTx = await resTx.wait()
                const secondBid = recTx.events[1].args.amount
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION + 119])
                await network.provider.send("evm_mine", [])

                contractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                resTx = await nftSoldIty.acceptBid(0)
                recTx = await resTx.wait()
                let amount = recTx.events[0].args.amount
                let transfer = recTx.events[0].args.transfer
                let ownerBalance = await ethers.provider.getBalance(deployer.address)
                const afterBidAcceptContractBalance = await ethers.provider.getBalance(nftSoldIty.address)
                const { gasUsed, effectiveGasPrice } = recTx
                const gasCost = gasUsed.mul(effectiveGasPrice)

                console.log(
                    `First Bid: ${firstBid / 10 ** 18} ETH Contract Balance: ${contractBalance / 10 ** 18} ETH Owner Balance: ${ownerBalance / 10 ** 18} ETH`
                )

                assert.equal(transfer, true)
                assert.equal(firstBid.toString(), amount.toString())
                assert.equal(contractBalance, firstBid.add(secondBid).toString())
                assert.equal(afterBidAcceptContractBalance, secondBid.toString())
                assert.equal(ownerBalance.toString(), startingOwnerBalance.add(firstBid).sub(gasCost).toString())

                resTx = await nftSoldIty.acceptBid(1)
                recTx = await resTx.wait()
                amount = recTx.events[0].args.amount
                transfer = recTx.events[0].args.transfer
                ownerBalance = await ethers.provider.getBalance(deployer.address)
                contractBalance = await ethers.provider.getBalance(nftSoldIty.address)

                const newGasUsed = recTx.gasUsed
                const newEffectiveGasPrice = recTx.effectiveGasPrice
                const newGasCost = newGasUsed.mul(newEffectiveGasPrice)

                console.log(
                    `Second Bid Accepted: ${amount / 10 ** 18} ETH Contract Balance: ${contractBalance / 10 ** 18} ETH Owner Balance: ${ownerBalance / 10 ** 18
                    } ETH`
                )

                assert.equal(transfer, true)
                assert.equal(secondBid.toString(), amount.toString())
                assert.equal(contractBalance, 0)
                assert.equal(ownerBalance.toString(), startingOwnerBalance.add(firstBid).add(secondBid).sub(gasCost).sub(newGasCost).toString())
            })
        })
        describe("Renew Auction", () => {
            beforeEach(async () => {
                tokenId = 0
            })
            it("It is usable only for tokenId's for which auction already finished and without bid received and can be called by owner only", async () => {
                // Below is also included in this test
                // it("It renew and sets correct auction time for given tokenId and emit's (time, tokenId)"
                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION])
                await network.provider.send("evm_mine", [])

                let getTime = await nftSoldIty.getTime(tokenId)
                console.log(`Current Time Left: ${getTime}`)

                assert.equal(getTime, 0)

                const resTx = await nftSoldIty.renewAuction(tokenId)
                const recTx = await resTx.wait()
                const time = recTx.events[0].args.time
                tokenId = recTx.events[0].args.tokenId

                getTime = await nftSoldIty.getTime(tokenId)
                console.log(`Time Left After Renewal: ${getTime}`)

                assert.equal(getTime.toString(), time.toString())
                await expect(resTx).to.emit(nftSoldIty, "NFT_AuctionTimeUpdated")
            })
            it("It reverts if given tokenId doesn't exist", async () => {
                await expect(nftSoldIty.renewAuction(tokenId)).to.be.revertedWith("NFTSoldIty__NotExistingTokenId")
            })
            it("It reverts if auction not finished for given tokenId", async () => {
                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)
                await expect(nftSoldIty.renewAuction(tokenId)).to.be.revertedWith("NFTSoldIty__AuctionStillOpenForThisNFT")
            })
            it("It reverts if there was bid received for given tokenId", async () => {
                user = accounts[1]
                nftSoldItyInstance = await nftSoldIty.connect(user)
                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)

                await nftSoldItyInstance.placeBid(0, { value: parseEther("0.1") })
                await network.provider.send("evm_increaseTime", [AUCTION_DURATION + 119])
                await network.provider.send("evm_mine", [])

                await expect(nftSoldIty.renewAuction(tokenId)).to.be.revertedWith("NFTSoldIty__BidReceivedForThisNFT")
            })
        })
        describe("Getters", () => {
            beforeEach(async () => {
                tokenId = 0
            })
            it("It displays correct data", async () => {
                assert.equal(await nftSoldIty.getTime(tokenId), 0)

                await nftSoldIty.mintNFT("TokenURI_X", auctionDuration)

                await expect(nftSoldIty.getTime(tokenId)).to.not.reverted
            })
        })
    })