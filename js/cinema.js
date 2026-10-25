/* =========================================================
   SPECIAL VIDEO VIEW - LIQUID CINEMA ENGINE
   Dynamic Ambient Backglow & Frosted Controls
   ========================================================= */

class LiquidCinema {
  constructor() {
    this.video = document.getElementById('cinema-video');
    this.stage = document.getElementById('video-stage');
    this.glowCanvas = document.getElementById('ambient-glow-canvas');
    this.playBtn = document.getElementById('play-btn');
    this.centerPlay = document.getElementById('center-play-indicator');
    this.centerPlayIcon = document.getElementById('center-play-icon');
    this.timelineTrack = document.getElementById('timeline-track');
    this.timelineProgress = document.getElementById('timeline-progress');
    this.timelineThumb = document.getElementById('timeline-thumb');
    this.timeCurrent = document.getElementById('time-current');
    this.timeDuration = document.getElementById('time-duration');
    this.muteBtn = document.getElementById('mute-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.controlsBar = document.getElementById('cinema-controls-bar');
    this.fileInput = document.getElementById('video-file-input');
    
    // Sample / Demo Videos
    this.demoVideos = [
      {
        title: "Golden Hour Starlight",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      },
      {
        title: "Aurora Romance",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      }
    ];

    this.ctx = this.glowCanvas ? this.glowCanvas.getContext('2d') : null;
    this.animFrame = null;
    this.hideControlsTimer = null;

    this.init();
  }

  init() {
    if (!this.video) return;

    // Set initial video source
    if (!this.video.src && this.demoVideos.length > 0) {
      this.video.src = this.demoVideos[0].url;
    }

    // Play/Pause button
    if (this.playBtn) {
      this.playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlay();
      });
    }

    // Stage click to toggle play & show controls
    if (this.stage) {
      this.stage.addEventListener('click', (e) => {
        if (e.target.closest('.cinema-controls-bar') || e.target.closest('#add-video-btn')) return;
        this.togglePlay();
        this.showControlsTemporarily();
      });
    }

    // Time update & Progress
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateDuration());
    this.video.addEventListener('ended', () => this.onEnded());

    // Seeking on timeline
    if (this.timelineTrack) {
      this.timelineTrack.parentElement.addEventListener('click', (e) => this.seek(e));
    }

    // Mute toggle
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }

    // Fullscreen toggle (iPhone & Safari compatible)
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFullscreen();
      });
    }

    // Local Video File Upload (iPhone camera roll / files picker)
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const objectUrl = URL.createObjectURL(file);
          this.loadCustomVideo(objectUrl, file.name);
        }
      });
    }

    // Start Ambient Glow Sync Loop
    this.startAmbientGlow();
  }

  togglePlay() {
    if (this.video.paused || this.video.ended) {
      this.video.play().then(() => {
        this.updatePlayState(true);
        this.flashCenterIndicator('play');
      }).catch(err => console.log('Autoplay policy caught:', err));
    } else {
      this.video.pause();
      this.updatePlayState(false);
      this.flashCenterIndicator('pause');
    }
  }

  updatePlayState(isPlaying) {
    if (this.stage) {
      if (isPlaying) {
        this.stage.classList.add('playing');
        if (this.centerPlay) this.centerPlay.classList.remove('initial-hint');
      } else {
        this.stage.classList.remove('playing');
      }
    }
    if (this.playBtn) {
      this.playBtn.innerHTML = isPlaying ? `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      ` : `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      `;
    }
  }

  flashCenterIndicator(type) {
    if (!this.centerPlay) return;
    this.centerPlay.innerHTML = type === 'play' ? `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <polygon points="6 4 20 12 6 20 6 4"/>
      </svg>
    ` : `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1"/>
        <rect x="14" y="4" width="4" height="16" rx="1"/>
      </svg>
    `;
    this.centerPlay.classList.add('visible');
    setTimeout(() => {
      this.centerPlay.classList.remove('visible');
    }, 600);
  }

  updateProgress() {
    if (!this.video.duration) return;
    const pct = (this.video.currentTime / this.video.duration) * 100;
    if (this.timelineProgress) this.timelineProgress.style.width = `${pct}%`;
    if (this.timelineThumb) this.timelineThumb.style.left = `${pct}%`;
    if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(this.video.currentTime);
  }

  updateDuration() {
    if (this.timeDuration && this.video.duration) {
      this.timeDuration.textContent = this.formatTime(this.video.duration);
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  seek(e) {
    const rect = this.timelineTrack.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    if (this.video.duration) {
      this.video.currentTime = clampedPos * this.video.duration;
      this.updateProgress();
    }
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    if (this.muteBtn) {
      this.muteBtn.innerHTML = this.video.muted ? `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
        </svg>
      ` : `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
    }
  }

  toggleFullscreen() {
    if (this.video.webkitEnterFullscreen) {
      // Native iOS Safari method
      this.video.webkitEnterFullscreen();
    } else if (this.stage.requestFullscreen) {
      if (!document.fullscreenElement) {
        this.stage.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }

  onEnded() {
    this.updatePlayState(false);
  }

  showControlsTemporarily() {
    if (!this.controlsBar) return;
    this.controlsBar.classList.remove('hidden-controls');
    clearTimeout(this.hideControlsTimer);
    if (!this.video.paused) {
      this.hideControlsTimer = setTimeout(() => {
        this.controlsBar.classList.add('hidden-controls');
      }, 3000);
    }
  }

  loadCustomVideo(url, name = "Special Video") {
    this.video.src = url;
    this.video.load();
    this.video.play().then(() => {
      this.updatePlayState(true);
      this.flashCenterIndicator('play');
    }).catch(err => console.log('Autoplay on custom video:', err));

    // Update title badge
    const badge = document.querySelector('.cinema-title-badge');
    if (badge) badge.textContent = "Custom Viev";
  }

  /* =========================================================
     Real-Time Ambient Backglow Sampler
     ========================================================= */
  startAmbientGlow() {
    if (!this.glowCanvas || !this.ctx) return;

    // Virtual downsampler canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 16;
    sampleCanvas.height = 9;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    const render = () => {
      if (!this.video.paused && !this.video.ended && this.video.readyState >= 2) {
        try {
          sampleCtx.drawImage(this.video, 0, 0, 16, 9);
          // Scale sample to glow canvas with high blur
          this.ctx.clearRect(0, 0, this.glowCanvas.width, this.glowCanvas.height);
          this.ctx.drawImage(sampleCanvas, 0, 0, this.glowCanvas.width, this.glowCanvas.height);
        } catch (e) {
          // If CORS prevents canvas drawImage on external video, use dynamic CSS glow
          const layer = document.getElementById('ambient-glow-layer');
          if (layer) {
            const time = Date.now() * 0.002;
            const r = Math.sin(time) * 40 + 200;
            const g = Math.cos(time) * 40 + 80;
            const b = Math.sin(time * 0.5) * 50 + 190;
            layer.style.background = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.5) 0%, rgba(99, 102, 241, 0.35) 60%, transparent 85%)`;
          }
        }
      }
      this.animFrame = requestAnimationFrame(render);
    };

    render();
  }
}

window.LiquidCinema = LiquidCinema;
