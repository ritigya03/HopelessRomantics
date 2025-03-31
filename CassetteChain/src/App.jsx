import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Playlists from "./components/Playlists";
import MintForm from './components/MintForm';

const AuthHandler = ({ setToken }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = localStorage.getItem("token");

    if (!storedToken && hash) {
      const newToken = new URLSearchParams(hash.replace("#", "?")).get("access_token");
      window.location.hash = "";
      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        navigate("/playlists");
      }
    }
  }, [navigate, setToken]);

  return null;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  return (
    <Router>
      <AuthHandler setToken={setToken} />
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to="/playlists" />} />
        <Route
          path="/playlists"
          element={
            token ? <Playlists token={token} setToken={setToken} /> : <Navigate to="/" />
          }
        />
         <Route path="/mint-form" element={<MintForm />} />
      </Routes>
    </Router>
  );
};

export default App;
