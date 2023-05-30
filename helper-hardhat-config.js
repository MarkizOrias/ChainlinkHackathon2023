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

// Goerli
const motherContract = ""

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"
const AUCTION_DURATION = 30

const uploadedImagesURIs = "../CHAINLINKHACKATHON2023/utils/uploadedURIs/uploadedImagesURIs.txt"
const uploadedMetadataURIs = "../CHAINLINKHACKATHON2023/utils/uploadedURIs/uploadedMetadataURIs.txt"

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
    AUCTION_DURATION,
    uploadedImagesURIs,
    uploadedMetadataURIs,
    motherContract,
}