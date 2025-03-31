import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import playImg from "../assets/Screenshot 2025-03-31 143024.png";
import Card from "./Card"; // Import the Card component

const Playlists = ({ token, setToken }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch("http://localhost:5000/api/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.items) {
            setPlaylists(data.items);
          } else {
            setError("Invalid response from server.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setError("Failed to load playlists.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-8"
      style={{ backgroundImage: `url(${playImg})` }}
    >
      <button
        onClick={logout}
        className="mt-5 px-8 py-4 bg-pink-500 press-start text-lg text-white rounded-lg hover:bg-pink-600"
      >
        Logout
      </button>
      <h2 className="text-pink-900 mt-10 press-start text-3xl font-bold mb-6">
        Your Playlists
      </h2>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : loading ? (
        <p className="text-white">Loading playlists...</p>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mt-5">
          {playlists.map((playlist) => (
            <Card key={playlist.id} name={playlist.name} url={playlist.external_urls.spotify} image={playlist.images?.[0]?.url} />
          ))}
        </div>
      ) : (
        <p className="text-white">No playlists available.</p>
      )}
    </div>
  );
};

export default Playlists;
