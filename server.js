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