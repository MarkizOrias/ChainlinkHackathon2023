const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains, INTERVAL, CHAINLINK_KEEPER } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------------------")
    arguments = [INTERVAL, CHAINLINK_KEEPER]
    const nftSoldIty = await deploy("NFTSoldIty", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify Contract
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(nftSoldIty.address, arguments)
    }
}

module.exports.tags = ["all", "NFTSoldIty"]