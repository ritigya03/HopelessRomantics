import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Playlists from "./components/Playlists";
import { getSpotifyAuthURL } from "./utils/auth";

const App = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
      storedToken = new URLSearchParams(hash.replace("#", "?")).get("access_token");
      window.location.hash = "";
      if (storedToken) {
        window.localStorage.setItem("token", storedToken);
        setToken(storedToken);
      }
    } else {
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  return (
    <Router>
      <div className="">
        
        <Routes>
          <Route
            path="/"
            element={!token ? <Login /> : <Navigate to="/playlists" />}
          />
          <Route
            path="/playlists"
            element={token ? (
              <>
                <button
                  onClick={logout}
                  className="mb-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
                <Playlists token={token} />
              </>
            ) : (
              <Navigate to="/" />
            )}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
