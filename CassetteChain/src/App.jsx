import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Playlists from "./components/Playlists";

const AuthHandler = ({ setToken }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = localStorage.getItem("token");

    if (!storedToken && hash) {
      const newToken = new URLSearchParams(hash.replace("#", "?")).get("access_token");
      window.location.hash = ""; // Clear hash from URL
      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        navigate("/playlists"); // Redirect to playlists
      }
    }
  }, [navigate, setToken]);

  return null; // This component doesn't render anything
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <AuthHandler setToken={setToken} />
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to="/playlists" />} />
        <Route
          path="/playlists"
          element={
            token ? (
              <div className="flex flex-col items-center">
                <button
                  onClick={logout}
                  className="mb-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
                <Playlists token={token} />
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
