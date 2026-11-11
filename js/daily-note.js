/* =========================================================
   DAILY NOTE FOR PRINCESS DIGI
   With Apple Bottom Sheet Verification Quiz (Optional)
   2-Attempts Rule:
   - 2 chances to answer when quiz is enabled.
   - If 1st answer is wrong: 1 more chance is given with gentle warning!
   - If 2nd answer is also wrong: Note is permanently locked.
   - On click, displays small subtitle below: "no more attemps".
   - When quiz is null / disabled: opens directly without asking questions!
   ========================================================= */

// =========================================================
// 👇 EDIT YOUR DAILY NOTE & QUIZ CONFIG HERE:
// =========================================================
const DAILY_NOTE_CONFIG = {
  // Unique question key (updating this automatically resets attempts for new questions)
  questionId: "digi_note_bakwass_2026",

  // Note message jo unlock hone par dikhega:
  noteText: `Kyun sunti hai tu meri bakwass itni ,, 
aj kal kuch jyada hi bolne lga hu mai 
mereko to dar lagjata hai kabhi kabhi 
kahin rishte ko na torne lga hu mai`,

  // Note Memory Photo:
  imageUrl: "assets/daily_note.jpg",

  // Verification Quiz (Set to null when no question applies):
  quiz: null,

  // Right-side date label:
  dateLabel: "Today",

  // Audio Sync Configuration: Mangal Rang (Arijit Singh - Ramayana)
  audio: {
    src: "song/mangal_rang.m4a",
    fallbackSrc: "song/mangal_rang.webm",
    title: "Mangal Rang • Arijit Singh",
    startTime: 29.0, // 0:29 sec
    endTime: 60.0    // 1:00 min
  }
};
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Get Active User Role ('digi' for 3009 vs 'user' for 1711)
  function getActiveUserRole() {
    try {
      const sess = JSON.parse(localStorage.getItem('viev_auth_session') || '{}');
      if (sess && (sess.code === '3009' || sess.code === '3011' || sess.role === 'digi')) return 'digi';
      if (sess && (sess.code === '1711' || sess.role === 'user')) return 'user';
      if (sess && sess.role) return sess.role;
    } catch(e) {}
    return 'digi';
  }

  // Storage Key tied strictly to active user role AND questionId
  const hasQuiz = Boolean(DAILY_NOTE_CONFIG.quiz && DAILY_NOTE_CONFIG.quiz.question);
  const qId = (DAILY_NOTE_CONFIG.questionId || (hasQuiz ? DAILY_NOTE_CONFIG.quiz.question : 'digi_barosa_note'))
    .toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 32);
  const MAX_ATTEMPTS = (hasQuiz && DAILY_NOTE_CONFIG.quiz.maxAttempts) ? DAILY_NOTE_CONFIG.quiz.maxAttempts : 2;

  // Clear previous accidental answers across both digi & user roles
  try {
    ['digi', 'user'].forEach(r => {
      localStorage.removeItem(`viev_note_status_${r}_digi_virat_fav_body_part_2026`);
      localStorage.removeItem(`viev_note_attempts_${r}_digi_virat_fav_body_part_2026`);
    });
    localStorage.removeItem('viev_note_status_digi_virat_fav_body_part_2026');
    localStorage.removeItem('viev_note_attempts_digi_virat_fav_body_part_2026');
  } catch (e) {}

  let activeRole = getActiveUserRole();
  let STORAGE_KEY = `viev_note_status_${activeRole}_${qId}`;
  let ATTEMPTS_KEY = `viev_note_attempts_${activeRole}_${qId}`;

  let attemptsUsed = 0;
  let savedStatus = null;
  let isPermanentlyLocked = false;
  let isNoteUnlocked = !hasQuiz;
  let isNoteOpen = false;

  // Daily Note Elements
  const noteCapsule = document.getElementById('daily-note-capsule');
  const noteTextEl = document.getElementById('daily-note-text');
  const noteImgWrap = document.getElementById('daily-note-img-wrap');
  const noteImgEl = document.getElementById('daily-note-img');
  const noteDateEl = document.getElementById('daily-note-date');
  const noteTagEl = document.getElementById('daily-note-tag');
  const lockedStateEl = document.getElementById('daily-note-locked-state');
  const lockedLabelEl = document.getElementById('daily-note-locked-label');
  const lockedSubEl = document.getElementById('daily-note-locked-sub');

  // Toggle Button & Subtitle Elements
  const toggleBtn = document.getElementById('toggle-note-btn');
  const noteBtnText = document.getElementById('note-btn-text');
  const noteBtnIcon = document.getElementById('note-btn-icon');
  const noteAttemptsSubtitle = document.getElementById('note-attempts-subtitle');

  // Quiz Bottom Sheet Elements
  const quizSheet = document.getElementById('apple-note-quiz-sheet');
  const quizPanel = document.getElementById('quiz-panel');
  const quizBackdrop = document.getElementById('quiz-backdrop');
  const quizCloseBtn = document.getElementById('quiz-close-btn');
  const quizOptionBtns = document.querySelectorAll('.quiz-option-btn');
  const quizFeedbackMsg = document.getElementById('quiz-feedback-msg');

  // SVG Icons for Toggle Button
  const ICON_LOCK = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  `;

  const ICON_ENVELOPE = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  `;

  const ICON_HIDE = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  `;

  // Initialize Note Content
  if (noteDateEl && DAILY_NOTE_CONFIG.dateLabel) {
    noteDateEl.textContent = DAILY_NOTE_CONFIG.dateLabel;
  }
  if (noteTextEl && DAILY_NOTE_CONFIG.noteText) {
    noteTextEl.textContent = DAILY_NOTE_CONFIG.noteText;
  }

  // Initialize Quiz Question & Options from Config (if quiz configured)
  const questionTitleEl = document.querySelector('.quiz-question-title');
  if (questionTitleEl && DAILY_NOTE_CONFIG.quiz && DAILY_NOTE_CONFIG.quiz.question) {
    questionTitleEl.textContent = DAILY_NOTE_CONFIG.quiz.question;
  }
  if (DAILY_NOTE_CONFIG.quiz && DAILY_NOTE_CONFIG.quiz.options) {
    quizOptionBtns.forEach((btn, idx) => {
      const opt = DAILY_NOTE_CONFIG.quiz.options[idx];
      if (opt) {
        btn.setAttribute('data-option', String(opt.id));
        if (opt.correct) {
          btn.setAttribute('data-correct', 'true');
        } else {
          btn.removeAttribute('data-correct');
        }
        const textSpan = btn.querySelector('.option-text');
        if (textSpan) textSpan.textContent = opt.text;
      }
    });
  }

  // Set Initial State (Before note has been expanded)
  function setInitialLockedState() {
    isNoteOpen = false;
    document.getElementById('welcome-screen')?.classList.remove('is-note-opened');
    if (noteCapsule) {
      noteCapsule.classList.add('is-revealed');
      if (hasQuiz) {
        noteCapsule.classList.add('is-locked');
      } else {
        noteCapsule.classList.remove('is-locked');
      }
      noteCapsule.classList.remove('is-permanently-locked');
    }
    if (noteTextEl) {
      noteTextEl.style.display = 'none';
    }
    if (noteImgWrap) {
      noteImgWrap.style.display = 'none';
    }
    if (lockedStateEl) {
      lockedStateEl.style.display = 'flex';
      const stateIcon = lockedStateEl.querySelector('.locked-icon');
      if (stateIcon) {
        if (hasQuiz) {
          stateIcon.innerHTML = `
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          `;
        } else {
          stateIcon.innerHTML = `
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          `;
        }
      }
    }
    if (lockedLabelEl) {
      if (!hasQuiz) {
        lockedLabelEl.textContent = 'TAP OPEN NOTE TO READ';
      } else {
        lockedLabelEl.textContent = isNoteUnlocked 
          ? 'UNLOCKED • TAP OPEN NOTE TO READ' 
          : 'LOCKED • TAP OPEN NOTE TO REVEAL';
      }
    }
    if (lockedSubEl) {
      lockedSubEl.style.display = 'none';
    }
    if (noteTagEl) {
      if (!hasQuiz) {
        noteTagEl.textContent = 'NOTE';
        noteTagEl.classList.remove('is-locked', 'is-permanently-locked');
      } else {
        noteTagEl.textContent = isNoteUnlocked ? 'UNLOCKED' : 'LOCKED';
        noteTagEl.classList.add('is-locked');
        noteTagEl.classList.remove('is-opened', 'is-permanently-locked');
      }
    }
    if (noteBtnText) {
      noteBtnText.textContent = 'Open Note';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = hasQuiz ? ICON_LOCK : ICON_ENVELOPE;
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('is-opened-mode', 'is-permanently-locked');
      toggleBtn.setAttribute('aria-label', 'Open Note');
    }
    if (noteAttemptsSubtitle) {
      noteAttemptsSubtitle.style.display = 'none';
    }
  }

  // Set Permanently Locked State (0 attempts left after wrong answer)
  function setPermanentlyLockedState() {
    isPermanentlyLocked = true;
    isNoteOpen = false;
    document.getElementById('welcome-screen')?.classList.remove('is-note-opened');

    if (noteCapsule) {
      noteCapsule.classList.add('is-revealed', 'is-locked', 'is-permanently-locked');
    }
    if (noteTextEl) {
      noteTextEl.style.display = 'none';
    }
    if (noteImgWrap) {
      noteImgWrap.style.display = 'none';
    }
    if (lockedStateEl) {
      lockedStateEl.style.display = 'flex';
    }
    if (lockedLabelEl) {
      lockedLabelEl.textContent = 'LOCKED';
    }
    // Initially subtitle is hidden until clicked
    if (lockedSubEl) {
      lockedSubEl.style.display = 'none';
    }
    if (noteTagEl) {
      noteTagEl.textContent = 'LOCKED';
      noteTagEl.classList.add('is-locked', 'is-permanently-locked');
      noteTagEl.classList.remove('is-opened');
    }
    if (noteBtnText) {
      noteBtnText.textContent = 'Locked';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = ICON_LOCK;
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('is-opened-mode');
      toggleBtn.classList.add('is-permanently-locked');
      toggleBtn.setAttribute('aria-label', 'Locked - No more attempts');
    }
    if (noteAttemptsSubtitle) {
      noteAttemptsSubtitle.style.display = 'none';
    }
  }

  // Trigger Small Subtitle & Shake when Locked Note is Clicked
  function triggerNoMoreAttemptsFeedback() {
    if (window.triggerHaptic) window.triggerHaptic('lock');
    // Show small subtitle below the button
    if (noteAttemptsSubtitle) {
      noteAttemptsSubtitle.style.display = 'block';
      noteAttemptsSubtitle.classList.remove('note-shake');
      void noteAttemptsSubtitle.offsetWidth;
      noteAttemptsSubtitle.classList.add('note-shake');
    }

    // Also show small subtitle inside the locked note capsule
    if (lockedSubEl) {
      lockedSubEl.style.display = 'block';
      lockedSubEl.classList.remove('note-shake');
      void lockedSubEl.offsetWidth;
      lockedSubEl.classList.add('note-shake');
    }

    // Tactile shake on button and capsule
    if (toggleBtn) {
      toggleBtn.classList.remove('note-shake');
      void toggleBtn.offsetWidth;
      toggleBtn.classList.add('note-shake');
    }
    if (noteCapsule) {
      noteCapsule.classList.remove('note-shake');
      void noteCapsule.offsetWidth;
      noteCapsule.classList.add('note-shake');
    }
  }

  // Open Quiz Bottom Sheet
  function openQuizSheet() {
    if (!hasQuiz) {
      revealNote();
      return;
    }
    if (isPermanentlyLocked) {
      triggerNoMoreAttemptsFeedback();
      return;
    }
    if (!quizSheet) return;

    // Reset options
    quizOptionBtns.forEach(btn => {
      btn.classList.remove('is-correct', 'is-wrong');
      btn.disabled = false;
    });

    const remaining = Math.max(0, MAX_ATTEMPTS - attemptsUsed);
    if (quizFeedbackMsg) {
      if (attemptsUsed > 0 && remaining === 1) {
        quizFeedbackMsg.innerHTML = '<span class="feedback-wrong" style="font-size:12px;">⚠️ 1 aakhri chance bacha hai, dhyan se chunna! 💌</span>';
      } else {
        quizFeedbackMsg.innerHTML = '';
      }
    }

    quizSheet.classList.add('is-open');
    quizSheet.setAttribute('aria-hidden', 'false');
  }

  // Close Quiz Bottom Sheet
  function closeQuizSheet() {
    if (!quizSheet) return;
    quizSheet.classList.remove('is-open');
    quizSheet.setAttribute('aria-hidden', 'true');
  }

  // =========================================================
  // MAGICAL HERO NOTE STAGE ENGINE (Canvas Particles + Mangal Rang Audio Sync)
  // =========================================================
  let particleCanvas = null;
  let particleCtx = null;
  let particleRafId = null;
  let particlesList = [];
  let heroNoteAudio = null;
  let ambientVideo = null;
  let ambientCanvas = null;
  let ambientCtx = null;
  let stageCanvas = null;
  let stageCtx = null;
  let ambientRafId = null;
  let isAmbientPrimed = false;
  let heroAudioFadeInterval = null;

  // Kinetic Line Sequence State
  let notePoetryLines = [];
  let currentSingleLineIdx = 0;
  let lineSequenceTimer = null;
  let lineSequenceMode = 'single'; // 'single' | 'all'

  function initParticleCanvas() {
    particleCanvas = document.getElementById('hero-note-particles-canvas');
    if (!particleCanvas) return;
    particleCtx = particleCanvas.getContext('2d');
    resizeParticleCanvas();
  }

  function resizeParticleCanvas() {
    if (!particleCanvas) return;
    const parent = particleCanvas.parentElement;
    if (parent) {
      particleCanvas.width = parent.clientWidth || 360;
      particleCanvas.height = parent.clientHeight || 380;
    }
  }

  function createParticles() {
    particlesList = [];
    const count = 30;
    const w = particleCanvas ? particleCanvas.width : 360;
    const h = particleCanvas ? particleCanvas.height : 380;

    for (let i = 0; i < count; i++) {
      particlesList.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.45 + 0.15,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        alphaPulse: Math.random() * 0.04 + 0.015,
        color: Math.random() > 0.4 ? '254, 240, 138' : '255, 180, 160' // Gold or Rose
      });
    }
  }

  function particleRenderLoop() {
    if (!particleCtx || !particleCanvas || !isNoteOpen) return;

    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    for (let p of particlesList) {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.alpha += Math.sin(Date.now() * p.alphaPulse) * 0.02;

      // Wrap-around
      if (p.y < -5) {
        p.y = particleCanvas.height + 5;
        p.x = Math.random() * particleCanvas.width;
      }
      if (p.x < -5) p.x = particleCanvas.width + 5;
      if (p.x > particleCanvas.width + 5) p.x = -5;

      const currentAlpha = Math.max(0.12, Math.min(0.9, p.alpha));

      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(${p.color}, ${currentAlpha.toFixed(2)})`;
      particleCtx.shadowColor = `rgba(${p.color}, 0.8)`;
      particleCtx.shadowBlur = 8;
      particleCtx.fill();
    }

    particleRafId = requestAnimationFrame(particleRenderLoop);
  }

  function startHeroParticles() {
    initParticleCanvas();
    if (!particleCanvas || !particleCtx) return;
    resizeParticleCanvas();
    createParticles();
    if (particleRafId) cancelAnimationFrame(particleRafId);
    particleRafId = requestAnimationFrame(particleRenderLoop);
  }

  function stopHeroParticles() {
    if (particleRafId) {
      cancelAnimationFrame(particleRafId);
      particleRafId = null;
    }
    if (particleCtx && particleCanvas) {
      particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    }
  }

  // =========================================================
  // Kinetic Sequential Line Engine ("Ek-Ek Line -> Finale All Lines")
  // =========================================================
  function prepareNoteLines() {
    const rawText = (DAILY_NOTE_CONFIG.noteText || '').trim();
    notePoetryLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }

  function startNoteLineSequence() {
    prepareNoteLines();
    stopNoteLineSequence();
    lineSequenceMode = 'single';
    currentSingleLineIdx = 0;

    const glassCard = document.getElementById('hero-note-content-glass');
    if (glassCard) {
      glassCard.classList.remove('is-all-lines-mode');
    }

    if (!notePoetryLines.length) return;

    // Show initial line immediately
    renderCurrentSingleLine();

    // Line duration: 4.2s each (smooth kinetic pacing)
    const stepDuration = 4200;

    const advanceNextLine = () => {
      if (!isNoteOpen) return;
      currentSingleLineIdx++;
      if (currentSingleLineIdx < notePoetryLines.length) {
        renderCurrentSingleLine();
        lineSequenceTimer = setTimeout(advanceNextLine, stepDuration);
      } else {
        // Individual lines finished! Now reveal ALL lines together!
        showAllLinesMode();
      }
    };

    lineSequenceTimer = setTimeout(advanceNextLine, stepDuration);
  }

  function stopNoteLineSequence() {
    if (lineSequenceTimer) {
      clearTimeout(lineSequenceTimer);
      lineSequenceTimer = null;
    }
  }

  function renderCurrentSingleLine() {
    const linesWrap = document.getElementById('hero-note-lines-wrap');
    if (!linesWrap || !notePoetryLines.length) return;

    const lineText = notePoetryLines[currentSingleLineIdx] || '';
    const existing = linesWrap.querySelector('.hero-note-single-line');

    if (existing) {
      existing.classList.add('is-exiting');
      setTimeout(() => {
        if (!isNoteOpen || lineSequenceMode !== 'single') return;
        linesWrap.innerHTML = `
          <div class="hero-note-single-wrap">
            <p class="hero-note-single-line">${lineText}</p>
          </div>
        `;
        requestAnimationFrame(() => {
          const el = linesWrap.querySelector('.hero-note-single-line');
          if (el) el.classList.add('is-active');
        });
      }, 420);
    } else {
      linesWrap.innerHTML = `
        <div class="hero-note-single-wrap">
          <p class="hero-note-single-line is-active">${lineText}</p>
        </div>
      `;
    }
  }

  function showAllLinesMode() {
    stopNoteLineSequence();
    lineSequenceMode = 'all';

    const linesWrap = document.getElementById('hero-note-lines-wrap');
    if (!linesWrap || !notePoetryLines.length) return;

    linesWrap.innerHTML = `
      <div class="hero-note-all-wrap">
        ${notePoetryLines.map((line, idx) => `
          <p class="hero-note-poetry-line line-${idx % 5}">${line}</p>
        `).join('')}
      </div>
    `;

    const glassCard = document.getElementById('hero-note-content-glass');
    if (glassCard) {
      glassCard.classList.add('is-all-lines-mode');
    }
  }

  // =========================================================
  // Canvas Accumulation Engine: Zero-Lag Silky Liquid Color Fades
  // =========================================================
  function initAmbientCanvases() {
    if (!ambientCanvas) {
      ambientCanvas = document.getElementById('hero-note-ambient-canvas');
      if (ambientCanvas) ambientCtx = ambientCanvas.getContext('2d', { alpha: false });
    }
    if (!stageCanvas) {
      stageCanvas = document.getElementById('hero-note-stage-canvas');
      if (stageCanvas) stageCtx = stageCanvas.getContext('2d', { alpha: false });
    }
  }

  function startAmbientRenderLoop() {
    initAmbientCanvases();
    stopAmbientRenderLoop();
    isAmbientPrimed = false;

    function renderFrame() {
      if (!isNoteOpen) return;

      if (ambientVideo && !ambientVideo.paused && ambientVideo.readyState >= 2) {
        if (!isAmbientPrimed) {
          // Instantly prime with the exact starting frame at 0:29
          if (ambientCtx && ambientCanvas) {
            ambientCtx.globalCompositeOperation = 'source-over';
            ambientCtx.globalAlpha = 1.0;
            ambientCtx.drawImage(ambientVideo, 0, 0, ambientCanvas.width, ambientCanvas.height);
          }
          if (stageCtx && stageCanvas) {
            stageCtx.globalCompositeOperation = 'source-over';
            stageCtx.globalAlpha = 1.0;
            stageCtx.drawImage(ambientVideo, 0, 0, stageCanvas.width, stageCanvas.height);
          }
          isAmbientPrimed = true;
        } else {
          // Exponential decay temporal filter: 0.045 alpha per frame
          // Hard video scene cuts melt into smooth liquid color blooms with zero abrupt shifts!
          const blendAlpha = 0.045;
          if (ambientCtx && ambientCanvas) {
            ambientCtx.globalCompositeOperation = 'source-over';
            ambientCtx.globalAlpha = blendAlpha;
            ambientCtx.drawImage(ambientVideo, 0, 0, ambientCanvas.width, ambientCanvas.height);
          }
          if (stageCtx && stageCanvas) {
            stageCtx.globalCompositeOperation = 'source-over';
            stageCtx.globalAlpha = blendAlpha;
            stageCtx.drawImage(ambientVideo, 0, 0, stageCanvas.width, stageCanvas.height);
          }
        }
      }

      ambientRafId = requestAnimationFrame(renderFrame);
    }

    ambientRafId = requestAnimationFrame(renderFrame);
  }

  function stopAmbientRenderLoop() {
    if (ambientRafId) {
      cancelAnimationFrame(ambientRafId);
      ambientRafId = null;
    }
    isAmbientPrimed = false;
  }

  // Audio & Ambient Video Sync Engine (Mangal Rang: 0:29s to 1:00min)
  function initHeroNoteAudio() {
    if (!heroNoteAudio) {
      heroNoteAudio = document.getElementById('hero-note-audio');
    }
    if (!ambientVideo) {
      ambientVideo = document.getElementById('hero-note-ambient-video');
    }
  }

  function startHeroNoteAudio() {
    initHeroNoteAudio();
    if (!heroNoteAudio) return;

    // Softly pause main music player if active so songs don't collide
    if (typeof window.audio !== 'undefined' && window.audio && !window.audio.paused) {
      try { window.audio.pause(); } catch(e) {}
    }

    if (heroAudioFadeInterval) {
      clearInterval(heroAudioFadeInterval);
      heroAudioFadeInterval = null;
    }

    const startTime = (DAILY_NOTE_CONFIG.audio && DAILY_NOTE_CONFIG.audio.startTime) || 29.0;
    const endTime = (DAILY_NOTE_CONFIG.audio && DAILY_NOTE_CONFIG.audio.endTime) || 60.0;
    const targetVol = 0.95;

    heroNoteAudio.currentTime = startTime;
    heroNoteAudio.volume = 0;

    // Start Real Ambient Video sync (Offscreen single source)
    if (ambientVideo) {
      try {
        ambientVideo.currentTime = startTime;
        const p = ambientVideo.play();
        if (p !== undefined) {
          p.catch(err => console.warn('[AmbientVideo] Play prevented:', err));
        }
      } catch(e) {
        console.warn('[AmbientVideo] Error:', e);
      }
    }

    const playPromise = heroNoteAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Ultra-smooth exponential fade-in over 3.5s (Aram se ekdam gentle)
        const fadeDuration = 3500;
        const fadeStartTime = performance.now();

        heroAudioFadeInterval = setInterval(() => {
          const elapsed = performance.now() - fadeStartTime;
          const progress = Math.min(1, elapsed / fadeDuration);
          heroNoteAudio.volume = Math.min(targetVol, Math.pow(progress, 1.4) * targetVol);

          if (progress >= 1) {
            clearInterval(heroAudioFadeInterval);
            heroAudioFadeInterval = null;
            heroNoteAudio.volume = targetVol;
          }
        }, 25);
      }).catch(err => {
        console.warn('[NoteAudio] Autoplay blocked:', err);
      });
    }

    // Monitor playback timeline: gentle 5.5s fade-out towards 1:00 min (60.0s)
    const fadeOutSpan = 5.5; // Starts at 54.5s down to 60.0s
    const fadeOutStart = endTime - fadeOutSpan;

    heroNoteAudio.ontimeupdate = () => {
      const cur = heroNoteAudio.currentTime;

      // Keep living ambient video strictly in sync
      if (ambientVideo && !ambientVideo.paused) {
        if (Math.abs(ambientVideo.currentTime - cur) > 0.35) {
          try { ambientVideo.currentTime = cur; } catch(e) {}
        }
      }

      if (cur >= fadeOutStart && cur < endTime) {
        // Smooth cubic ease-out fade curve
        const progress = (endTime - cur) / fadeOutSpan;
        heroNoteAudio.volume = Math.max(0, Math.min(targetVol, Math.pow(progress, 1.35) * targetVol));
      } else if (cur >= endTime) {
        heroNoteAudio.pause();
        heroNoteAudio.volume = 0;
        heroNoteAudio.currentTime = startTime;
        heroNoteAudio.ontimeupdate = null;

        if (ambientVideo) {
          ambientVideo.pause();
          ambientVideo.currentTime = startTime;
        }
        stopAmbientRenderLoop();
      }
    };
  }

  function stopHeroNoteAudio() {
    if (!heroNoteAudio) return;

    if (heroAudioFadeInterval) {
      clearInterval(heroAudioFadeInterval);
      heroAudioFadeInterval = null;
    }

    heroNoteAudio.ontimeupdate = null;

    const startTime = (DAILY_NOTE_CONFIG.audio && DAILY_NOTE_CONFIG.audio.startTime) || 29.0;

    const pauseVideoSource = () => {
      if (ambientVideo) {
        ambientVideo.pause();
        ambientVideo.currentTime = startTime;
      }
      stopAmbientRenderLoop();
    };

    if (heroNoteAudio.paused) {
      pauseVideoSource();
      return;
    }

    // Smooth relaxing fade-out over 1.8s before pausing
    const initialVol = heroNoteAudio.volume;
    const fadeDuration = 1800;
    const fadeStartTime = performance.now();

    heroAudioFadeInterval = setInterval(() => {
      const elapsed = performance.now() - fadeStartTime;
      const progress = Math.min(1, elapsed / fadeDuration);
      const newVol = Math.max(0, initialVol * Math.pow(1 - progress, 1.35));
      heroNoteAudio.volume = newVol;

      if (progress >= 1 || newVol <= 0.01) {
        clearInterval(heroAudioFadeInterval);
        heroAudioFadeInterval = null;
        heroNoteAudio.pause();
        heroNoteAudio.volume = 0;
        heroNoteAudio.currentTime = startTime;
        pauseVideoSource();
      }
    }, 25);
  }

  // Reveal Note Content (Magical Hero Stage + Kinetic Poetry Reveal + Liquid Ambient Glow)
  function revealNote() {
    isNoteOpen = true;
    document.getElementById('welcome-screen')?.classList.add('is-note-opened');

    // 1. Activate Top Hero Stage
    const heroWrapper = document.getElementById('hero-photo-wrapper');
    const heroNoteStage = document.getElementById('hero-note-stage');
    const fullAmbient = document.getElementById('welcome-note-full-ambient');

    if (heroWrapper) heroWrapper.classList.add('is-note-active');
    if (heroNoteStage) heroNoteStage.style.display = 'flex';
    if (fullAmbient) fullAmbient.classList.add('is-active');

    // 2. Start kinetic sequential line reveal (one-by-one then all lines together)
    startNoteLineSequence();

    // 3. Start starlight canvas particles
    startHeroParticles();

    // 4. Start synchronized audio & living liquid canvas ambient loop
    startHeroNoteAudio();
    startAmbientRenderLoop();

    // 5. Update lower elements & Button
    if (noteCapsule) {
      noteCapsule.style.display = 'none'; // Spotlight remains on top stage!
    }
    if (noteBtnText) {
      noteBtnText.textContent = 'Hide Note';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = ICON_HIDE;
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('is-permanently-locked');
      toggleBtn.classList.add('is-opened-mode', 'is-note-open-active');
      toggleBtn.setAttribute('aria-label', 'Hide Note');
    }
    if (noteAttemptsSubtitle) {
      noteAttemptsSubtitle.style.display = 'none';
    }

    if (window.triggerHaptic) window.triggerHaptic('success');
  }

  // Hide Note Content (Smoothly morphs back to Photo + Fades Audio & Ambient)
  function hideNote() {
    isNoteOpen = false;
    document.getElementById('welcome-screen')?.classList.remove('is-note-opened');

    const heroWrapper = document.getElementById('hero-photo-wrapper');
    const heroNoteStage = document.getElementById('hero-note-stage');
    const fullAmbient = document.getElementById('welcome-note-full-ambient');

    if (heroWrapper) heroWrapper.classList.remove('is-note-active');
    if (fullAmbient) fullAmbient.classList.remove('is-active');

    // Stop line sequence
    stopNoteLineSequence();

    // Stop synchronized audio & ambient loop with smooth fade
    stopHeroNoteAudio();

    // Stop particles loop
    stopHeroParticles();

    // Reset Hero Stage after fade-out transition completes (1200ms)
    setTimeout(() => {
      if (!isNoteOpen && heroNoteStage) {
        heroNoteStage.style.display = 'none';
      }
    }, 1200);

    // Update Button State Below
    if (noteBtnText) {
      noteBtnText.textContent = 'Open Note';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = hasQuiz ? ICON_LOCK : ICON_ENVELOPE;
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('is-opened-mode', 'is-note-open-active');
      toggleBtn.setAttribute('aria-label', 'Open Note');
    }

    if (window.triggerHaptic) window.triggerHaptic('light');
  }

  // Tapping the frosted glass note card early instantly unlocks All Lines view
  const heroNoteContentGlass = document.getElementById('hero-note-content-glass');
  if (heroNoteContentGlass) {
    heroNoteContentGlass.addEventListener('click', () => {
      if (lineSequenceMode === 'single') {
        showAllLinesMode();
        if (window.triggerHaptic) window.triggerHaptic('light');
      }
    });
  }

  // Click Handler for Button / Capsule Interaction
  function handleUserNoteAction() {
    if (isPermanentlyLocked) {
      triggerNoMoreAttemptsFeedback();
      return;
    }
    if (isNoteOpen) {
      hideNote();
    } else {
      if (isNoteUnlocked || !hasQuiz) {
        // Direct show without asking quiz!
        revealNote();
      } else {
        openQuizSheet();
      }
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', handleUserNoteAction);
  }

  if (noteCapsule) {
    noteCapsule.addEventListener('click', () => {
      // If note is already opened and readable, do not collapse on capsule tap
      if (isNoteOpen) return;
      handleUserNoteAction();
    });
  }

  // Close Bottom Sheet on '✕' button or backdrop click
  if (quizCloseBtn) {
    quizCloseBtn.addEventListener('click', closeQuizSheet);
  }
  if (quizBackdrop) {
    quizBackdrop.addEventListener('click', closeQuizSheet);
  }

  // Quiz Options Click Handler (2 CHANCES ALLOWED)
  quizOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isPermanentlyLocked) return;

      const isCorrect = btn.getAttribute('data-correct') === 'true' || 
                        btn.getAttribute('data-option') === String(DAILY_NOTE_CONFIG.quiz.correctOption);

      if (isCorrect) {
        // Correct Answer Selected!
        if (window.triggerHaptic) window.triggerHaptic('success');
        btn.classList.add('is-correct');
        quizOptionBtns.forEach(b => b.disabled = true);

        try {
          localStorage.setItem(STORAGE_KEY, 'unlocked');
        } catch (e) {}

        isNoteUnlocked = true;

        if (quizFeedbackMsg) {
          quizFeedbackMsg.innerHTML = '<span class="feedback-success">✨ Sahi jawab! Unlocking note... 💌</span>';
        }

        // Smooth transition: close sheet and reveal note content
        setTimeout(() => {
          closeQuizSheet();
          setTimeout(() => {
            revealNote();
          }, 200);
        }, 650);
      } else {
        // Wrong Answer Selected - Consume 1 Attempt
        attemptsUsed++;
        try {
          localStorage.setItem(ATTEMPTS_KEY, String(attemptsUsed));
        } catch (e) {}

        btn.classList.add('is-wrong');
        btn.disabled = true; // disable this wrong option

        const remaining = Math.max(0, MAX_ATTEMPTS - attemptsUsed);

        if (remaining > 0) {
          // Still have 1 more chance!
          if (window.triggerHaptic) window.triggerHaptic('light');
          if (quizPanel) {
            quizPanel.classList.remove('note-shake');
            void quizPanel.offsetWidth;
            quizPanel.classList.add('note-shake');
          }

          if (quizFeedbackMsg) {
            quizFeedbackMsg.innerHTML = '<span class="feedback-wrong">Oops! Yeh galat hai 🥺 Par 1 aakhri chance bacha hai... dhyan se chunna! 💖</span>';
          }
        } else {
          // All attempts used up - Permanently Lock
          if (window.triggerHaptic) window.triggerHaptic('lock');
          isPermanentlyLocked = true;
          quizOptionBtns.forEach(b => b.disabled = true);

          try {
            localStorage.setItem(STORAGE_KEY, 'permanently_locked');
          } catch (e) {}

          if (quizFeedbackMsg) {
            quizFeedbackMsg.innerHTML = '<span class="feedback-wrong">Oops! Dono chances khatam ho gaye 🥺 Locked...</span>';
          }

          // Close bottom sheet and lock permanently
          setTimeout(() => {
            closeQuizSheet();
            setTimeout(() => {
              setPermanentlyLockedState();
              triggerNoMoreAttemptsFeedback();
            }, 200);
          }, 850);
        }
      }
    });
  });

  // Synchronize Note state strictly for active user (digi vs user)
  function syncDailyNoteWithActiveUser() {
    activeRole = getActiveUserRole();
    STORAGE_KEY = `viev_note_status_${activeRole}_${qId}`;
    ATTEMPTS_KEY = `viev_note_attempts_${activeRole}_${qId}`;

    savedStatus = null;
    try {
      savedStatus = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}

    attemptsUsed = 0;
    try {
      attemptsUsed = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
      if (isNaN(attemptsUsed)) attemptsUsed = 0;
    } catch (e) {
      attemptsUsed = 0;
    }

    isPermanentlyLocked = hasQuiz && (savedStatus === 'permanently_locked' || attemptsUsed >= MAX_ATTEMPTS);
    isNoteUnlocked = !hasQuiz || (savedStatus === 'unlocked');
    isNoteOpen = false;

    // On page load/refresh/reopen: ALWAYS start in collapsed/hidden state!
    if (isPermanentlyLocked) {
      setPermanentlyLockedState();
    } else {
      setInitialLockedState();
    }
  }

  // Expose synchronization function globally for app.js login/signout hooks
  window.syncDailyNoteWithActiveUser = syncDailyNoteWithActiveUser;

  // Run initial state setup
  syncDailyNoteWithActiveUser();

  // Testing & Reset helper (accessible via Developer Console if needed)
  window.resetDailyNoteQuiz = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      console.log('Daily Note attempt reset for', activeRole);
      location.reload();
    } catch (e) {
      console.error(e);
    }
  };
});
