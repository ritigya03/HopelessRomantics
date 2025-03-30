import { useEffect, useState } from "react";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("spotifyAuth"));
        
        if (!authData?.token) {
          throw new Error("No authentication data found");
        }

        // Check if token expired
        if (Date.now() > authData.expiresAt) {
          throw new Error("Token expired");
        }

        const response = await fetch("http://localhost:5000/api/playlists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authData.token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch playlists");
        }

        const data = await response.json();
        setPlaylists(data.items || []);
      } catch (err) {
        console.error("Playlist error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) return <div>Loading playlists...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map(playlist => (
          <div key={playlist.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{playlist.name}</h3>
            <p className="text-sm text-gray-600">{playlist.tracks.total} tracks</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;