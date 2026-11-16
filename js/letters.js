/**
 * LETTERS & ROYAL SIGNATURE ENGINE — DIGI OS 2.1 / 3.0
 * Handles Touch/Finger Calligraphy Canvas, Stamp Animation & Storage
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'viev_letter_signature_digi';
  const DATE_KEY = 'viev_letter_signed_date';

  let canvas = null;
  let ctx = null;
  let isDrawing = false;
  let hasDrawn = false;
  let lastX = 0;
  let lastY = 0;
  let points = [];

  // DOM Elements
  let modalOverlay = null;
  let triggerBtn = null;
  let closeBtn = null;
  let clearBtn = null;
  let saveBtn = null;
  let sigArea = null;

  function initLetters() {
    modalOverlay = document.getElementById('signature-modal-overlay');
    triggerBtn = document.getElementById('btn-open-signature-pad');
    closeBtn = document.getElementById('btn-close-signature-modal');
    clearBtn = document.getElementById('btn-clear-signature-pad');
    saveBtn = document.getElementById('btn-save-signature');
    sigArea = document.getElementById('letter-signature-area');
    canvas = document.getElementById('royal-signature-canvas');

    if (canvas) {
      ctx = canvas.getContext('2d');
      setupCanvasResolution();
      bindCanvasDrawing();
    }

    if (triggerBtn) {
      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSignatureModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSignatureModal();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearCanvas();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        saveSignature();
      });
    }

    // Close on overlay backdrop tap
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          closeSignatureModal();
        }
      });
    }

    // Resize canvas on orientation change / window resize
    window.addEventListener('resize', () => {
      if (modalOverlay && modalOverlay.classList.contains('is-open')) {
        setupCanvasResolution();
      }
    });

    // Render stored signature if available
    renderStoredSignature();
  }

  function setupCanvasResolution() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    // Save current content if any before resize
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#151928'; // Deep Royal Midnight Ink
    ctx.lineWidth = 3.2;

    // Restore previous drawing if existed
    if (hasDrawn && tempCanvas.width > 0) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }
  }

  function getCanvasCoords(e) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    if (!canvas || !ctx) return;
    if (e.cancelable) e.preventDefault();
    isDrawing = true;
    hasDrawn = true;
    points = [];

    const pos = getCanvasCoords(e);
    lastX = pos.x;
    lastY = pos.y;
    points.push({ x: lastX, y: lastY });

    // Draw single dot if tapped
    ctx.beginPath();
    ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }

  function drawMove(e) {
    if (!isDrawing || !ctx) return;
    if (e.cancelable) e.preventDefault();

    const pos = getCanvasCoords(e);
    points.push({ x: pos.x, y: pos.y });

    if (points.length >= 3) {
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      // Smooth midpoint quadratic curve
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastX = pos.x;
    lastY = pos.y;
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    if (e && e.cancelable) e.preventDefault();
    isDrawing = false;
    points = [];
  }

  function bindCanvasDrawing() {
    if (!canvas) return;

    // Touch events for mobile phones (strictly prevent gesture scrolling)
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', drawMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

    // Mouse events for desktop testing
    canvas.addEventListener('mousedown', startDrawing);
    window.addEventListener('mousemove', (e) => {
      if (isDrawing) drawMove(e);
    });
    window.addEventListener('mouseup', () => {
      if (isDrawing) stopDrawing();
    });
  }

  function clearCanvas() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    hasDrawn = false;
    points = [];
  }

  function openSignatureModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Delay slightly for DOM layout then refresh canvas scaling
    setTimeout(() => {
      setupCanvasResolution();
      clearCanvas();
    }, 60);
  }

  function closeSignatureModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function saveSignature() {
    if (!canvas || !hasDrawn) {
      if (saveBtn) {
        saveBtn.textContent = 'Pehle sign kijiye ✍️';
        setTimeout(() => {
          if (saveBtn) saveBtn.innerHTML = 'Save Signature ✓';
        }, 1400);
      }
      return;
    }

    // Export transparent PNG of signature
    const dataUrl = canvas.toDataURL('image/png');
    const nowStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    try {
      localStorage.setItem(STORAGE_KEY, dataUrl);
      localStorage.setItem(DATE_KEY, nowStr);
    } catch (e) {
      console.warn('Signature storage warning:', e);
    }

    closeSignatureModal();

    // Apply Stamp with landing animation
    applySignatureToLetter(dataUrl, nowStr, true);

    // Haptic vibration feedback
    if (navigator.vibrate) {
      try { navigator.vibrate([40, 50, 90]); } catch (_) {}
    }
  }

  function applySignatureToLetter(dataUrl, dateStr, animate = false) {
    if (!sigArea) return;

    sigArea.innerHTML = `
      <div class="letter-stamp-applied-wrap">
        <img src="${dataUrl}" alt="Signature of Avneet" class="letter-signature-image ${animate ? 'is-stamping' : ''}" />
        <div class="letter-approved-tag-line">- APPROVED BY AVNEET -</div>
        <div class="letter-signed-meta">Verified & Sealed on ${dateStr || '17 Nov 2026'}</div>
        <div class="letter-resign-action">
          <button type="button" class="letter-resign-btn" id="btn-resign-signature">Re-sign</button>
        </div>
      </div>
    `;

    const resignBtn = document.getElementById('btn-resign-signature');
    if (resignBtn) {
      resignBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSignatureModal();
      });
    }
  }

  function renderStoredSignature() {
    let savedSig = null;
    let savedDate = null;
    try {
      savedSig = localStorage.getItem(STORAGE_KEY);
      savedDate = localStorage.getItem(DATE_KEY);
    } catch (_) {}

    if (savedSig) {
      applySignatureToLetter(savedSig, savedDate, false);
    } else {
      // Show default "YOUR SIGNATURE" button
      if (sigArea) {
        sigArea.innerHTML = `
          <button type="button" class="btn-your-signature" id="btn-open-signature-pad">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
            <span>YOUR SIGNATURE</span>
          </button>
        `;
        const btn = document.getElementById('btn-open-signature-pad');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openSignatureModal();
          });
        }
      }
    }
  }

  // Global exposure
  window.vievLetters = {
    init: initLetters,
    openPad: openSignatureModal,
    clear: clearCanvas
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLetters);
  } else {
    initLetters();
  }
})();

