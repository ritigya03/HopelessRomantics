const express = require('express');
 const cors = require('cors');
 const fs = require('fs');
 const SpotifyWebApi = require('spotify-web-api-node');
 require('dotenv').config();
 
 const app = express();
 
 // Allow requests from the frontend
 app.use(cors({
   origin: 'http://localhost:5173',  // frontend URL
   methods: ['GET', 'POST'],
   credentials: true,
 }));
 
 app.use(express.json());
 
 const PORT = process.env.PORT || 5000;
 const TOKEN_FILE = 'tokens.json'; // Store tokens persistently
 
 // Initialize Spotify API with credentials
 const spotifyApi = new SpotifyWebApi({
     clientId: process.env.SPOTIFY_CLIENT_ID,
     clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
     redirectUri: process.env.SPOTIFY_REDIRECT_URI,
 });
 
 // Load stored tokens from file
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
 
 // Function to refresh access token
 async function refreshAccessToken() {
     try {
         if (!userTokens.refreshToken) {
             throw new Error("No refresh token available. Please log in again.");
         }
         console.log("🔄 Refreshing access token...");
 
         spotifyApi.setRefreshToken(userTokens.refreshToken);
         const data = await spotifyApi.refreshAccessToken();
 
         userTokens.accessToken = data.body.access_token;
         userTokens.expiresIn = data.body.expires_in;
         userTokens.timestamp = Date.now();
 
         console.log("✅ New Access Token:", userTokens.accessToken);
         spotifyApi.setAccessToken(userTokens.accessToken);
         saveTokens();
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
                 window.location = "http://localhost:3000"; // Redirect to frontend after 5s
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
         userTokens = {
             accessToken: data.body.access_token,
             refreshToken: data.body.refresh_token,
             expiresIn: data.body.expires_in,
             timestamp: Date.now(),
         };
         spotifyApi.setAccessToken(userTokens.accessToken);
         spotifyApi.setRefreshToken(userTokens.refreshToken);
         console.log("✅ Tokens received and stored.");
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
 
 // Refresh Token Endpoint (Manual Trigger)
 app.post('/api/refresh', async (req, res) => {
     try {
         const newAccessToken = await refreshAccessToken();
         res.json({ message: "✅ Access token refreshed!", accessToken: newAccessToken });
     } catch (error) {
         res.status(400).json({ error: error.message });
     }
 });
 
 // Fetch User Playlists
 app.get('/api/playlists', async (req, res) => {
     try {
         const accessToken = await ensureValidAccessToken();
         spotifyApi.setAccessToken(accessToken);
         const data = await spotifyApi.getUserPlaylists();
         res.json(data.body);
     } catch (error) {
         console.error("❌ Error fetching playlists:", error.message);
         res.status(400).json({ error: "Failed to fetch playlists" });
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


 