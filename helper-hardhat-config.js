const networkConfig = {
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
    },
    11155111: {
        name: "sepolia",
    },
    1: {
        name: "mainnet",
    },
}

const motherContract = "0xB32e471307CFeC41db919Df3160cFDEd28f02F9f"

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"
const AUCTION_DURATION = 30
const INTERVAL = "60"
const CHAINLINK_KEEPER = "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2"

const uploadedImagesURIs = "../ChainlinkHackathon2023/utils/uploadedURIs/uploadedImagesURIs.txt"
const uploadedMetadataURIs = "../ChainlinkHackathon2023/utils/uploadedURIs/uploadedMetadataURIs.txt"

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
    AUCTION_DURATION,
    CHAINLINK_KEEPER,
    INTERVAL,
    uploadedImagesURIs,
    uploadedMetadataURIs,
    motherContract,
}