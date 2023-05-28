const { ethers, network } = require("hardhat")
const { developmentChains, motherContract } = require("../../helper-hardhat-config")
const prompt = require("prompt-sync")()

let tokenId = prompt("TokenId: ")

async function getTime() {
    const nftSoldIty = await ethers.getContractAt("NFTSoldIty", motherContract)

    console.log(`Working With NFTSoldIty Contract: ${nftSoldIty.address} As: ${await nftSoldIty.owner()}`)

    const time = await nftSoldIty.getTime(tokenId)

    console.log(`NFT With TokenId: ${tokenId} Auction Time Left: ${time}`)

    return time
}

if (!developmentChains.includes(network.name)) {
    getTime()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
} else {
    console.log("This script is allowed only for Goerli, Sepolia or Mainnet")
}