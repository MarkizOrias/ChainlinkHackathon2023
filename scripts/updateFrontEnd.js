const { ethers } = require("hardhat")
const { developmentChains, motherContract } = require("../helper-hardhat-config")
const frontEndContractsFile = "../no-patrick-code/constants/networkMapping.json"
const frontEndAbiLocation = "../no-patrick-code/constants/"
const fs = require("fs")

async function updateFrontEnd() {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")
        await updateContractAddresses()
        await updateAbi()
    }
}

async function updateAbi() {
    const nftSoldIty = await ethers.getContract("NFTSoldIty")
    fs.writeFileSync(`${frontEndAbiLocation}NFTSoldIty.json`, nftSoldIty.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const nftSoldIty = await ethers.getContractAt("NFTSoldIty", motherContract)
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NFTSoldIty"].includes(nftSoldIty.address)) {
            contractAddresses[chainId]["NFTSoldIty"].push(nftSoldIty.address)
        }
    } else {
        contractAddresses[chainId] = { NFTSoldIty: [nftSoldIty.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

if (!developmentChains.includes(network.name)) {
    updateFrontEnd()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
} else {
    console.log("This script is allowed only for Goerli, Sepolia or Mainnet")
}