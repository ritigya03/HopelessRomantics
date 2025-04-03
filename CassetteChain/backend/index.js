const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { ethers } = require("ethers");
const pinataSDK = require("@pinata/sdk");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

// Initialize the app
const app = express();

// Allow requests from the frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;
const TOKEN_FILE = "tokens.json";

// Ensure environment variables are set
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REDIRECT_URI) {
  console.error("❌ Missing Spotify API credentials.");
  process.exit(1);
}

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Initialize Pinata
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET);

// Ethereum provider & wallet setup
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
  console.error("❌ Missing blockchain environment variables.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const CONTRACT_ABI = require("./MixtapeNFT.json").abi;
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Load stored tokens
function loadTokens() {
  if (fs.existsSync(TOKEN_FILE)) {
    return JSON.parse(fs.readFileSync(TOKEN_FILE));
  }
  return { accessToken: null, refreshToken: null, expiresIn: 3600, timestamp: null };
}
let userTokens = loadTokens();

// Save tokens persistently
function saveTokens() {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(userTokens));
}

// Refresh Spotify Access Token
async function refreshAccessToken() {
  try {
    if (!userTokens.refreshToken) {
      throw new Error("No refresh token available.");
    }

    console.log("🔄 Refreshing Spotify access token...");
    spotifyApi.setRefreshToken(userTokens.refreshToken);
    const data = await spotifyApi.refreshAccessToken();

    userTokens.accessToken = data.body.access_token;
    userTokens.expiresIn = data.body.expires_in;
    userTokens.timestamp = Date.now();

    spotifyApi.setAccessToken(userTokens.accessToken);
    saveTokens();

    console.log("✅ New Spotify Access Token:", userTokens.accessToken);
    return userTokens.accessToken;
  } catch (error) {
    console.error("❌ Error refreshing access token:", error.message);
    throw new Error("Failed to refresh access token.");
  }
}

// Ensure Access Token is valid
async function ensureValidAccessToken() {
  if (!userTokens.accessToken || !userTokens.refreshToken) {
    throw new Error("No valid tokens found. Please log in again.");
  }

  const expiresInMs = userTokens.expiresIn * 1000;
  const tokenAge = Date.now() - userTokens.timestamp;

  if (tokenAge >= expiresInMs) {
    console.log("🔄 Access token expired. Refreshing...");
    return await refreshAccessToken();
  }

  return userTokens.accessToken;
}

// 🔐 Spotify Authentication Routes
app.get("/login", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
  ];
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    process.env.SPOTIFY_REDIRECT_URI
  )}&scope=${scopes.join("%20")}&show_dialog=true`;

  res.redirect(authUrl);
});

// Handle Spotify Callback
app.get("/callback", (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }
  res.send(`
    <h1>✅ Authentication Successful!</h1>
    <p>Copy the code below and use it in the API request:</p>
    <pre>${code}</pre>
    <script>
      setTimeout(() => {
        window.location = "http://localhost:3000"; // Redirect to frontend after 5s
      }, 5000);
    </script>
  `);
});

// Exchange Code for Tokens
app.post("/api/login", async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Authorization code is required." });
  }
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    userTokens = {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
      timestamp: Date.now(),
    };

    spotifyApi.setAccessToken(userTokens.accessToken);
    spotifyApi.setRefreshToken(userTokens.refreshToken);
    saveTokens();

    res.json({
      message: "✅ Tokens received!",
      accessToken: userTokens.accessToken,
      refreshToken: userTokens.refreshToken,
    });
  } catch (error) {
    console.error("❌ Spotify Login Error:", error.message);
    res.status(400).json({ error: "Failed to exchange authorization code for tokens" });
  }
});

// Fetch User Playlists
app.get("/api/playlists", async (req, res) => {
  try {
    const accessToken = await ensureValidAccessToken();
    spotifyApi.setAccessToken(accessToken);
    const playlistsData = await spotifyApi.getUserPlaylists();
    res.json({ items: playlistsData.body.items });
  } catch (error) {
    console.error("❌ Error fetching playlists:", error.message);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// 🎵 Upload Playlist & Mint NFT on Blockchain
async function mintNFT(recipient, tokenURI) {
  try {
    console.log(`⏳ Minting NFT for ${recipient} with metadata: ${tokenURI}`);
    const tx = await contract.mintMixtape(recipient, tokenURI);
    const receipt = await tx.wait();
    console.log(`✅ NFT Minted! Tx Hash: ${receipt.transactionHash}`);
    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ Minting Error:", error.message);
    throw new Error("NFT Minting Failed.");
  }
}

app.post("/upload-mint", async (req, res) => {
  try {
    const { playlistName, playlistURL, secretMessage, recipient } = req.body;
    if (!playlistName || !playlistURL || !secretMessage || !recipient) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const metadata = {
      name: playlistName,
      description: secretMessage,
      external_url: playlistURL,
    };

    const result = await pinata.pinJSONToIPFS(metadata);
    const txHash = await mintNFT(recipient, `ipfs://${result.IpfsHash}`);

    res.json({ success: true, ipfsHash: result.IpfsHash, transactionHash: txHash });
  } catch (error) {
    res.status(500).json({ error: "Failed to process upload-mint request" });
  }
});

// 🌍 Test Route
app.get("/", (req, res) => {
  res.send("CassetteChain Backend is Running! 🚀");
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
