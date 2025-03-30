import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthHandler = ({ setToken }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.replace("#", "?")).get("access_token");
      if (token) {
        // Store token in localStorage
        localStorage.setItem("spotify_token", token);
        setToken(token); // Optionally, set token in global state or context
        navigate("/playlists"); // Navigate to the playlists page
      }
    }
  }, [navigate, setToken]);

  return null; // No UI, just handling the authentication logic
};

export default AuthHandler;
