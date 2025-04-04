// Alpine.js app
document.addEventListener("alpine:init", () => {
  Alpine.data("app", () => ({
    // State
    isScrolled: false,
    currentView: "home",
    featuredMovie: {},
    movieRows: [],
    currentMovie: {},
    myList: [],
    searchQuery: "",
    searchResults: [],
    videoSources: [],
    currentSourceIndex: 0,
    isLoading: true,
    hasError: false,
    copyrightYears: "",

    // Video Player State
    isFullscreen: false,
    isPlaying: true,
    isMuted: false,
    progress: 0,
    duration: 120,

    // Lifecycle
    async initialize() {
      // Set copyright years
      const currentYear = new Date().getFullYear()
      this.copyrightYears = `${currentYear}~${currentYear + 1}`

      // Handle scroll events for navbar
      window.addEventListener("scroll", () => {
        this.isScrolled = window.scrollY > 0
      })

      // Load my list from localStorage
      this.myList = JSON.parse(localStorage.getItem("myList") || "[]")

      // Handle routing
      this.handleRouting()

      // Add popstate event listener for browser navigation
      window.addEventListener("popstate", () => {
        this.handleRouting()
      })

      // Add fullscreen change listener
      document.addEventListener("fullscreenchange", () => {
        this.isFullscreen = !!document.fullscreenElement
      })
    },

    // API Calls
    async fetchMovies() {
      try {
        // Fetch Netflix originals for the banner
        const netflixResponse = await fetch("/api/tmdb/netflix-originals")
        const netflixData = await netflixResponse.json()

        if (netflixData.results && netflixData.results.length > 0) {
          this.featuredMovie = netflixData.results[Math.floor(Math.random() * netflixData.results.length)]
        }

        // Fetch different categories
        const [netflixOriginals, trending, topRated, actionMovies, comedyMovies, horrorMovies, romanceMovies, documentaries] =
          await Promise.all([
            fetch("/api/tmdb/netflix-originals").then((res) => res.json()),
            fetch("/api/tmdb/trending").then((res) => res.json()),
            fetch("/api/tmdb/top-rated").then((res) => res.json()),
            fetch("/api/tmdb/action").then((res) => res.json()),
            fetch("/api/tmdb/comedy").then((res) => res.json()),
            fetch("/api/tmdb/horror").then((res) => res.json()),
            fetch("/api/tmdb/romance").then((res) => res.json()),
            fetch("/api/tmdb/documentaries").then((res) => res.json()),
          ])

        this.movieRows = [
          { title: "Netflix Originals", movies: netflixOriginals.results || [] },
          { title: "Trending Now", movies: trending.results || [] },
          { title: "Top Rated", movies: topRated.results || [] },
          { title: "Action Movies", movies: actionMovies.results || [] },
          { title: "Comedy Movies", movies: comedyMovies.results || [] },
          { title: "Horror Movies", movies: horrorMovies.results || [] },
          { title: "Romance Movies", movies: romanceMovies.results || [] },
          { title: "Documentaries", movies: documentaries.results || [] },
        ]

        this.isLoading = false
      } catch (error) {
        console.error("Error fetching movies:", error)
        this.hasError = true
        this.isLoading = false
      }
    },

    // Video Player
    setupVideoSources(id, type) {
      // Multiple video sources to try
      this.videoSources = [
        `https://vidsrc.net/embed/${type}/${id}`,
        `https://vidsrc.to/embed/${type}/${id}`,
        `https://embed.vidsrc.pk/${type}/${id}`,
        `https://player.vidsrc.co/embed/${type}/${id}`,
        `https://vidsrc.cc/v2/embed/${type}/${id}`,
        `https://player.videasy.net/${type}/${id}`,
      ]
    },

    // Video Player Controls
    toggleFullscreen(container) {
      if (!this.isFullscreen) {
        if (container.requestFullscreen) {
          container.requestFullscreen()
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen()
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      }
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    },

    // Navigation and Routing
    navigateTo(path) {
      window.history.pushState({}, "", path)
      this.handleRouting()
    },

    handleRouting() {
      const path = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)

      if (path === "/" || path === "/index.html") {
        this.currentView = "home"
        this.fetchMovies()
      } else if (path.match(/\/watch\/\d+/)) {
        this.currentView = "watch"
        const segments = path.split("/").filter(Boolean)
        const id = segments[1]
        const type = searchParams.get("type") || "movie"
        this.setupVideoSources(id, type)
      } else if (path.match(/\/(movie|tv)\/\d+/)) {
        this.currentView = "detail"
        const segments = path.split("/").filter(Boolean)
        const type = segments[0]
        const id = segments[1]
        this.fetchMovieDetails(id, type)
      } else if (path === "/search") {
        this.currentView = "search"
        const query = searchParams.get("q")
        if (query) {
          this.searchQuery = query
          this.performSearch(query)
        }
      }
    },

    async fetchMovieDetails(id, type) {
      this.isLoading = true
      try {
        const response = await fetch(`/api/tmdb/details/${type}/${id}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch movie details: ${response.status}`)
        }
        this.currentMovie = await response.json()
        this.isLoading = false
      } catch (error) {
        console.error("Error fetching movie details:", error)
        this.hasError = true
        this.isLoading = false
      }
    },

    // Search functionality
    async performSearch(query) {
      this.isLoading = true
      try {
        const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`)
        }
        const data = await response.json()
        this.searchResults = data.results || []
        this.isLoading = false
      } catch (error) {
        console.error("Error searching:", error)
        this.hasError = true
        this.isLoading = false
      }
    },

    // User Actions
    search(query) {
      if (query.trim()) {
        this.navigateTo(`/search?q=${encodeURIComponent(query)}`)
      }
    },

    showMovieDetails(movie) {
      const type = movie.media_type || (movie.first_air_date ? "tv" : "movie")
      this.navigateTo(`/${type}/${movie.id}`)
    },

    watchMovie(movie) {
      const type = movie.media_type || (movie.first_air_date ? "tv" : "movie")
      this.navigateTo(`/watch/${movie.id}?type=${type}`)
    },

    toggleMyList(movie) {
      const index = this.myList.findIndex((m) => m.id === movie.id)

      if (index === -1) {
        this.myList.push(movie)
      } else {
        this.myList.splice(index, 1)
      }

      // Save to localStorage
      localStorage.setItem("myList", JSON.stringify(this.myList))
    },

    isInMyList(movie) {
      return this.myList.some((m) => m.id === movie.id)
    },
  }))
})