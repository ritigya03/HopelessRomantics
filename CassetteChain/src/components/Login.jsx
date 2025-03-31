import { getSpotifyAuthURL } from "../utils/auth";
import { useState } from "react";
import { ethers } from "ethers";
import bgImage from '../assets/Screenshot 2025-03-28 041639.png';
import logoImage from '../assets/Screenshot 2025-03-28 144631.png';
import "../index.css";

const Login = () => {
  const [hearts, setHearts] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);

  const handleLogin = () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    
    const buttonRect = document.getElementById("login-button")?.getBoundingClientRect();
    if (!buttonRect) return;

    const newHearts = Array.from({ length: 12 }).map((_, i) => {
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0, moveX = 0, moveY = 0;

      switch (side) {
        case 0: x = Math.random() * 100; y = -20; moveX = (Math.random() - 0.5) * 500; moveY = -300; break;
        case 1: x = 110; y = Math.random() * 100; moveX = 300; moveY = (Math.random() - 0.5) * 500; break;
        case 2: x = Math.random() * 100; y = 110; moveX = (Math.random() - 0.5) * 500; moveY = 300; break;
        case 3: x = -20; y = Math.random() * 100; moveX = -300; moveY = (Math.random() - 0.5) * 500; break;
      }
      return { id: i, x, y, moveX, moveY, delay: Math.random() * 0.3 };
    });

    setHearts(newHearts);
    setTimeout(() => setHearts([]), 2000);

    window.location.href = getSpotifyAuthURL();
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setWalletAddress(await signer.getAddress());
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="flex flex-col items-center">
        <img src={logoImage} alt="Logo" className="w-[800px] h:[0px] 2xl:w-[1000px] 2xl:mt-[-150px] mb-10 h-[400px]" />
        <h1 className="text-xl text-center font-serif mt-5 press-start leading-loose w-[60%] text-pink-950">
          Mint & send personalized NFT mixtapes with secret messages for your special someone! 🎶
        </h1>

        <button
          id="login-button"
          onClick={handleLogin}
          className="relative px-10 mt-10 py-8 press-start text-white text-3xl font-semibold rounded-xl border-none transition-transform duration-100 ease-in 
          shadow-lg shadow-pink-900 bg-[#f55b93] hover:bg-[#e60073] active:scale-90"
        >
          🎵✨ All Playlists 💖🎧 
          {hearts.map((heart) => (
            <span
              key={heart.id}
              className="heart"
              style={{
                left: `${heart.x}%`,
                top: `${heart.y}%`,
                "--moveX": `${heart.moveX}px`,
                "--moveY": `${heart.moveY}px`,
                animationDelay: `${heart.delay}s`,
              }}
            >
              🩷
            </span>
          ))}
        </button>

        <button
          onClick={connectWallet}
          className="px-6 py-4 mt-10 press-start bg-pink-600 text-white text-md rounded-xl shadow-md hover:bg-pink-700 transition"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Login;
