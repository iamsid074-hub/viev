/* =========================================================
   VIEVS EXXCLUSIVE - CURVED OLED CINEMA ENGINE
   Controls for Massive Curved OLED Screen, Custom Timeline,
   Audio-Muting Handshake & Panoramic Theater Mode
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('exxclusive-video');
  const playToggleBtn = document.getElementById('oled-play-toggle');
  const muteToggleBtn = document.getElementById('oled-mute-toggle');
  const theaterExpandBtn = document.getElementById('oled-theater-expand');
  const scrubber = document.getElementById('oled-scrubber');
  const timeCurrent = document.getElementById('oled-time-current');
  const timeDuration = document.getElementById('oled-time-duration');
  const placeholderOverlay = document.getElementById('oled-placeholder-overlay');
  const viewport = document.getElementById('oled-theater-viewport');
  const playIcon = document.querySelector('.oled-icon-play');
  const pauseIcon = document.querySelector('.oled-icon-pause');
  const volIcon = document.querySelector('.oled-icon-volume');
  const mutedIcon = document.querySelector('.oled-icon-muted');

  function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updatePlayState(isPlaying) {
    if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
  }

  function updateMuteState(isMuted) {
    if (volIcon) volIcon.style.display = isMuted ? 'none' : 'block';
    if (mutedIcon) mutedIcon.style.display = isMuted ? 'block' : 'none';
  }

  if (video) {
    // When video starts playing, pause background music audio so tracks don't clash
    video.addEventListener('play', () => {
      updatePlayState(true);
      if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');
      if (typeof window.userExplicitPause !== 'undefined') {
        window.userExplicitPause = true;
      }
      if (typeof pauseTrack === 'function') {
        pauseTrack();
      } else {
        const audio = document.getElementById('audio-player') || window.audio;
        if (audio && !audio.paused) audio.pause();
      }
    });

    video.addEventListener('pause', () => {
      updatePlayState(false);
    });

    video.addEventListener('ended', () => {
      updatePlayState(false);
      if (scrubber) scrubber.value = 0;
    });

    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      if (scrubber && !scrubber.matches(':active')) {
        scrubber.value = (video.currentTime / video.duration) * 100;
      }
      if (timeCurrent) timeCurrent.textContent = formatTime(video.currentTime);
    });

    video.addEventListener('loadedmetadata', () => {
      if (timeDuration) timeDuration.textContent = formatTime(video.duration);
      if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');
    });

    video.addEventListener('canplay', () => {
      if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');
    });

    video.addEventListener('error', () => {
      // Show clean placeholder if local file is yet to be placed
      if (placeholderOverlay) placeholderOverlay.classList.remove('is-hidden');
    });

    // Scrubber Seeking
    if (scrubber) {
      scrubber.addEventListener('input', () => {
        if (!video.duration) return;
        const targetTime = (scrubber.value / 100) * video.duration;
        video.currentTime = targetTime;
        if (timeCurrent) timeCurrent.textContent = formatTime(targetTime);
      });
    }

    // Play / Pause Toggle
    if (playToggleBtn) {
      playToggleBtn.addEventListener('click', () => {
        if (typeof triggerHaptic === 'function') triggerHaptic('light');
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }

    // Mute / Unmute Toggle
    if (muteToggleBtn) {
      muteToggleBtn.addEventListener('click', () => {
        if (typeof triggerHaptic === 'function') triggerHaptic('light');
        video.muted = !video.muted;
        updateMuteState(video.muted);
      });
    }

    // Click on video directly to play/pause
    video.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  // Dedicated Cinema Back Button
  const cinemaCloseBtn = document.getElementById('oled-cinema-close-trigger');
  if (cinemaCloseBtn) {
    cinemaCloseBtn.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn) {
        settingsBackBtn.click();
      } else {
        window.vievExxclusive.pauseVideo();
        const sub = document.getElementById('subpage-exxclusive');
        if (sub) sub.style.display = 'none';
      }
    });
  }

  // Landscape Cinema Orientation Mode Toggle
  const landscapeToggleBtn = document.getElementById('oled-landscape-toggle');
  const subpageContainer = document.getElementById('subpage-exxclusive');
  if (landscapeToggleBtn && subpageContainer) {
    landscapeToggleBtn.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      const isForced = subpageContainer.classList.toggle('is-force-landscape');
      
      // Attempt hardware screen orientation lock if supported
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        if (isForced) {
          screen.orientation.lock('landscape').catch(() => {});
        } else {
          try { screen.orientation.unlock(); } catch (e) {}
        }
      }

      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(!isForced);
      }
    });
  }

  // Full Panoramic Curved Theater Mode Toggle
  if (theaterExpandBtn && viewport) {
    theaterExpandBtn.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      const isPanoramic = viewport.classList.toggle('is-panoramic');
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(!isPanoramic);
      }
    });
  }

  // Global pause hook when navigating away
  window.vievExxclusive = {
    pauseVideo() {
      if (video && !video.paused) {
        video.pause();
      }
      if (viewport && viewport.classList.contains('is-panoramic')) {
        viewport.classList.remove('is-panoramic');
      }
      if (subpageContainer && subpageContainer.classList.contains('is-force-landscape')) {
        subpageContainer.classList.remove('is-force-landscape');
        try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
      }
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(true);
      }
    }
  };
});
