/* =========================================================
   THE GRAND MONUMENT: GOLDEN WALKWAY ENGINE
   Dedicated Milestone Walkway for Princess Digi & Virat
   Easily customizable milestone registry & liquid-glass UI
   ========================================================= */

(function () {
  'use strict';

  // --- MILESTONES ARCHIVE (Easily customizable for Virat) ---
  const MONUMENT_MILESTONES = [
    {
      id: 'day-1',
      dayNumber: 1,
      badge: 'Day 1 • Inception',
      title: 'The Genesis',
      subtitle: 'Where Our Story Quietly Began',
      date: 'Day One',
      icon: '✨',
      quote: '"Do ajnabi, ek aisi takdeer jisme humara milna pehle se tay tha."',
      story: 'The very first day that changed the universe for both of us. Out of billions of people in this world, our paths crossed, and the journey of a lifetime began.',
      isToday: false,
      isHorizon: false
    },
    {
      id: 'day-50',
      dayNumber: 50,
      badge: 'Day 50 • Bonding',
      title: 'Midnight Whispers',
      subtitle: 'Hours Felt Like Seconds With You',
      date: 'Day Fifty',
      icon: '🌙',
      quote: '"Baatein karte karte kab subah ho jati thi pata hi nahi chalta tha."',
      story: 'The late-night conversations under the moonlight, discovering every tiny habit, sharing laughs, and realizing that talking to you had become my favourite part of every single day.',
      isToday: false,
      isHorizon: false
    },
    {
      id: 'day-100',
      dayNumber: 100,
      badge: 'Day 100 • Milestone',
      title: 'The First Century',
      subtitle: '100 Days of Falling Deeper',
      date: 'Centennial Day',
      icon: '💎',
      quote: '"100 din dilon ke... har lamha aur pyara, har baat aur gehari."',
      story: 'Our first three-digit milestone. In just one hundred days, you became my safest home, my loudest laughter, and my deepest peace.',
      isToday: false,
      isHorizon: false
    },
    {
      id: 'day-180',
      dayNumber: 180,
      badge: 'Day 180 • Half-Year',
      title: 'Half a Year of Magic',
      subtitle: 'Stronger Through Every Emotion',
      date: 'Six Months',
      icon: '🕊️',
      quote: '"Har mausam pyara lagne laga, kyunki har mausam me tera sath tha."',
      story: 'Six months of understanding each other, embracing the silly arguments and making up with even sweeter hugs. Proof that our love only deepens with time.',
      isToday: false,
      isHorizon: false
    },
    {
      id: 'day-250',
      dayNumber: 250,
      badge: 'Day 250 • Memories',
      title: 'Cherished Dates & Movie Magic',
      subtitle: 'Moments Carved Into Eternity',
      date: 'November 2026',
      icon: '🎬',
      quote: '"Wo CP67 ki movie, wo pyari dates, aur teri wo muskaan jo dil me bas gayi."',
      story: 'From watching special movies together at CP67 to laughing over sweet moments. Each memory from this phase is permanently etched in gold in this monument.',
      isToday: false,
      isHorizon: false
    },
    {
      id: 'day-today',
      dayNumber: 294,
      badge: 'Day 294 • Living Today',
      title: 'The Living Pulse',
      subtitle: 'Our Beautiful Present Day',
      date: 'Today & Now',
      icon: '🌟',
      quote: '"Aaj bhi tujhe utna hi chahta hu, balki har guzarate second ke sath aur zyada."',
      story: 'Every second ticking on this clock is dedicated to you. Today is another golden brick in the grand monument of our love.',
      isToday: true,
      isHorizon: false
    },
    {
      id: 'day-forever',
      dayNumber: '∞',
      badge: 'Forever Ahead',
      title: 'The Infinite Horizon',
      subtitle: 'An Eternity of Us Waiting Ahead',
      date: 'Into The Future',
      icon: '♾️',
      quote: '"Ye rasta kabhi khatam nahi hoga... Ye to bas humari shuruaat hai."',
      story: 'Day 365, Day 1000, Day 10,000 and beyond. No matter how far the road goes, I will walk every single step holding your hand. Forever and always, my baby.',
      isToday: false,
      isHorizon: true
    }
  ];

  let isInitialized = false;
  let canvasAnimId = null;

  // --- RENDER WALKWAY HTML ---
  function renderWalkway() {
    const listEl = document.getElementById('monument-walkway-list');
    if (!listEl) return;

    listEl.innerHTML = MONUMENT_MILESTONES.map((item) => {
      const todayClass = item.isToday ? ' is-today' : '';
      const horizonClass = item.isHorizon ? ' is-horizon' : '';
      const dayDisplay = typeof item.dayNumber === 'number' ? `DAY ${item.dayNumber}` : item.dayNumber;

      return `
        <div class="monument-item${todayClass}${horizonClass}" data-milestone-id="${item.id}">
          <div class="monument-node-anchor">
            <div class="monument-node-orb" aria-hidden="true">${item.icon}</div>
          </div>
          <div class="monument-card" role="button" tabindex="0">
            <div class="monument-card-top">
              <span class="monument-day-badge">${dayDisplay}</span>
              <span class="monument-date-label">${item.date}</span>
            </div>
            <h3 class="monument-card-title">${item.title}</h3>
            <div class="monument-card-subtitle">${item.subtitle}</div>
            <p class="monument-card-desc">${item.story.substring(0, 85)}...</p>
            <div class="monument-card-footer">
              <span class="monument-card-hint">View Memory Plaque ✦</span>
              <span class="monument-card-arrow" aria-hidden="true">→</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    listEl.querySelectorAll('.monument-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-milestone-id');
        openMilestoneModal(id);
      });
    });
  }

  // --- AMBIENT CANVAS GOLDEN DUST PARTICLES ---
  function initAmbientCanvas() {
    const canvas = document.getElementById('monument-stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const COUNT = 45;

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.5,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.45 - 0.15,
        opacity: Math.random() * 0.65 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.4 ? 'rgba(255, 215, 120,' : 'rgba(255, 255, 255,'
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        p.opacity += Math.sin(Date.now() * p.pulseSpeed * 0.05) * 0.008;
        const currentOpacity = Math.max(0.15, Math.min(0.85, p.opacity));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${currentOpacity})`;
        ctx.shadowBlur = p.r * 4;
        ctx.shadowColor = '#d4af37';
        ctx.fill();
      });

      canvasAnimId = requestAnimationFrame(animate);
    }

    if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
    animate();
  }

  // --- DETAIL MODAL LOGIC ---
  function openMilestoneModal(id) {
    const item = MONUMENT_MILESTONES.find(m => m.id === id);
    if (!item) return;

    const modal = document.getElementById('monument-detail-modal');
    if (!modal) return;

    const sealEl = document.getElementById('monument-modal-seal');
    const badgeEl = document.getElementById('monument-modal-badge');
    const titleEl = document.getElementById('monument-modal-title');
    const subEl = document.getElementById('monument-modal-subtitle');
    const quoteEl = document.getElementById('monument-modal-quote-text');
    const storyEl = document.getElementById('monument-modal-story');

    if (sealEl) sealEl.textContent = item.icon;
    if (badgeEl) badgeEl.textContent = item.badge;
    if (titleEl) titleEl.textContent = item.title;
    if (subEl) subEl.textContent = item.subtitle;
    if (quoteEl) quoteEl.textContent = item.quote;
    if (storyEl) storyEl.textContent = item.story;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeMilestoneModal() {
    const modal = document.getElementById('monument-detail-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // --- INITIALIZATION ---
  function init() {
    renderWalkway();
    initAmbientCanvas();

    // Close buttons on modal
    const closeBtn = document.getElementById('monument-modal-close-btn');
    const doneBtn = document.getElementById('monument-modal-done-btn');
    const backdrop = document.getElementById('monument-modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeMilestoneModal);
    if (doneBtn) doneBtn.addEventListener('click', closeMilestoneModal);
    if (backdrop) backdrop.addEventListener('click', closeMilestoneModal);

    isInitialized = true;
  }

  // Expose global controller
  window.vievMonument = {
    init: function () {
      if (!isInitialized) {
        init();
      } else {
        renderWalkway();
      }
    },
    getMilestones: () => MONUMENT_MILESTONES,
    openMilestone: openMilestoneModal,
    closeMilestone: closeMilestoneModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Lazy init when subpage is accessed
    });
  }
})();
