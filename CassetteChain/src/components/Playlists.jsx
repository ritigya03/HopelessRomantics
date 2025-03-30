import { useEffect, useState } from "react";

const Playlists = ({ token }) => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      // Fetch playlists from your backend
      fetch("http://localhost:5000/api/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setPlaylists(data.items); // Assuming 'items' contains the playlist array
        })
        .catch((error) => {
          console.error("Error:", error);
          setError("Failed to load playlists.");
        });
    }
  }, [token]);

  return (
    <div>
      <h2>Your Playlists</h2>
      {error && <p>{error}</p>}
      <ul>
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <li key={playlist.id}>
              <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                {playlist.name}
              </a>
            </li>
          ))
        ) : (
          <p>No playlists available.</p>
        )}
      </ul>
    </div>
  );
};

export default Playlists;
