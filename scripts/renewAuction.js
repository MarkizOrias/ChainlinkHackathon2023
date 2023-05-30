const { ethers, network } = require("hardhat")
const { developmentChains, motherContract } = require("../helper-hardhat-config")
const prompt = require("prompt-sync")()

let tokenId = prompt("TokenId: ")

async function renewAuction() {
    const nftSoldIty = await ethers.getContractAt("NFTSoldIty", motherContract)

    console.log(`Working With NFTSoldIty Contract: ${nftSoldIty.address} Owner: ${await nftSoldIty.owner()}`)

    const responseTx = await nftSoldIty.renewAuction(tokenId)
    const receiptTx = await responseTx.wait()
    const time = receiptTx.events[0].args.time
    const token = receiptTx.events[0].args.tokenId

    console.log(`NFT Auction Time Renewed!`)
    console.log(`NFT With TokenId: ${token} Auction Time Left: ${time}`)
}

if (!developmentChains.includes(network.name)) {
    renewAuction()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
} else {
    console.log("This script is allowed only for Goerli, Sepolia or Mainnet")
}