const { ethers, network } = require("hardhat")
const { developmentChains, motherContract } = require("../helper-hardhat-config")
const prompt = require("prompt-sync")()

let tokenId = prompt("TokenId: ")

async function acceptBid() {
    const nftSoldIty = await ethers.getContractAt("NFTSoldIty", motherContract)

    console.log(`Working With NFTSoldIty Contract: ${nftSoldIty.address} Owner: ${await nftSoldIty.owner()}`)

    const responseTx = await nftSoldIty.acceptBid(tokenId)
    const receiptTx = await responseTx.wait()
    const amount = receiptTx.events[0].args.amount // from withdrawMoney()
    const transfer = receiptTx.events[0].args.transfer // from withdrawMoney()
    const owner = receiptTx.events[1].args.owner // from approve()
    const approved = receiptTx.events[1].args.approved // from approve()
    const token = receiptTx.events[2].args.tokenId // from NFT_BidAccepted()

    console.log(`NFT With TokenId: ${token} Bid Amount: ${amount} Accepted!`)
    console.log(`Bid Transfer Success: ${transfer}`)
    console.log(`Performing NFT Approval From: ${owner} ...`)
    console.log(`Auction Winner ${approved} Approved To Claim NFT!`)
}

if (!developmentChains.includes(network.name)) {
    acceptBid()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
} else {
    console.log("This script is allowed only for Goerli, Sepolia or Mainnet")
}