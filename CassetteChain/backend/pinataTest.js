// uploadToPinata.js
const PinataSDK = require('@pinata/sdk');
require('dotenv').config();

const pinata = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET); // Use 'new' keyword

// Test Pinata connection
async function testPinataConnection() {
    try {
        const result = await pinata.testAuthentication();
        console.log("✅ Pinata Connected Successfully:", result);
    } catch (err) {
        console.error("❌ Pinata Connection Failed:", err);
        throw new Error("Pinata connection failed.");
    }
}

// Upload metadata to Pinata (IPFS)
async function uploadPlaylistMetadata(metadata) {
    try {
        // First test the connection to Pinata
        await testPinataConnection();

        const result = await pinata.pinJSONToIPFS(metadata);
        console.log('Metadata uploaded to IPFS:', result);
        return result.IpfsHash; // Returning the IPFS hash
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
}

module.exports = { uploadPlaylistMetadata };
