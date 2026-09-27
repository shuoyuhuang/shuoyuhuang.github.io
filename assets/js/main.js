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

  function setOpen(open) {
    toggle.classList.toggle('active', open);
    menu.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => {
    setOpen(!menu.classList.contains('active'));
  });

  // Close menu on link click
  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
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
// Chinese is the default and lives in index.html; it is snapshotted from the
// DOM on load. Only English strings are kept here, keyed by data-i18n.
(function () {
  const en = {
    'meta.title': 'Shuoyu Huang | Music Portfolio',
    'nav.about': 'About',
    'nav.portfolio': 'Portfolio',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'skip': 'Skip to content',
    'social.douyin': 'Douyin',
    'social.xhs': 'Xiaohongshu',
    'hero.tagline': 'Composer &middot; Music Producer &middot; Sound Designer',
    'hero.cta': 'Explore My Music',
    'about.title': 'About Me',
    'about.p1': 'I am an undergraduate in Digital Intelligent Music Engineering at <strong>Xinghai Conservatory of Music</strong>, currently interning at <strong>Alibaba\'s Future Life Lab</strong>, where I build evaluation sets and quality standards for AI music models. Previously, as a music &amp; audio operations intern at <strong>Bilibili Vsinger</strong>, I led music planning for the Luo Tianyi &times; Jingdezhen collaboration <em>Moon in the Glaze</em> and worked on virtual-singer album releases, a national tour, and brand partnerships.',
    'about.p2': 'Proficient in <strong>Logic Pro</strong>, <strong>Cubase</strong>, and leading AI music tools, I compose across guofeng, pop, electronic, and film scoring. My music has been featured in the national musical <em>The Echoes of Silk</em>, theatrical and university films, and a Michelin-starred restaurant, and earned an Excellence Award at the Guangdong-Hong Kong-Macao Music Technology Design Competition and a national Top 15 at MUSICACOUSTICA-HANGZHOU.',
    'about.p3': 'On Douyin I share my creative process and behind-the-scenes stories as 小猫很想你 and 追忆小猫, with <strong>220K followers</strong> and <strong>80M+ views</strong>.',
    'projects.title': 'Music Projects',
    'projects.desc': 'Music products I led or contributed to. Click through to the original release pages.',
    'portfolio.title': 'Music Portfolio',
    'track.forest.title': 'Forest <span class="track-cn">《林》</span>',
    'track.southern.title': 'Southern Water Rhythm <span class="track-cn">《南·水韵间》</span>',
    'track.summit.title': 'Summit of Light <span class="track-cn">《光明之巅》</span>',
    'track.together.title': 'Together &amp; Apart <span class="track-cn">《聚散》</span>',
    'track.along.title': 'Along the Way <span class="track-cn">《沿途》</span>',
    'track.midnight.title': 'Midnight Bloom <span class="track-cn">《子夜繁花》</span>',
    'track.forest.desc': 'Finalist at MUSICACOUSTICA-HANGZHOU 2024. A musical exploration where future and dreams intertwine, inspired by “Zhuangzi\'s Butterfly Dream.” The forest becomes a symbol of this journey, embodying time, life, and transformation.',
    'track.southern.desc': 'Award-winning entry at the Guangdong-Hong Kong-Macao Music Technology Design Competition. An applied electronic music piece themed around Lingnan dragon boat racing, built on traditional Chinese instruments and water-sound sampling.',
    'track.summit.desc': 'Composed for the national musical project <em>The Echoes of Silk</em>. The closing song of the musical, blending Chinese traditional style with folk instruments and Western orchestral arrangement.',
    'track.sparkling.desc': 'An original performance piece for the Sunset Pixel Band, featuring innovative songwriting with a modern ensemble configuration.',
    'track.together.desc': 'A therapeutic music piece created for people with depression. It symbolizes countless rivers, gentle streams and roaring currents, that converge and diverge, but will one day find their way back to the sea.',
    'track.along.desc': 'Theme song for the Harbin Institute of Technology (Shenzhen) official micro-film <em>Along the Way</em>. Full soundtrack composition and arrangement with deep involvement in the film\'s sonic narrative.',
    'track.midnight.desc': 'A modern jazz-folk song revolving around memory, regret, and self-reconciliation.',
    'track.do.desc': 'Scene music created for the Michelin one-star restaurant <em>Yu &middot; Min Cuisine</em>, inspired by a secluded island of tranquility amid a bustling urban ocean. Incorporates music therapy principles for an elevated dining experience.',
    'project.youzhongyue.title': 'Moon in the Glaze <span class="track-cn">《釉中月》</span>',
    'project.youzhongyue.meta': '2026.06 &middot; Luo Tianyi &times; Jingdezhen Porcelain Factory',
    'project.youzhongyue.desc': 'An original song for Luo Tianyi\'s 14th anniversary and the Jingdezhen intangible-heritage project “Porcelain Rhyme.” A moon reflected in the glaze tells of clay kneaded, glazed, painted, and fired over a thousand years. Released alongside a line of co-branded ceramics; 3M+ plays across platforms.',
    'project.youzhongyue.role': '<strong>Music Planning &middot; Music Producer &middot; Release</strong>Worked with the partner to define the theme and music plan from their materials, produced the song end to end, and managed its release.',
    'project.youzhongyue.link': 'Watch on Bilibili',
    'project.sichongzou.title': 'Quartet <span class="track-cn">《四重奏》</span>',
    'project.sichongzou.meta': '2026.07 &middot; Luo Tianyi 14th Anniversary Album',
    'project.sichongzou.desc': 'A commemorative album built around “four selves,” with eight new originals and four re-arranged classics, released worldwide on all major music platforms; 3M+ plays.',
    'project.sichongzou.role': '<strong>Music Audio Post-production</strong>Handled audio editing and post-production for all 12 tracks and coordinated release assets for the worldwide launch.',
    'project.sichongzou.link': 'Watch on Bilibili',
    'project.yuesheqingxian.title': 'Moonlit Strings <span class="track-cn">《月色清弦》</span>',
    'project.yuesheqingxian.meta': '2026.05 &middot; Mo Qingxian 8th Birthday Song',
    'project.yuesheqingxian.desc': 'Virtual singer Mo Qingxian\'s official 2026 birthday song. Framed by a silent crescent moon, it sings of unspoken longing at the end of memory; 300K+ plays.',
    'project.yuesheqingxian.role': '<strong>Music Supervision</strong>Supervised the song\'s production and quality from start to finish.',
    'project.yuesheqingxian.link': 'Watch on Bilibili',
    'project.tour.title': 'Luo Tianyi 2026 National Tour <span class="track-cn">「纯蓝幻乐」</span>',
    'project.tour.meta': '2026.07 &ndash; 08 &middot; Beijing / Hangzhou / Chengdu / Shanghai / Changsha / Guangzhou',
    'project.tour.desc': 'Luo Tianyi\'s 2026 “Infinite Resonance &middot; Pure Blue Fantasia” national tour, playing arenas in six cities and weaving local opera and folk songs into the show.',
    'project.tour.role': '<strong>Music Audio Post-production &middot; Concert MC Recording</strong>Handled music audio post-production for the tour and recorded and tuned the virtual singer\'s MC voice lines.',
    'project.tour.link': 'Watch on Bilibili',
    'project.ciyuan.title': 'Ciyuan Kuangxi ACG Concert <span class="track-cn">《次元狂喜》</span>',
    'project.ciyuan.meta': '2025.03 &middot; Yunmu Theater, Guangzhou',
    'project.ciyuan.desc': 'An ACG anime-music concert: a cosplaying ensemble of young performers reimagines classics from <em>Demon Slayer</em>, <em>Naruto</em>, <em>Evangelion</em>, and more with a classical-meets-rock lineup.',
    'project.ciyuan.role': '<strong>Original Music Producer &middot; Arrangement &middot; Mixing Desk</strong>Wrote and produced the original piece <em>Sparkling Love</em>, arranged several songs in the set, and ran multitrack recording and the mixing desk live.',
    'project.ciyuan.link': 'Event details',
    'project.role.label': 'My role',
    'contact.title': 'Get in Touch',
    'footer.top': 'Back to top',
    'footer.copyright': '&copy; 2026 Shuoyu Huang. All rights reserved.',
  };

  const nodes = document.querySelectorAll('[data-i18n]');
  const zh = { 'meta.title': document.title };
  nodes.forEach(function (el) {
    zh[el.getAttribute('data-i18n')] = el.innerHTML;
  });
  const translations = { zh: zh, en: en };

  const toggle = document.getElementById('lang-toggle');
  let currentLang = 'zh';

  function applyLang(lang) {
    const dict = translations[lang];
    nodes.forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.title = dict['meta.title'];
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    // The button shows the language you can switch *to*.
    toggle.textContent = lang === 'zh' ? 'EN' : '中文';
    toggle.lang = lang === 'zh' ? 'en' : 'zh-CN';
    toggle.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    currentLang = lang;
  }

  toggle.addEventListener('click', function () {
    applyLang(currentLang === 'zh' ? 'en' : 'zh');
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

  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
})();
