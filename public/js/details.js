<div x-data="movieComponent()">
    <button @click="fetchMovieDetails(id)">Fetch Movie Details</button>
    <div x-show="error" class="error">{{ error }}</div>
    <div x-show="movie">
        <h1 x-text="movie.title"></h1>
        <p x-text="movie.overview"></p>
        <!-- Add more movie details as needed -->
    </div>
</div>

<script>
    function movieComponent() {
        return {
            id = params.id
            movie: null,
            error: null,

            async fetchMovieDetails(movieId) {
                const API_KEY = process.env.TMDB_API_KEY
		const BASE_URL = "https://api.themoviedb.org/3"

                try {
                    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos,similar,credits`);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch movie details: ${response.status}`);
                    }

                    this.movie = await response.json();
                    this.error = null; // Clear any previous errors
                } catch (error) {
                    console.error("Error fetching movie details:", error);
                    this.error = "Failed to fetch movie details";
                }
            }
        }
    }
</script>
