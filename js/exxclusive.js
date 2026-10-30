/* =========================================================
   VIEVS EXXCLUSIVE - NATIVE 1080P CURVED OLED CINEMA ENGINE
   Direct Native 1080p Video ("Jab Saiyaan" - video/exxclusive.mp4)
   Conforms 100% to Curved Screen Geometry, Zero Square Edges
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('exxclusive-video');
  const cinemaExitBtn = document.getElementById('oled-cinema-exit-btn');
  const placeholderOverlay = document.getElementById('oled-placeholder-overlay');
  const curvedFrameWrap = document.getElementById('oled-curved-frame-wrap');
  const subpageContainer = document.getElementById('subpage-exxclusive');

  // Start or resume video playback
  function startPlayback() {
    if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');

    // Pause any background audio in VIEVS
    if (typeof window.userExplicitPause !== 'undefined') {
      window.userExplicitPause = true;
    }
    if (typeof pauseTrack === 'function') {
      pauseTrack();
    } else {
      const audio = document.getElementById('audio-player') || window.audio;
      if (audio && !audio.paused) audio.pause();
    }

    if (video) {
      video.play().catch(() => {});
    }
  }

  // Toggle playback on screen tap
  function togglePlayback() {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    if (!video) return;

    if (placeholderOverlay && !placeholderOverlay.classList.contains('is-hidden')) {
      startPlayback();
      return;
    }

    if (video.paused) {
      if (typeof pauseTrack === 'function') pauseTrack();
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  // Tap on poster starts video
  if (placeholderOverlay) {
    placeholderOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      startPlayback();
    });
  }

  // Tap on curved display frame toggles play/pause
  if (curvedFrameWrap) {
    curvedFrameWrap.addEventListener('click', (e) => {
      if (e.target.closest('#oled-cinema-exit-btn')) return;
      togglePlayback();
    });
  }

  // Minimal Top-Right Exit Button
  if (cinemaExitBtn) {
    cinemaExitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn) {
        settingsBackBtn.click();
      } else {
        window.vievExxclusive.pauseVideo();
        if (subpageContainer) subpageContainer.style.display = 'none';
      }
    });
  }

  // Keyboard shortcut (Escape exits cinema)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn && subpageContainer && subpageContainer.style.display !== 'none') {
        settingsBackBtn.click();
      }
    }
  });

  // Global pause hook when navigating away
  window.vievExxclusive = {
    pauseVideo() {
      if (video && !video.paused) {
        video.pause();
      }
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(true);
      }
      document.body.classList.remove('is-exxclusive-active');
      document.documentElement.classList.remove('is-exxclusive-active');
    }
  };
});
