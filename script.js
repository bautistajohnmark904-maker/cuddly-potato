document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. STICKY HEADER SHADOW
  ========================================================= */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =========================================================
     2. MOBILE MENU TOGGLE
  ========================================================= */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* =========================================================
     3. SCROLLSPY — highlight active nav link
  ========================================================= */
  const sections = ['top', 'into', 'shelf', 'about', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navByHref = new Map();
  document.querySelectorAll('[data-nav]').forEach(a => {
    navByHref.set(a.getAttribute('href').replace('#', ''), a);
  });

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('[data-nav]').forEach(a => a.classList.remove('active'));
        const link = navByHref.get(entry.target.id);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));

  /* =========================================================
     4. GYM CARD — ANIMATED COUNTERS (runs once, on scroll into view)
  ========================================================= */
  const counterEls = document.querySelectorAll('.stat-num');
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counterEls.forEach(el => counterObserver.observe(el));

  /* =========================================================
     5. GUITAR CARD — WORKING METRONOME (Web Audio API)
  ========================================================= */
  const metroToggle = document.getElementById('metroToggle');
  const metroLabel = document.getElementById('metroLabel');
  const bpmSlider = document.getElementById('bpmSlider');
  const bpmValue = document.getElementById('bpmValue');
  const metroPulse = document.getElementById('metroPulse');

  let audioCtx = null;
  let metroTimer = null;
  let isPlaying = false;
  let currentBpm = parseInt(bpmSlider.value, 10);

  const playClick = () => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 1000;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);

    metroPulse.classList.add('pulse-on');
    setTimeout(() => metroPulse.classList.remove('pulse-on'), 90);
  };

  const startMetronome = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    stopMetronome();
    const interval = 60000 / currentBpm;
    playClick();
    metroTimer = setInterval(playClick, interval);
    isPlaying = true;
    metroToggle.setAttribute('aria-pressed', 'true');
    metroLabel.textContent = 'Stop';
  };

  const stopMetronome = () => {
    if (metroTimer) clearInterval(metroTimer);
    metroTimer = null;
  };

  metroToggle.addEventListener('click', () => {
    if (isPlaying) {
      stopMetronome();
      isPlaying = false;
      metroToggle.setAttribute('aria-pressed', 'false');
      metroLabel.textContent = 'Play';
    } else {
      startMetronome();
    }
  });

  bpmSlider.addEventListener('input', (e) => {
    currentBpm = parseInt(e.target.value, 10);
    bpmValue.textContent = currentBpm;
    if (isPlaying) startMetronome(); // restart at new tempo
  });

  /* =========================================================
     6. PSYCHOLOGY CARD — QUOTE / INSIGHT ROTATOR
  ========================================================= */
  const insights = [
    "Every habit is just a decision you no longer have to make.",
    "The brain treats a repeated thought like a well-worn path — easier each time.",
    "Motivation follows action more often than it leads it.",
    "Most anxiety is your brain rehearsing a future that hasn't happened yet.",
    "Behavior change sticks when identity changes first.",
    "Attention is the one resource you can't multitask your way around.",
    "Comparing your chapter one to someone else's chapter twenty rarely ends well."
  ];
  let lastIndex = -1;
  const quoteText = document.getElementById('quoteText');
  const nextQuoteBtn = document.getElementById('nextQuoteBtn');

  nextQuoteBtn.addEventListener('click', () => {
    let idx;
    do {
      idx = Math.floor(Math.random() * insights.length);
    } while (idx === lastIndex && insights.length > 1);
    lastIndex = idx;
    quoteText.style.opacity = 0;
    setTimeout(() => {
      quoteText.textContent = insights[idx];
      quoteText.style.opacity = 1;
    }, 150);
  });
  quoteText.style.transition = 'opacity .15s ease';

  /* =========================================================
     7. CONTACT FORM — validation + mailto handoff
  ========================================================= */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const DESTINATION_EMAIL = 'johnmark.bautista@email.com'; // TODO: replace with real email

  const showError = (fieldName, message) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    field.closest('.field').classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.fromName.value.trim();
    const email = form.fromEmail.value.trim();
    const message = form.messageBody.value.trim();

    let valid = true;
    if (!name) { showError('fromName', 'Please enter your name.'); valid = false; }
    else showError('fromName', '');

    if (!email) { showError('fromEmail', 'Please enter your email.'); valid = false; }
    else if (!isValidEmail(email)) { showError('fromEmail', 'That email looks off.'); valid = false; }
    else showError('fromEmail', '');

    if (!message) { showError('messageBody', 'Say something first!'); valid = false; }
    else showError('messageBody', '');

    if (!valid) {
      formStatus.textContent = '';
      return;
    }

    const subject = encodeURIComponent(`Message from ${name} via your site`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${DESTINATION_EMAIL}?subject=${subject}&body=${body}`;

    formStatus.textContent = 'Opening your email app…';
    form.reset();
  });

  /* =========================================================
     8. COPY EMAIL BUTTON
  ========================================================= */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const originalCopyLabel = copyEmailBtn.textContent;

  copyEmailBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(DESTINATION_EMAIL);
      copyEmailBtn.textContent = 'Copied!';
    } catch (err) {
      copyEmailBtn.textContent = 'Copy failed — select manually';
    }
    setTimeout(() => { copyEmailBtn.textContent = originalCopyLabel; }, 1800);
  });

  /* =========================================================
     9. FOOTER YEAR
  ========================================================= */
  document.getElementById('footerYear').textContent = new Date().getFullYear();

});