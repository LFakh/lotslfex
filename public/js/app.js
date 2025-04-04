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
    currentVideoUrl: "",
    videoSources: [],
    currentSourceIndex: 0,
    isLoading: true,
    hasError: false,
    copyrightYears: "",

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
    setupVideoPlayer(id, type) {
      // Multiple video sources to try
      this.videoSources = [
        `https://vidsrc.xyz/embed/${type}/${id}`,
        `https://2embed.org/embed/${type}/${id}`,
        `https://www.2embed.cc/embed/${type}/${id}`,
        `https://vidsrc.me/embed/${type}/${id}`,
        `https://vidsrc.to/embed/${type}/${id}`,
      ]

      this.currentSourceIndex = 0
      this.currentVideoUrl = this.videoSources[0]
      this.isLoading = true
      this.hasError = false
    },

    handleVideoLoad() {
      this.isLoading = false
      this.hasError = false
    },

    handleVideoError() {
      console.log("Error loading video from:", this.currentVideoUrl)
      this.isLoading = false
      this.hasError = true

      // Try next source automatically after a delay
      setTimeout(() => {
        this.tryNextSource()
      }, 3000)
    },

    tryNextSource() {
      if (this.currentSourceIndex < this.videoSources.length - 1) {
        this.currentSourceIndex++
        this.currentVideoUrl = this.videoSources[this.currentSourceIndex]
        this.isLoading = true
        this.hasError = false
        console.log(`Trying source ${this.currentSourceIndex + 1}/${this.videoSources.length}: ${this.currentVideoUrl}`)
      }
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
        this.setupVideoPlayer(id, type)
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