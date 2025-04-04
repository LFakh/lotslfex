<div x-data="videoPlayerComponent()">
    <div x-ref="container" class="bg-gray-900 rounded-lg overflow-hidden relative group">
        <div class="flex items-center justify-between bg-gray-800 px-4 py-3">
            <h2 class="text-lg font-medium" x-text="title"></h2>
            <button @click="toggleFullscreen" class="text-gray-400 hover:text-white transition-colors" 
                    aria-label="Toggle fullscreen">
                <template x-if="isFullscreen">
                    <Minimize size="20" />
                </template>
                <template x-if="!isFullscreen">
                    <Maximize size="20" />
                </template>
            </button>
        </div>

        <div class="relative pt-[56.25%]">
            <div x-show="isLoading" class="absolute inset-0 flex items-center justify-center bg-black">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
            <div x-show="hasError && !isLoading" class="absolute inset-0 flex items-center justify-center bg-black">
                <div class="text-center p-4">
                    <p class="text-lg font-semibold text-red-500 mb-2">Content Unavailable</p>
                    <p class="text-sm text-gray-400">This media is currently unavailable. Please try again later or check another source.</p>
                </div>
            </div>
            <iframe x-ref="video" 
                    :src="`${currentUrl}${autoPlay ? '?autoplay=1' : ''}`" 
                    class="absolute top-0 left-0 w-full h-full border-0" 
                    allowfullscreen 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    title="Video Player" 
                    @load="handleIframeLoad" 
                    @error="handleIframeError"></iframe>

            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="flex flex-col space-y-2">
                    <div class="w-full bg-gray-600 rounded-full h-1 overflow-hidden">
                        <div class="bg-red-600 h-1" :style="{ width: `${(progress / duration) * 100}%` }"></div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <button @click="togglePlay" class="text-white hover:text-gray-300 transition-colors">
                                <template x-if="isPlaying">
                                    <Pause size="20" />
                                </template>
                                <template x-if="!isPlaying">
                                    <Play size="20" />
                                </template>
                            </button>

                            <button @click="handleRewind" class="text-white hover:text-gray-300 transition-colors">
                                <Rewind size="20" />
                            </button>

                            <button @click="handleFastForward" class="text-white hover:text-gray-300 transition-colors">
                                <FastForward size="20" />
                            </button>

                            <button @click="toggleMute" class="text-white hover:text-gray-300 transition-colors">
                                <template x-if="isMuted">
                                    <VolumeX size="20" />
                                </template>
                                <template x-if="!isMuted">
                                    <Volume2 size="20" />
                                </template>
                            </button>

                            <span class="text-sm text-white">
                                <span x-text="formatTime(progress)"></span> / <span x-text="formatTime(duration)"></span>
                            </span>
                        </div>

                        <button @click="toggleFullscreen" class="text-white hover:text-gray-300 transition-colors">
                            <template x-if="isFullscreen">
                                <Minimize size="20" />
                            </template>
                            <template x-if="!isFullscreen">
                                <Maximize size="20" />
                            </template>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    function videoPlayerComponent() {
        return {
            title: 'Your Video Title', // Set your video title
            embedUrl: 'YOUR_EMBED_URL', // Set your embed URL
            fallbackEmbedUrl: 'YOUR_FALLBACK_EMBED_URL', // Optional fallback URL
            autoPlay: true,
            isFullscreen: false,
            isPlaying: true,
            isMuted: false,
            progress: 0,
            duration: 120, // Set your video duration
            currentUrl: 'YOUR_EMBED_URL', // Set your embed URL
            isLoading: true,
            hasError: false,

            toggleFullscreen() {
                const container = this.$refs.container;
                if (!this.isFullscreen) {
                    if (container.requestFullscreen) {
                        container.requestFullscreen();
                    } else if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen();
                    } else if (container.msRequestFullscreen) {
                        container.msRequestFullscreen();
                    }
                    this.isFullscreen = true;
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    this.isFullscreen = false;
                }
            },

            togglePlay() {
                this.isPlaying = !this.isPlaying;
            },

            toggleMute() {
                this.isMuted = !this.isMuted;
            },

            handleRewind() {
                this.progress = Math.max(0, this.progress - 10);
            },

            handleFastForward() {
                this.progress = Math.min(this.duration, this.progress + 10);
            },

            handleIframeLoad() {
                this.isLoading = false;
            },

            handleIframeError(error) {
                this.isLoading = false;
                this.hasError = true;

                if (error.target instanceof HTMLIFrameElement) {
                    const iframe = error.target;
                    fetch(iframe.src)
                        .then(response => {
                            if (response.status === 404 && this.fallbackEmbedUrl && this.fallbackEmbedUrl !== this.currentUrl) {
                                this.currentUrl = this.fallbackEmbedUrl;
                            }
                        })
                        .catch(err => {
                            console.error("Error checking video source:", err);
                        });
                }
            },

            formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
            },

            init() {
                // Set up any additional initialization logic here
                this.isLoading = true;
                this.hasError = false;
            }
        }
    }
</script>
