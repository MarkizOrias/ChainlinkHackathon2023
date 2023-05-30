const { ethers, network } = require("hardhat")
const { developmentChains, motherContract } = require("../helper-hardhat-config")
const prompt = require("prompt-sync")()

let tokenId = prompt("TokenId: ")

async function withdrawMoney() {
    const nftSoldIty = await ethers.getContractAt("NFTSoldIty", motherContract)

    console.log(`Working With NFTSoldIty Contract: ${nftSoldIty.address} Owner: ${await nftSoldIty.owner()}`)

    const responseTx = await nftSoldIty.withdrawMoney(tokenId)
    const receiptTx = await responseTx.wait()
    const bid = receiptTx.events[0].args.amount
    const transfer = receiptTx.events[0].args.transfer

    console.log(`Money Withdrawal For TokenId: ${tokenId} Success!`)
    console.log(`Amount Received: ${bid} Transfer Status: ${transfer}`)
}

if (!developmentChains.includes(network.name)) {
    withdrawMoney()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
} else {
    console.log("This script is allowed only for Goerli, Sepolia or Mainnet")
}