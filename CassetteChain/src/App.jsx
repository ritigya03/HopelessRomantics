import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Playlists from "./components/Playlists";

const AuthHandler = ({ setAuthData }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const storedAuth = JSON.parse(localStorage.getItem("spotifyAuth"));

    if (!storedAuth && hash) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      const expiresIn = params.get("expires_in");
      
      if (accessToken) {
        const authData = {
          token: accessToken,
          expiresAt: Date.now() + expiresIn * 1000
        };
        
        localStorage.setItem("spotifyAuth", JSON.stringify(authData));
        setAuthData(authData);
        navigate("/playlists");
      }
    }
  }, [navigate, setAuthData]);

  return null;
};

const App = () => {
  const [authData, setAuthData] = useState(
    JSON.parse(localStorage.getItem("spotifyAuth")) || null
  );

  const logout = () => {
    localStorage.removeItem("spotifyAuth");
    setAuthData(null);
    window.location.href = "/"; // Full reset
  };

  return (
    <Router>
      <AuthHandler setAuthData={setAuthData} />
      <Routes>
        <Route 
          path="/" 
          element={!authData ? <Login /> : <Navigate to="/playlists" replace />} 
        />
        <Route
          path="/playlists"
          element={
            authData ? (
              <div className="flex flex-col items-center min-h-screen p-4">
                <button
                  onClick={logout}
                  className="mb-4 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Logout
                </button>
                <Playlists />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;