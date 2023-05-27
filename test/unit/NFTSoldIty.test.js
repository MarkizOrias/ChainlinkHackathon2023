// Tests in progress...
const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFTSoldIty NFT Unit Tests", function () {
        let NFTSoldIty, NFTSoldItyInstanceExternal, deployer, user

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["NFTSoldItyy"])
            NFTSoldItyy = await ethers.getContract("NFTSoldItyy")
        })

        describe("Constructor", () => {
            it("Initializes the NFT Correctly.", async () => {
                const owner = await NFTSoldIty.owner()
                const name = await NFTSoldIty.name()
                const symbol = await NFTSoldIty.symbol()
                const tokenCounter = await NFTSoldIty.getTokenCounter()

                assert.equal(name, "NFTSoldIty")
                assert.equal(symbol, "AIN")
                assert.equal(tokenCounter.toString(), "0")
            })
        })

        describe("Mint NFT", () => {
            beforeEach(async () => {
                const txResponse = await NFTSoldIty.mintNFT("tokenURI", "nftTitle")
                await txResponse.wait(1)
            })
            it("Allows owner to mint an NFT", async function () {
                const tokenCounter = await NFTSoldIty.getTokenCounter()
                assert.equal(tokenCounter.toString(), "1")
            })
            it("Not allows accounts other than owner minting NFT", async function () {
                const maliciousAccount = accounts[2]
                // In order to use above account we have to first connect it to our mother contract instance
                const NFTSoldItyExternal = await NFTSoldIty
                y.connect(maliciousAccount)

                await expect(NFTSoldItyExternal.mintNFT("tokenURI", "nftTitle")).to.be.revertedWith("Ownable: caller is not the owner")
            })
            it("Show the correct owner and balance of NFT's", async function () {
                const deployerAddress = deployer.address
                const deployerBalance = await NFTSoldIty
                y.balanceOf(deployerAddress)
                const owner = await NFTSoldIty
                y.ownerOf("0")

                // Second Mint
                await NFTSoldIty.mintNFT("tokenURI2", "nftTitle2")
                const secBalance = await NFTSoldIty.balanceOf(deployerAddress)
                const secOwner = await NFTSoldIty.ownerOf("1")

                assert.equal(deployerBalance.toString(), "1")
                assert.equal(owner, deployerAddress)
                assert.equal(secBalance.toString(), "2")
                assert.equal(secOwner, deployerAddress)
                await expect(NFTSoldIty.ownerOf("2")).to.be.revertedWith("ERC721: invalid token ID")
            })
        })
        describe("Place Bid", () => {
            beforeEach(async () => {
                const txResponse = await NFTSoldIty.mintNFT("tokenURI", "nftTitle")
                await txResponse.wait(1)
            })
        })
    })