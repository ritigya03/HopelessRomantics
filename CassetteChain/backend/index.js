const express = require('express');
const cors = require('cors');
const fs = require('fs');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();

// Allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const TOKEN_FILE = 'tokens.json';

// Initialize Spotify API with credentials
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Load stored tokens per user
function loadTokens() {
    if (fs.existsSync(TOKEN_FILE)) {
        return JSON.parse(fs.readFileSync(TOKEN_FILE));
    }
    return {};
}

let userTokens = loadTokens();

// Save tokens persistently per user
function saveTokens() {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(userTokens));
}

// Refresh Access Token per user
async function refreshAccessToken(userId) {
    try {
        if (!userTokens[userId] || !userTokens[userId].refreshToken) {
            throw new Error("No refresh token found. Please log in again.");
        }

        console.log(`🔄 Refreshing access token for user: ${userId}`);

        spotifyApi.setRefreshToken(userTokens[userId].refreshToken);
        const data = await spotifyApi.refreshAccessToken();

        userTokens[userId].accessToken = data.body.access_token;
        userTokens[userId].expiresIn = data.body.expires_in;
        userTokens[userId].timestamp = Date.now();

        console.log(`✅ New Access Token for ${userId}: ${userTokens[userId].accessToken}`);
        spotifyApi.setAccessToken(userTokens[userId].accessToken);
        saveTokens();
        return userTokens[userId].accessToken;
    } catch (error) {
        console.error(`❌ Error refreshing access token for ${userId}:`, error.message);
        throw new Error("Failed to refresh access token.");
    }
}

// Ensure Access Token is valid per user
async function ensureValidAccessToken(userId) {
    if (!userId || !userTokens[userId]) {
        throw new Error("User ID not found. Please log in again.");
    }

    const tokens = userTokens[userId];
    const expiresInMs = tokens.expiresIn * 1000;
    const tokenAge = Date.now() - tokens.timestamp;

    if (tokenAge >= expiresInMs) {
        console.log(`🔄 Token expired for ${userId}, refreshing...`);
        return await refreshAccessToken(userId);
    }

    return tokens.accessToken;
}

// LOGIN Route (To Get Authorization Code)
app.get('/login', (req, res) => {
    const scopes = [
        "user-read-private",
        "user-read-email",
        "playlist-read-private",
        "playlist-read-collaborative"
    ];
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}&scope=${scopes.join('%20')}&show_dialog=true`;
    res.redirect(authUrl);
});

// Handle Spotify Callback (Receive Authorization Code)
app.get('/callback', (req, res) => {
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
                window.location = "http://localhost:3000";
            }, 5000);
        </script>
    `);
});

// Exchange Code for Tokens
app.post('/api/login', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "Authorization code is required." });
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body.access_token;
        const refreshToken = data.body.refresh_token;
        const expiresIn = data.body.expires_in;

        // Get user's Spotify ID
        spotifyApi.setAccessToken(accessToken);
        const userData = await spotifyApi.getMe();
        const userId = userData.body.id;

        // Store tokens per user
        userTokens[userId] = {
            accessToken,
            refreshToken,
            expiresIn,
            timestamp: Date.now(),
        };

        spotifyApi.setRefreshToken(refreshToken);
        console.log(`✅ Tokens stored for user: ${userId}`);

        saveTokens();

        res.json({
            message: "✅ Tokens received!",
            accessToken,
            refreshToken,
            userId,
        });

    } catch (error) {
        console.error("❌ Spotify Login Error:", error.message);
        res.status(400).json({ error: "Failed to exchange authorization code for tokens" });
    }
});

// Refresh Token Endpoint (Manual Trigger)
app.post('/api/refresh', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
    }

    try {
        const newAccessToken = await refreshAccessToken(userId);
        res.json({ message: "✅ Access token refreshed!", accessToken: newAccessToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Fetch User Playlists
// Update this endpoint to handle POST
app.post('/api/playlists', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }
  
    try {
      spotifyApi.setAccessToken(token);
      const data = await spotifyApi.getUserPlaylists();
      res.json(data.body);
    } catch (error) {
      console.error("Playlist error:", error);
      res.status(401).json({ error: "Invalid or expired token" });
    }
  });

// Test Route
app.get('/', (req, res) => {
    res.send("CassetteChain Backend is Running! 🚀");
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
