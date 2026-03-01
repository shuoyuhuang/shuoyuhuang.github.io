// ===== Particle Background =====
(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;
  let mouse = { x: null, y: null };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const lineOpacity = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Mouse interaction
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const lineOpacity = (1 - dist / 200) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(167, 139, 250, ${lineOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(drawParticles);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  initParticles();
  drawParticles();
})();

// ===== Navbar Scroll Effect =====
(function () {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
})();

// ===== Mobile Navigation Toggle =====
(function () {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close menu on link click
  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });
})();

// ===== Audio Player =====
(function () {
  let currentAudio = null;
  let currentBtn = null;
  let currentFill = null;
  let currentTimeEl = null;
  let currentDurationEl = null;

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function stopCurrent() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeEventListener('timeupdate', onTimeUpdate);
      currentAudio.removeEventListener('ended', onEnded);
      currentAudio.removeEventListener('loadedmetadata', onMetadata);
      if (currentBtn) currentBtn.classList.remove('playing');
      if (currentFill) currentFill.style.width = '0%';
      currentAudio = null;
      currentBtn = null;
      currentFill = null;
      currentTimeEl = null;
      currentDurationEl = null;
    }
  }

  function onTimeUpdate() {
    if (!currentAudio || !currentFill) return;
    const pct = (currentAudio.currentTime / currentAudio.duration) * 100;
    currentFill.style.width = pct + '%';
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentAudio.currentTime);
  }

  function onMetadata() {
    if (currentDurationEl && currentAudio) {
      currentDurationEl.textContent = formatTime(currentAudio.duration);
    }
  }

  function onEnded() {
    if (currentBtn) currentBtn.classList.remove('playing');
    if (currentFill) currentFill.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    currentAudio = null;
    currentBtn = null;
    currentFill = null;
    currentTimeEl = null;
    currentDurationEl = null;
  }

  document.querySelectorAll('.audio-player').forEach((player) => {
    const src = player.getAttribute('data-src');
    const btn = player.querySelector('.play-btn');
    const fill = player.querySelector('.progress-fill');
    const bar = player.querySelector('.progress-bar');
    const timeEl = player.querySelector('.current-time');
    const durEl = player.querySelector('.duration');

    // Preload metadata to show duration before playing
    const preloadAudio = new Audio();
    preloadAudio.preload = 'metadata';
    preloadAudio.src = src;
    preloadAudio.addEventListener('loadedmetadata', () => {
      durEl.textContent = formatTime(preloadAudio.duration);
    });

    btn.addEventListener('click', () => {
      // If this is the currently playing track, toggle pause/play
      if (currentAudio && currentBtn === btn) {
        if (currentAudio.paused) {
          currentAudio.play();
          btn.classList.add('playing');
        } else {
          currentAudio.pause();
          btn.classList.remove('playing');
        }
        return;
      }

      // Stop any currently playing track
      stopCurrent();

      // Create new audio
      const audio = new Audio(src);
      currentAudio = audio;
      currentBtn = btn;
      currentFill = fill;
      currentTimeEl = timeEl;
      currentDurationEl = durEl;

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('loadedmetadata', onMetadata);

      audio.play();
      btn.classList.add('playing');
    });

    // Click on progress bar to seek
    bar.addEventListener('click', (e) => {
      if (!currentAudio || currentBtn !== btn) return;
      const rect = bar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      currentAudio.currentTime = pct * currentAudio.duration;
    });
  });
})();

// ===== Scroll Reveal =====
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  document.querySelectorAll('.track-card, .about-content p').forEach((el) => {
    observer.observe(el);
  });
})();
