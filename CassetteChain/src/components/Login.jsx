import { getSpotifyAuthURL } from "../utils/auth";
import { useState } from "react";
import bgImage from '../assets/Screenshot 2025-03-28 041639.png';
import logoImage from '../assets/Screenshot 2025-03-28 144631.png';

import "../index.css";

const Login = () => {
  const [hearts, setHearts] = useState([]);

  const handleLogin = () => {
    const buttonRect = document.getElementById("login-button")?.getBoundingClientRect();
    if (!buttonRect) return;

    const newHearts = Array.from({ length: 12 }).map((_, i) => {
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0, moveX = 0, moveY = 0;

      switch (side) {
        case 0: // Top
          x = Math.random() * 100;
          y = -20;
          moveX = (Math.random() - 0.5) * 500;
          moveY = -300;
          break;
        case 1: // Right
          x = 110;
          y = Math.random() * 100;
          moveX = 300;
          moveY = (Math.random() - 0.5) * 500;
          break;
        case 2: // Bottom
          x = Math.random() * 100;
          y = 110;
          moveX = (Math.random() - 0.5) * 500;
          moveY = 300;
          break;
        case 3: // Left
          x = -20;
          y = Math.random() * 100;
          moveX = -300;
          moveY = (Math.random() - 0.5) * 500;
          break;
      }

      return {
        id: i,
        x,
        y,
        moveX,
        moveY,
        delay: Math.random() * 0.3,
      };
    });

    setHearts(newHearts);
    setTimeout(() => setHearts([]), 2000);

    window.location.href = getSpotifyAuthURL();
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="flex flex-col items-center">
        {/* Logo placed just above the button */}
        <img src={logoImage} alt="Logo" className="w-[1000px] mt-[-150px] mb-10 h-[400px] " /> 
        <h1 className="text-xl text-center font-serif mt-5 press-start leading-loose w-[60%] text-pink-950">Mint & send personalized NFT mixtapes with secret messages for your special someone! 🎶</h1>
        <button
          id="login-button"
          onClick={handleLogin}
          className="relative px-10 mt-10 py-8 press-start text-white text-3xl font-semibold rounded-xl border-none transition-transform duration-100 ease-in 
          shadow-lg shadow-pink-900 bg-[#f55b93] 
           hover:bg-[#e60073] active:scale-90"
        >
          Connect with Spotify 🎵
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
        <div className="mt-6">
       
        </div>
      </div>
    </div>
  );
};

export default Login;
