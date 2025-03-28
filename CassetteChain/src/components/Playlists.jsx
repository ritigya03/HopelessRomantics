import { useState, useEffect } from "react";
import axios from "axios";

const Playlists = ({ token }) => {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchPlaylists = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlaylists(data.items);
      } catch (error) {
        setError("Error fetching playlists. Please try again.");
        console.error("Error fetching playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [token]);

  const fetchTracks = async (playlistId, playlistName) => {
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTracks(data.items);
      setSelectedPlaylist(playlistName);
    } catch (error) {
      setError("Error fetching tracks. Please try again.");
      console.error("Error fetching tracks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Your Playlists</h2>

      {loading && <p className="text-yellow-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg text-center"
            onClick={() => fetchTracks(playlist.id, playlist.name)}
          >
            {playlist.name}
          </button>
        ))}
      </div>

      {selectedPlaylist && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3 text-white">
            Tracks from {selectedPlaylist}
          </h3>

          <div className="space-y-4">
            {tracks.map((track, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
              >
                <img
                  src={track.track.album.images[0]?.url}
                  alt="Album Cover"
                  className="w-16 h-16 rounded-lg"
                />
                <div>
                  <p className="text-lg font-semibold text-white">
                    {track.track.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {track.track.artists[0].name}
                  </p>

                  {track.track.preview_url ? (
                    <audio controls className="mt-2 w-full">
                      <source src={track.track.preview_url} type="audio/mpeg" />
                    </audio>
                  ) : (
                    <p className="text-red-400 text-sm mt-2">
                      No preview available
                    </p>
                  )}

                  <a
                    href={track.track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 mt-2 inline-block hover:underline"
                  >
                    Listen on Spotify 🎵
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
