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

// ===== Language Toggle (i18n) =====
(function () {
  const translations = {
    en: {
      'nav.about': 'About',
      'nav.portfolio': 'Portfolio',
      'nav.aimusic': 'AI Music',
      'nav.contact': 'Contact',
      'hero.tagline': 'Composer &middot; Music Producer &middot; Sound Designer',
      'hero.cta': 'Explore My Music',
      'about.title': 'About Me',
      'about.p1': 'I am a music technology student at <strong>Xinghai Conservatory of Music</strong> (星海音乐学院), majoring in Digital Intelligent Music Engineering. My work spans Chinese traditional, pop, electronic, film scoring, and game audio, bridging cultural traditions with cutting-edge technology.',
      'about.p2': 'Proficient in <strong>Logic Pro</strong> and <strong>Cubase</strong>, I create across genres from guofeng to electronic music. I also work with AI music platforms such as <strong>Suno</strong>, <strong>Udio</strong>, and <strong>Mureka</strong>, and use <strong>TouchDesigner</strong> for audiovisual interactive experiences. My music has been featured in national-level musicals, satellite TV variety shows, theatrical films, and Michelin-starred restaurants. I have also composed for university micro-films, performed with modern ensembles, and produced therapeutic music grounded in traditional Chinese five-tone healing principles.',
      'about.p3': 'Beyond composing, I run a <strong>Douyin account with 130K followers</strong> and a growing <strong>Xiaohongshu community</strong>, sharing my creative process and connecting with listeners across China.',
      'portfolio.title': 'Music Portfolio',
      'track.forest.desc': 'Finalist at MUSICACOUSTICA-HANGZHOU 2024. A musical exploration where future and dreams intertwine, inspired by \u201cZhuangzi\'s Butterfly Dream.\u201d The forest becomes a symbol of this journey, embodying time, life, and transformation.',
      'track.southern.desc': 'Award-winning entry at the Guangdong-Hong Kong-Macao Music Technology Design Competition. An applied electronic music piece themed around Lingnan dragon boat racing, built on traditional Chinese instruments and water-sound sampling.',
      'track.summit.desc': 'Composed for the national musical project <em>The Echoes of Silk</em>. The closing song of the musical, blending Chinese traditional style with folk instruments and Western orchestral arrangement.',
      'track.sparkling.desc': 'An original performance piece for the Sunset Pixel Band, featuring innovative songwriting with a modern ensemble configuration.',
      'track.together.desc': 'A therapeutic music piece created for people with depression. It symbolizes countless rivers, gentle streams and roaring currents, that converge and diverge, but will one day find their way back to the sea.',
      'track.along.desc': 'Theme song for the Harbin Institute of Technology (Shenzhen) official micro-film <em>Along the Way</em>. Full soundtrack composition and arrangement with deep involvement in the film\'s sonic narrative.',
      'track.midnight.desc': 'A modern jazz-folk song revolving around memory, regret, and self-reconciliation.',
      'track.do.desc': 'Scene music created for the Michelin one-star restaurant <em>Yu &middot; Min Cuisine</em>, inspired by a secluded island of tranquility amid a bustling urban ocean. Incorporates music therapy principles for an elevated dining experience.',
      'aimusic.title': 'AI Music - Selected',
      'aimusic.desc': 'These tracks are AI-assisted compositions where I serve as the creative guide. I use AI as a collaborative tool in the loop: helping shape lyrics, melodies, and artistic direction. Each track is further refined through arrangement, mixing, and mastering in professional DAWs.',
      'contact.title': 'Get in Touch',
      'footer.copyright': '&copy; 2025 Shuoyu Huang. All rights reserved.',
    },
    zh: {
      'nav.about': '关于',
      'nav.portfolio': '作品集',
      'nav.aimusic': 'AI音乐',
      'nav.contact': '联系',
      'hero.tagline': '作曲 · 音乐制作人 · 声音设计师',
      'hero.cta': '探索我的音乐',
      'about.title': '关于我',
      'about.p1': '我是<strong>星海音乐学院</strong>音乐科技专业的学生，主修数智音乐工程方向。我的作品涵盖中国传统音乐、流行、电子、影视配乐和游戏音频等领域，致力于将文化传统与前沿技术相融合。',
      'about.p2': '熟练使用<strong>Logic Pro</strong>和<strong>Cubase</strong>，我的创作横跨国风到电子音乐等多种风格。同时，我也使用<strong>Suno</strong>、<strong>Udio</strong>、<strong>Mureka</strong>等AI音乐平台，以及<strong>TouchDesigner</strong>进行视听交互体验创作。我的音乐曾在国家级音乐剧、卫视综艺节目、院线电影和米其林星级餐厅中呈现。此外，我还为高校微电影作曲、参与现代乐团演出，并基于中国传统五音疗愈理论创作音乐疗愈作品。',
      'about.p3': '除了作曲，我还运营着一个拥有<strong>13万粉丝的抖音账号</strong>和不断成长的<strong>小红书社区</strong>，分享我的创作过程，与全国各地的听众建立连接。',
      'portfolio.title': '音乐作品集',
      'track.forest.desc': '2024杭州国际电子音乐节入围作品。这是一部探索未来与梦境交织的音乐作品，灵感源于\u201c庄周梦蝶\u201d。森林成为这一旅程的象征，蕴含着时间、生命与变幻的意象。',
      'track.southern.desc': '粤港澳音乐科技大会获奖作品。一部以岭南赛龙舟为主题，以民族乐器与水声采样为主要架构的应用类电子音乐。',
      'track.summit.desc': '为国家级音乐剧项目<em>《乐响丝绸》</em>而作。音乐剧的最后一首歌曲，以中国传统风格为主，将民族乐器与西方管弦乐编曲相结合。',
      'track.sparkling.desc': '落日像素乐团的原创演出曲目，以现代新型乐团的配置进行创新型单曲写作。',
      'track.together.desc': '一首针对抑郁症人群的音乐疗愈作品，象征千万河流，或是潺潺的小溪、或是奔腾的大江，会汇聚又离散，但终将有一天会殊途同归回到大海。',
      'track.along.desc': '哈尔滨工业大学（深圳）官方微电影<em>《沿途》</em>主题曲，全面负责电影的配乐作曲与编曲，深度参与影片的声音叙事。',
      'track.midnight.desc': '一首现代爵士民谣歌曲，围绕着回忆、遗憾与自我和解展开。',
      'track.do.desc': '为米其林一星餐厅<em>《屿·闽菜公馆》</em>创作的场景音乐，灵感来源于繁华的都市海洋之中有一方与世隔绝的静谧岛屿，融入音乐治疗理念，提升用餐体验。',
      'aimusic.title': 'AI音乐 - 精选',
      'aimusic.desc': '这些曲目是以我作为创意引导的AI辅助创作作品。我将AI作为协作工具参与创作流程：辅助歌词创作、旋律构思和艺术方向把控。每首曲目都在专业DAW中经过进一步的编曲、混音和母带处理。',
      'contact.title': '联系方式',
      'footer.copyright': '&copy; 2025 黄硕羽 版权所有',
    },
  };

  let currentLang = 'en';

  function applyLang(lang) {
    const dict = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });
    document.documentElement.lang = lang;
    currentLang = lang;
  }

  document.getElementById('lang-toggle').addEventListener('click', function () {
    var newLang = currentLang === 'en' ? 'zh' : 'en';
    applyLang(newLang);
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
