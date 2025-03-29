import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Playlists from "./components/Playlists";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = localStorage.getItem("token");

    if (!storedToken && hash) {
      const newToken = new URLSearchParams(hash.replace("#", "?")).get("access_token");
      window.location.hash = "";
      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken); // Update state immediately
      }
    }
  }, []);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <Router>
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
