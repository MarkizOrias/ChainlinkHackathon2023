const { ethers, network } = require("hardhat")
const { developmentChains, motherContract } = require("../helper-hardhat-config")
const prompt = require("prompt-sync")()

let tokenURI = prompt("TokenURI of new NFT: ")

async function mintNFT() {
    const nftSoldIty = await ethers.getContractAt("NFTSoldIty", motherContract)

    console.log(`Working With NFTSoldIty Contract: ${nftSoldIty.address} Owner: ${await nftSoldIty.owner()}`)

    const responseTx = await nftSoldIty.mintNFT(tokenURI)
    const receiptTx = await responseTx.wait()
    const minter = receiptTx.events[1].args.minter
    const uri = receiptTx.events[2].args.uri
    const token = receiptTx.events[2].args.tokenId

    console.log(`NFT Minted!`)
    console.log(`Minter: ${minter}`)
    console.log(`TokenURI: ${uri} TokenId: ${token}`)
}

if (!developmentChains.includes(network.name)) {
    mintNFT()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
} else {
    console.log("This script is allowed only for Goerli, Sepolia or Mainnet")
}