const express = require("express")
const path = require("path")
const dotenv = require("dotenv")
const cors = require("cors")
const compression = require("compression")
const fetch = require("node-fetch")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(compression())
app.use(express.static("public"))

// API routes for TMDB
app.get("/api/tmdb/netflix-originals", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/discover/tv?with_networks=213")
    res.json(data)
  } catch (error) {
    console.error("Error fetching Netflix originals:", error)
    res.status(500).json({ error: "Failed to fetch Netflix originals" })
  }
})

app.get("/api/tmdb/trending", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/trending/all/week")
    res.json(data)
  } catch (error) {
    console.error("Error fetching trending:", error)
    res.status(500).json({ error: "Failed to fetch trending content" })
  }
})

app.get("/api/tmdb/top-rated", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/movie/top_rated")
    res.json(data)
  } catch (error) {
    console.error("Error fetching top rated:", error)
    res.status(500).json({ error: "Failed to fetch top rated content" })
  }
})

// TV Shows endpoints
app.get("/api/tmdb/tv/popular", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/tv/popular")
    res.json(data)
  } catch (error) {
    console.error("Error fetching popular TV shows:", error)
    res.status(500).json({ error: "Failed to fetch popular TV shows" })
  }
})

app.get("/api/tmdb/tv/top-rated", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/tv/top_rated")
    res.json(data)
  } catch (error) {
    console.error("Error fetching top rated TV shows:", error)
    res.status(500).json({ error: "Failed to fetch top rated TV shows" })
  }
})

app.get("/api/tmdb/tv/airing-today", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/tv/airing_today")
    res.json(data)
  } catch (error) {
    console.error("Error fetching airing today:", error)
    res.status(500).json({ error: "Failed to fetch airing today" })
  }
})

// Movies endpoints
app.get("/api/tmdb/movies/popular", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/movie/popular")
    res.json(data)
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    res.status(500).json({ error: "Failed to fetch popular movies" })
  }
})

app.get("/api/tmdb/movies/top-rated", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/movie/top_rated")
    res.json(data)
  } catch (error) {
    console.error("Error fetching top rated movies:", error)
    res.status(500).json({ error: "Failed to fetch top rated movies" })
  }
})

app.get("/api/tmdb/movies/upcoming", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/movie/upcoming")
    res.json(data)
  } catch (error) {
    console.error("Error fetching upcoming movies:", error)
    res.status(500).json({ error: "Failed to fetch upcoming movies" })
  }
})

app.get("/api/tmdb/movies/now-playing", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/movie/now_playing")
    res.json(data)
  } catch (error) {
    console.error("Error fetching now playing movies:", error)
    res.status(500).json({ error: "Failed to fetch now playing movies" })
  }
})

app.get("/api/tmdb/action", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/discover/movie?with_genres=28")
    res.json(data)
  } catch (error) {
    console.error("Error fetching action movies:", error)
    res.status(500).json({ error: "Failed to fetch action movies" })
  }
})

app.get("/api/tmdb/comedy", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/discover/movie?with_genres=35")
    res.json(data)
  } catch (error) {
    console.error("Error fetching comedy movies:", error)
    res.status(500).json({ error: "Failed to fetch comedy movies" })
  }
})

app.get("/api/tmdb/horror", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/discover/movie?with_genres=27")
    res.json(data)
  } catch (error) {
    console.error("Error fetching horror movies:", error)
    res.status(500).json({ error: "Failed to fetch horror movies" })
  }
})

app.get("/api/tmdb/romance", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/discover/movie?with_genres=10749")
    res.json(data)
  } catch (error) {
    console.error("Error fetching romance movies:", error)
    res.status(500).json({ error: "Failed to fetch romance movies" })
  }
})

app.get("/api/tmdb/documentaries", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/discover/movie?with_genres=99")
    res.json(data)
  } catch (error) {
    console.error("Error fetching documentaries:", error)
    res.status(500).json({ error: "Failed to fetch documentaries" })
  }
})

// New endpoint for movie/TV show details
app.get("/api/tmdb/details/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params
    const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=videos,similar,credits`)
    res.json(data)
  } catch (error) {
    console.error("Error fetching details:", error)
    res.status(500).json({ error: "Failed to fetch details" })
  }
})

// Search endpoint
app.get("/api/tmdb/search", async (req, res) => {
  try {
    const query = req.query.q
    const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`)
    res.json(data)
  } catch (error) {
    console.error("Error searching:", error)
    res.status(500).json({ error: "Failed to search" })
  }
})

// Helper function to make API requests
async function fetchFromTMDB(endpoint) {
  const API_KEY = process.env.TMDB_API_KEY
  const BASE_URL = "https://api.themoviedb.org/3"
  
  const url = `${BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${API_KEY}&language=en-US`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

// Serve the main HTML file for all routes (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})