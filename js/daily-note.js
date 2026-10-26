/* =========================================================
   DAILY NOTE FOR PRINCESS DIGI
   With Apple Bottom Sheet Verification Quiz
   Card is visible to balance home page layout,
   Content locked/hidden until quiz answered correctly.
   ========================================================= */

// =========================================================
// 👇 EDIT YOUR DAILY NOTE & QUIZ CONFIG HERE:
// =========================================================
const DAILY_NOTE_CONFIG = {
  // Note message jo unlock hone par dikhega:
  noteText: `akhir mai kaise samaj jata tujhe phli nazar me jab tu dikhi thi  . 
" are  Khuda Ko bhi laga tha samay tujhe bnane me , jis kitab me tu likhi thi "`,

  // Verification Quiz:
  quiz: {
    question: "Select the cute word which is Most unique  and favourite amoung all options .",
    correctOption: 2, // 2. Beta
    options: [
      { id: 1, text: "Kanna" },
      { id: 2, text: "Beta", correct: true },
      { id: 3, text: "Digi" },
      { id: 4, text: "Bachaa" }
    ]
  },

  // Right-side date label:
  dateLabel: "Today"
};
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Daily Note Elements
  const noteCapsule = document.getElementById('daily-note-capsule');
  const noteTextEl = document.getElementById('daily-note-text');
  const noteDateEl = document.getElementById('daily-note-date');
  const noteTagEl = document.getElementById('daily-note-tag');
  const lockedStateEl = document.getElementById('daily-note-locked-state');

  // Toggle Button Elements
  const toggleBtn = document.getElementById('toggle-note-btn');
  const noteBtnText = document.getElementById('note-btn-text');
  const noteBtnIcon = document.getElementById('note-btn-icon');

  // Quiz Bottom Sheet Elements
  const quizSheet = document.getElementById('apple-note-quiz-sheet');
  const quizBackdrop = document.getElementById('quiz-backdrop');
  const quizCloseBtn = document.getElementById('quiz-close-btn');
  const quizOptionBtns = document.querySelectorAll('.quiz-option-btn');
  const quizFeedbackMsg = document.getElementById('quiz-feedback-msg');

  let isNoteOpen = false;

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

  // Set Initial Locked State (Card remains visible for visual balance)
  function setInitialLockedState() {
    isNoteOpen = false;
    if (noteCapsule) {
      noteCapsule.classList.add('is-revealed', 'is-locked');
    }
    if (noteTextEl) {
      noteTextEl.style.display = 'none';
    }
    if (lockedStateEl) {
      lockedStateEl.style.display = 'flex';
    }
    if (noteTagEl) {
      noteTagEl.textContent = 'LOCKED';
      noteTagEl.classList.add('is-locked');
      noteTagEl.classList.remove('is-opened');
    }
    if (noteBtnText) {
      noteBtnText.textContent = 'Open Note';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = ICON_LOCK;
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('is-opened-mode');
      toggleBtn.setAttribute('aria-label', 'Open Note');
    }
  }

  setInitialLockedState();

  // Open Quiz Bottom Sheet
  function openQuizSheet() {
    if (!quizSheet) return;
    // Reset options
    quizOptionBtns.forEach(btn => {
      btn.classList.remove('is-correct', 'is-wrong');
      btn.disabled = false;
    });
    if (quizFeedbackMsg) {
      quizFeedbackMsg.innerHTML = '';
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
    if (noteCapsule) {
      noteCapsule.classList.remove('is-locked');
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
      noteTagEl.classList.remove('is-locked');
    }
    if (noteBtnText) {
      noteBtnText.textContent = 'Hide Note';
    }
    if (noteBtnIcon) {
      noteBtnIcon.innerHTML = ICON_HIDE;
    }
    if (toggleBtn) {
      toggleBtn.classList.add('is-opened-mode');
      toggleBtn.setAttribute('aria-label', 'Hide Note');
    }
  }

  // Hide Note Content (Returns to Locked view, card stays visible)
  function hideNote() {
    setInitialLockedState();
  }

  // Toggle Button Click Handler
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isNoteOpen) {
        hideNote();
      } else {
        openQuizSheet();
      }
    });
  }

  // Close Bottom Sheet on '✕' button or backdrop click
  if (quizCloseBtn) {
    quizCloseBtn.addEventListener('click', closeQuizSheet);
  }
  if (quizBackdrop) {
    quizBackdrop.addEventListener('click', closeQuizSheet);
  }

  // Quiz Options Click Handler
  quizOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isCorrect = btn.getAttribute('data-correct') === 'true' || 
                        btn.getAttribute('data-option') === String(DAILY_NOTE_CONFIG.quiz.correctOption);

      if (isCorrect) {
        // Correct Answer Selected!
        btn.classList.add('is-correct');
        quizOptionBtns.forEach(b => b.disabled = true);

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
        // Wrong Answer Selected!
        btn.classList.add('is-wrong');
        if (quizFeedbackMsg) {
          quizFeedbackMsg.innerHTML = '<span class="feedback-wrong">Oops! Wrong answer, try again Princess 🥺</span>';
        }

        // Remove shake class after animation so user can try again
        setTimeout(() => {
          btn.classList.remove('is-wrong');
        }, 550);
      }
    });
  });
});
