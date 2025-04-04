<div x-data="watchPageComponent()">
    <template x-if="isLoading">
        <div class="flex items-center justify-center h-screen bg-black">
            <div class="animate-pulse">
                <img src="/lotsoflex-logo.png" alt="Lotsoflex" width="120" height="32" />
            </div>
        </div>
    </template>

    <template x-if="!isLoading && !content">
        <div class="flex items-center justify-center h-screen bg-black">
            <div class="text-center">
                <p class="text-white text-xl mb-4">Content not found</p>
                <p class="text-gray-400">We couldn't find this title in our database.</p>
            </div>
        </div>
    </template>

    <template x-if="content">
        <div class="relative min-h-screen bg-black">
            <Navbar />

            <main class="pt-16 px-4 md:px-8 max-w-7xl mx-auto">
                <div class="py-8">
                    <h1 class="text-2xl md:text-4xl font-bold text-center mb-8" x-text="content.title || content.name"></h1>

                    <div class="grid gap-6 lg:grid-cols-2">
                        <VideoPlayer
                            title="Full Content"
                            :embedUrl="videoSources[0]"
                            :fallbackEmbedUrl="videoSources[1]"
                            :autoPlay="true"
                        />

                        <template x-if="trailerKey">
                            <VideoPlayer title="Trailer" :embedUrl="`https://www.youtube.com/embed/${trailerKey}`" :autoPlay="false" />
                        </template>
                    </div>

                    <div class="mt-8">
                        <StreamingProviders :id="id" :type="contentType" />
                    </div>

                    <div class="mt-8">
                        <h2 class="text-xl font-semibold mb-4">Alternative Sources</h2>
                        <div class="grid gap-4 md:grid-cols-2">
                            <template x-for="(source, index) in videoSources.slice(2)" :key="index">
                                <VideoPlayer :title="`Source ${index + 3}`" :embedUrl="source" :autoPlay="false" />
                            </template>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </template>
</div>

<script>
    function watchPageComponent() {
        return {
            id: '', // Set this dynamically based on your routing
            contentType: 'movie', // Default content type
            content: null,
            isLoading: true,
            trailerKey: null,
            videoSources: [],
            movieData: null,
            tvData: null,
            isErrorMovie: false,
            isErrorTv: false,

            init() {
                this.id = this.getIdFromUrl(); // Implement this function to extract ID from URL
                this.fetchContent();
            },

            async fetchContent() {
                // Fetch movie and TV data based on the content type
                const movieResponse = await this.fetchMovieDetails(this.id);
                const tvResponse = await this.fetchTvShowDetails(this.id);

                if (this.contentType === 'movie' && movieResponse) {
                    this.content = movieResponse;
                    this.isLoading = false;
                } else if (this.contentType === 'tv' && tvResponse) {
                    this.content = tvResponse;
                    this.isLoading = false;
                } else if (this.contentType === 'movie' && this.isErrorMovie) {
                    this.contentType = 'tv';
                    this.fetchContent(); // Retry with TV
                } else if (this.contentType === 'tv' && this.isErrorTv) {
                    this.isLoading = false; // Show error state
                }

                this.setupVideoSources();
            },

            async fetchMovieDetails(id) {
                // Implement your API call to fetch movie details
                // Set this.movieData and this.isErrorMovie based on the response
            },

            async fetchTvShowDetails(id) {
                // Implement your API call to fetch TV show details
                // Set this.tvData and this.isErrorTv based on the response
            },

            setupVideoSources() {
                if (this.content) {
                    const trailer = this.content.videos?.results.find(video => video.type === 'Trailer' || video.type === 'Teaser');
                    this.trailerKey = trailer?.key;

                    this.videoSources = [
                        `https://vidsrc.net/embed/${this.contentType}/${this.id}`,
                        `https://vidsrc.to/embed/${this.contentType}/${this.id}`,
                        `https://embed.vidsrc.pk/${this.contentType}/${this.id}`,
                        `https://player.vidsrc.co/embed/${this.contentType}/${this.id}`,
                        `https://vidsrc.cc/v2/embed/${this.contentType}/${this.id}`,
                        `https://player.videasy.net/${this.contentType}/${this.id}`,
                    ];
                }
            },

            getIdFromUrl() {
                // Implement logic to extract ID from the URL
                return 'extracted-id'; // Replace with actual extraction logic
            }
        }
    }
</script>
