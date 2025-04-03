require('dotenv').config();
// const { fetchPlaylistData } = require('./spotifyAPI'); // Import Spotify API
const { uploadPlaylistMetadata } = require('./uploadToPinata'); // Import Pinata upload function
const PinataSDK = require('@pinata/sdk'); // Pinata SDK
const fs = require('fs');

// Initialize Pinata SDK
const pinata = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET);

// Mint an NFT using the Pinata metadata
async function mintMixtapeNFT(playlistId, secretMessage) {
    try {
        // Step 1: Fetch Playlist Data from Spotify
        const playlistData = await fetchPlaylistData(playlistId);
        console.log('Fetched Playlist Data:', playlistData);

        // Step 2: Prepare Metadata for Pinata
        const metadata = {
            name: playlistData.name,  // Use dynamic playlist name from Spotify
            description: playlistData.description || "A special mixtape stored on IPFS",
            image: playlistData.images[0]?.url || "ipfs://your_default_image_hash", // Fallback image
            attributes: [
                { trait_type: "Playlist URL", value: playlistData.external_urls.spotify },
                { trait_type: "Secret Message", value: secretMessage || "No secret message provided" }
            ]
        };

        // Step 3: Upload Metadata to Pinata
        const tokenURI = await uploadPlaylistMetadata(metadata);
        console.log('Metadata uploaded to IPFS:', tokenURI);

        // Step 4: Mint the NFT (replace with actual minting logic if needed)
        console.log("🎉 NFT Minted with Token URI:", tokenURI);

        return tokenURI;  // Return the token URI after minting

    } catch (error) {
        console.error('Error during the minting process:', error);
        throw error;
    }
}

// Fetch user's playlists from Spotify
async function fetchUserPlaylists() {
    try {
        // Fetch playlists of the authenticated user
        const playlists = await fetchPlaylistsForUser();
        return playlists;  // Return the list of playlists
    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
}

// Example usage: Replace the playlistId with an actual fetched playlist ID
async function run() {
    const playlists = await fetchUserPlaylists(); // Fetch playlists
    if (playlists && playlists.length > 0) {
        // Let's pick the first playlist as an example (you can adjust this logic as needed)
        const playlistId = playlists[0].id;
        const secretMessage = `This playlist is special! 🎶`;  // Dynamically generate or get the secret message
        
        // Mint NFT for the fetched playlist
        await mintMixtapeNFT(playlistId, secretMessage);
    } else {
        console.log("No playlists found.");
    }
}

run();  // Call the run function to execute
