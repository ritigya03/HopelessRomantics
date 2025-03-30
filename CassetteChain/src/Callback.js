import { useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 
 const Callback = ({ setToken }) => {
   const navigate = useNavigate();
 
   useEffect(() => {
     const hash = window.location.hash;
     const storedToken = localStorage.getItem("token");
 
     if (!storedToken && hash) {
       // Extract the access token from the URL
       const newToken = new URLSearchParams(hash.replace("#", "?")).get("access_token");
       window.location.hash = ""; // Clear hash from URL
 
       if (newToken) {
         // Store token in localStorage
         localStorage.setItem("token", newToken);
         setToken(newToken);
         navigate("/playlists"); // Redirect to playlists page
       }
     }
   }, [navigate, setToken]);
 
   return null; // No UI is rendered for this component
 };
 
 export default Callback;