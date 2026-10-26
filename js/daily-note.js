/* =========================================================
   DAILY NOTE FOR PRINCESS DIGI
   With Apple Bottom Sheet Verification Quiz
   2-Attempts Rule:
   - 2 chances to answer.
   - If 1st answer is wrong: 1 more chance is given with gentle warning!
   - If 2nd answer is also wrong: Note is permanently locked.
   - On click, displays small subtitle below: "no more attemps".
   ========================================================= */

// =========================================================
// 👇 EDIT YOUR DAILY NOTE & QUIZ CONFIG HERE:
// =========================================================
const DAILY_NOTE_CONFIG = {
  // Unique question key (updating this automatically resets attempts for new questions)
  questionId: "digi_fav_part_2026_relocked",

  // Note message jo unlock hone par dikhega:
  noteText: `Baby , sometimes you know we love each others body to just know that itne time tak hmnr sirf pyar dekha 
                                                                             Arz Kiya Hai 
tu choo bhi le mai dekhun bhi nah 
kase chle vyapar tera .

tu choo bhi le mai dekhun bhi nah 
kase chle vyapar tera 

mai uljan me bhi sulzan dhundu 
tu h digi meri mai hu pyar tera .`,

  // Verification Quiz:
  quiz: {
    question: "Digi ka konsa body part virat ko sbse jyada pasand hai ?",
    correctOption: 4, // 4. Protein Wale BOOBS
    maxAttempts: 2, // 2 chances to open!
    options: [
      { id: 1, text: "Ras-malai jasi IceCreeam" },
      { id: 2, text: "Soft & Sexy Lips" },
      { id: 3, text: "Boom digi-digi Boom Boom" },
      { id: 4, text: "Protein Wale BOOBS", correct: true }
    ]
  },

  // Right-side date label:
  dateLabel: "Today"
};
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Get Active User Role ('digi' for 3009 vs 'user' for 1711)
  function getActiveUserRole() {
    try {
      const sess = JSON.parse(localStorage.getItem('viev_auth_session') || '{}');
      if (sess && (sess.code === '3009' || sess.role === 'digi')) return 'digi';
      if (sess && (sess.code === '1711' || sess.role === 'user')) return 'user';
      if (sess && sess.role) return sess.role;
    } catch(e) {}
    return 'digi';
  }

  // Storage Key tied strictly to active user role AND questionId
  const qId = (DAILY_NOTE_CONFIG.questionId || DAILY_NOTE_CONFIG.quiz.question || 'daily')
    .toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 32);
  const MAX_ATTEMPTS = (DAILY_NOTE_CONFIG.quiz && DAILY_NOTE_CONFIG.quiz.maxAttempts) || 2;

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
  let isNoteUnlocked = false;
  let isNoteOpen = false;

  // Daily Note Elements
  const noteCapsule = document.getElementById('daily-note-capsule');
  const noteTextEl = document.getElementById('daily-note-text');
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

  // Initialize Quiz Question & Options from Config
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

  // Set Initial Locked State (Before attempt has been made)
  function setInitialLockedState() {
    isNoteOpen = false;
    document.getElementById('welcome-screen')?.classList.remove('is-note-opened');
    if (noteCapsule) {
      noteCapsule.classList.add('is-revealed', 'is-locked');
      noteCapsule.classList.remove('is-permanently-locked');
    }
    if (noteTextEl) {
      noteTextEl.style.display = 'none';
    }
    if (lockedStateEl) {
      lockedStateEl.style.display = 'flex';
    }
    if (lockedLabelEl) {
      lockedLabelEl.textContent = isNoteUnlocked 
        ? 'UNLOCKED • TAP OPEN NOTE TO READ' 
        : 'LOCKED • TAP OPEN NOTE TO REVEAL';
    }
    if (lockedSubEl) {
      lockedSubEl.style.display = 'none';
    }
    if (noteTagEl) {
      noteTagEl.textContent = isNoteUnlocked ? 'UNLOCKED' : 'LOCKED';
      noteTagEl.classList.add('is-locked');
      noteTagEl.classList.remove('is-opened', 'is-permanently-locked');
    }
    if (noteBtnText) {
      noteBtnText.textContent = 'Open Note';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = ICON_LOCK;
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

  // Reveal Note Content
  function revealNote() {
    isNoteOpen = true;
    document.getElementById('welcome-screen')?.classList.add('is-note-opened');
    if (noteCapsule) {
      noteCapsule.classList.remove('is-locked', 'is-permanently-locked');
    }
    if (noteTextEl) {
      noteTextEl.style.display = 'block';
    }
    if (lockedStateEl) {
      lockedStateEl.style.display = 'none';
    }
    if (noteTagEl) {
      noteTagEl.textContent = 'OPENED';
      noteTagEl.classList.add('is-opened');
      noteTagEl.classList.remove('is-locked', 'is-permanently-locked');
    }
    if (noteBtnText) {
      noteBtnText.textContent = 'Hide Note';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = ICON_HIDE;
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('is-permanently-locked');
      toggleBtn.classList.add('is-opened-mode');
      toggleBtn.setAttribute('aria-label', 'Hide Note');
    }
    if (noteAttemptsSubtitle) {
      noteAttemptsSubtitle.style.display = 'none';
    }
  }

  // Hide Note Content (Returns to initial view, card stays visible)
  function hideNote() {
    setInitialLockedState();
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
      if (isNoteUnlocked) {
        // Already verified with correct answer! Direct show without asking quiz again!
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

    isPermanentlyLocked = (savedStatus === 'permanently_locked' || attemptsUsed >= MAX_ATTEMPTS);
    isNoteUnlocked = (savedStatus === 'unlocked');
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
