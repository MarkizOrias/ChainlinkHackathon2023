const { ethers, network } = require("hardhat")
const { developmentChains, motherContract } = require("../../helper-hardhat-config")
const prompt = require("prompt-sync")()

let tokenId = prompt("TokenId: ")

async function transferNFT() {
    const nftSoldIty = await ethers.getContractAt("NFTSoldIty", motherContract)

    console.log(`Working With NFTSoldIty Contract: ${nftSoldIty.address} Owner: ${await nftSoldIty.owner()}`)

    console.log(`Working With NFTSoldIty Contract: ${nftSoldIty.address} As: ${deployer}`)

    const responseTx = await nftSoldIty["safeTransferFrom(address,address,uint256)"](
        "",
        "",
        tokenId
    )
    await responseTx.wait()

    console.log(`NFT With TokenId: ${tokenId} Has New Owner!`)
}

if (!developmentChains.includes(network.name)) {
    transferNFT()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
} else {
    console.log("This script is allowed only for Goerli, Sepolia or Mainnet")
}