"use client"

import { useEffect, useState } from "react"
import SpotifyLogin from "@/components/spotify-login"
import PlaylistGrid from "@/components/playlist-grid"

export default function Home() {
  const [token, setToken] = useState("")
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if there's a token in the URL (after Spotify redirect)
    const hash = window.location.hash
    if (hash) {
      const token = hash
        .substring(1)
        .split("&")
        .find(elem => elem.startsWith("access_token"))
        ?.split("=")[1]

      if (token) {
        setToken(token)
        window.location.hash = ""
        localStorage.setItem("spotify_token", token)
      }
    } else {
      // Check if token exists in localStorage
      const storedToken = localStorage.getItem("spotify_token")
      if (storedToken) {
        setToken(storedToken)
      }
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchPlaylists()
    }
  }, [token])

  const fetchPlaylists = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          localStorage.removeItem("spotify_token")
          setToken("")
          setError("Session expired. Please login again.")
        } else {
          throw new Error("Failed to fetch playlists")
        }
      } else {
        const data = await response.json()
        setPlaylists(data.items)
      }
    } catch (err) {
      setError("Error fetching playlists. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("spotify_token")
    setToken("")
    setPlaylists([])
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-500">Spotify Clone</h1>
          {token && (
            <button 
              onClick={logout}
              className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition"
            >
              Logout
            </button>
          )}
        </header>

        {!token ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <h2 className="text-2xl mb-8">Connect with Spotify to see your playlists</h2>
            <SpotifyLogin />
          </div>
        ) : (
          <div>
            {error && <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>}
            {loading ? (
              <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <PlaylistGrid playlists={playlists} />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
