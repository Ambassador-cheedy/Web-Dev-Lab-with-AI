/* AutoParts Benin — interactions & motion */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  gsap.registerPlugin(ScrollTrigger);

  const XOF_PER_GBP = 775; // matches the brief's 1.55M XOF ≈ £2,000
  let currency = 'xof';

  /* ── Image fallback: keep the layout premium if a photo can't load ── */
  $$('img.media').forEach(img => {
    const fail = () => img.parentElement.classList.add('no-img');
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail, { once: true });
  });

  /* ── Smooth scroll ── */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  const scrollToTarget = target => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ── Menu ── */
  const burger = $('.nav__burger');
  const menu = $('.menu');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) gsap.fromTo($$('a', menu), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .06, duration: .9, ease: 'expo.out', delay: .2 });
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    if (document.body.classList.contains('menu-open')) setMenu(false);
    scrollToTarget(href);
  }));

  /* ── Split headings into words ── */
  const splitWords = root => {
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(root);
  };
  $$('.split').forEach(splitWords);

  /* ── Number formatting / counters ── */
  const fmt = (n, sep) => sep ? Math.round(n).toLocaleString('en-US') : Math.round(n).toString();
  const runCount = el => {
    const to = parseFloat(el.dataset.to);
    const sep = el.dataset.sep;
    if (reduce || to === 0) { el.textContent = fmt(to, sep); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v, sep)) });
  };

  /* ── Reduced motion: show everything, build charts, skip choreography ── */
  const loader = $('.loader');
  if (reduce) {
    loader.remove();
    document.body.classList.remove('is-loading');
    $$('.count').forEach(runCount);
    initCharts(true);
    bindUI();
    return;
  }

  /* ── Initial states ── */
  gsap.set('.hero__title .line > span', { yPercent: 110 });
  gsap.set('.hero .reveal-up', { y: 30, opacity: 0 });
  gsap.set('.nav', { yPercent: -100, opacity: 0 });
  gsap.set('.hero__disc', { scale: .6, opacity: 0, rotate: -90 });
  gsap.set('.hero__media img', { scale: 1.35 });

  /* ── Preloader ── */
  const countEl = $('.loader__count span');
  const prog = { v: 0 };
  const loadTl = gsap.timeline({ onComplete: intro });
  loadTl.to(prog, {
    v: 100, duration: 1.6, ease: 'power2.inOut',
    onUpdate: () => {
      countEl.textContent = Math.round(prog.v);
      gsap.set('.loader__bar i', { scaleX: prog.v / 100 });
    }
  });

  function intro() {
    const tl = gsap.timeline({
      onComplete: () => {
        loader.remove();
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      }
    });
    tl.to('.loader__inner', { y: -30, opacity: 0, duration: .5, ease: 'power2.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.1')
      .to('.hero__media img', { scale: 1.15, duration: 2.2, ease: 'expo.out' }, '-=.8')
      .to('.hero__title .line > span', { yPercent: 0, duration: 1.3, stagger: .1, ease: 'expo.out' }, '-=2')
      .to('.hero .reveal-up', { y: 0, opacity: 1, duration: 1.1, stagger: .12, ease: 'expo.out' }, '-=1.1')
      .to('.hero__disc', { scale: 1, opacity: .75, rotate: 0, duration: 2, ease: 'expo.out' }, '-=1.6')
      .to('.nav', { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out' }, '-=1.6');
  }

  /* ── Hero scroll motion ── */
  gsap.to('.hero__media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { yPercent: -25, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__disc', { rotate: 360, yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('.hero__disc g, .hero__disc circle:nth-of-type(2)', { rotate: 360, transformOrigin: '200px 200px', duration: 40, ease: 'none', repeat: -1 });

  /* Marquee reacts to scroll velocity */
  const track = $('.marquee__track');
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: self => {
      const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500);
      gsap.to(track, { skewX: -v * 8, duration: .4, overwrite: 'auto' });
    }
  });

  /* ── Nav: background, hide on scroll down, progress, active link ── */
  const nav = $('.nav');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      nav.classList.toggle('is-scrolled', self.scroll() > 40);
      nav.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > window.innerHeight * .8 && !document.body.classList.contains('menu-open'));
      gsap.set('.nav__progress i', { scaleX: self.progress });
    }
  });
  ['opportunity', 'research', 'model', 'plan', 'requirements'].forEach(id => {
    const link = $(`.nav__links a[href="#${id}"]`);
    ScrollTrigger.create({ trigger: `#${id}`, start: 'top 50%', end: 'bottom 50%', onToggle: s => link.classList.toggle('is-active', s.isActive) });
  });

  /* ── Generic reveals ── */
  $$('.split').forEach(el => {
    gsap.from($$('.w > span', el), {
      yPercent: 110, duration: 1.2, stagger: .06, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
  $$('.reveal-up').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  $$('.section__num').forEach(el => {
    gsap.from(el, { width: 0, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* Counters */
  $$('.count').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => runCount(el) }));

  /* Stats stagger */
  gsap.from('.stat', { y: 80, opacity: 0, rotateX: -12, duration: 1.3, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 82%' } });

  /* Matrix rows */
  gsap.from('.matrix tbody tr', { x: -30, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.matrix', start: 'top 80%' } });
  gsap.from('.matrix tr.us', { scale: .96, duration: 1.2, ease: 'elastic.out(1, .6)', delay: .5, scrollTrigger: { trigger: '.matrix', start: 'top 80%' } });

  /* ── Cinematic break: frame opens as you scroll ── */
  gsap.timeline({ scrollTrigger: { trigger: '.cine', start: 'top 80%', end: 'center center', scrub: 1 } })
    .to('.cine__frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' })
    .to('.cine__frame img', { scale: 1, ease: 'none' }, 0);
  gsap.from('.cine__text > *', { y: 60, opacity: 0, stagger: .12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cine', start: 'center 70%' } });

  /* ── Forces: sticky image swaps with each argument ── */
  const fimgs = $$('.fimg');
  const counter = $('.forces__counter .cur');
  $$('.force').forEach((f, i) => {
    ScrollTrigger.create({
      trigger: f, start: 'top 55%', end: 'bottom 55%',
      onToggle: s => {
        f.classList.toggle('is-active', s.isActive);
        if (!s.isActive) return;
        fimgs.forEach((img, j) => img.classList.toggle('is-active', j === i));
        counter.textContent = String(i + 1).padStart(2, '0');
      }
    });
  });

  /* Phone band parallax */
  gsap.to('.phone-band__img img', { yPercent: -10, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.phone-band', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Tiers + journey */
  gsap.from('.tier', { y: 80, opacity: 0, duration: 1.2, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.tiers', start: 'top 82%' } });
  const mmJ = gsap.matchMedia();
  mmJ.add('(min-width: 901px)', () => {
    gsap.to('.journey__line i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top 75%', end: 'bottom 60%', scrub: 1 } });
  });
  mmJ.add('(max-width: 900px)', () => {
    gsap.to('.journey__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.journey__track', start: 'top 70%', end: 'bottom 50%', scrub: 1 } });
  });
  gsap.from('.step', { y: 30, opacity: 0, duration: 1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.journey__track', start: 'top 80%' } });

  /* Moves */
  $$('.move').forEach((m, i) => {
    gsap.from(m, { y: 100, opacity: 0, duration: 1.3, delay: i * .08, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 88%' } });
    gsap.fromTo($('.move__img', m), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, delay: i * .08 + .15, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 88%' } });
  });

  /* ── 90-day plan: horizontal pinned scroll on wide screens ── */
  const dayEl = $('.plan__day');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 801px)', () => {
    const trackEl = $('.plan__track');
    const dist = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.plan', pin: '.plan__pin', start: 'top top',
        end: () => '+=' + (dist() + window.innerHeight * .6),
        scrub: 1, invalidateOnRefresh: true,
        onUpdate: s => (dayEl.textContent = 'Day ' + Math.round(s.progress * 90))
      }
    });
    tl.to(trackEl, { x: () => -dist(), ease: 'none' }, 0)
      .to('.plan__rail i', { scaleX: 1, ease: 'none' }, 0);
  });
  mm.add('(max-width: 800px)', () => {
    gsap.to('.plan__rail i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.plan', start: 'top 60%', end: 'bottom bottom', scrub: true, onUpdate: s => (dayEl.textContent = 'Day ' + Math.round(s.progress * 90)) } });
    $$('.phase').forEach(p => gsap.from(p, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 88%' } }));
  });

  /* Requirements */
  gsap.from('.roles li', { y: 20, opacity: 0, stagger: .06, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.req-summary', start: 'top 85%' } });
  gsap.from('.req', { y: 90, opacity: 0, duration: 1.3, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.reqs', start: 'top 82%' } });
  $$('.req').forEach((r, i) => {
    const st = { trigger: '.reqs', start: 'top 82%' };
    gsap.fromTo(r, { '--bar': 0 }, { '--bar': 1, duration: 1.2, delay: .3 + i * .1, ease: 'expo.inOut', scrollTrigger: st });
    gsap.from($$('.req__list li', r), { x: -16, opacity: 0, duration: .8, stagger: .05, delay: .5 + i * .1, ease: 'expo.out', scrollTrigger: st });
  });

  /* Discovery questions */
  $$('.q').forEach((q, i) => {
    const st = { trigger: q, start: 'top 82%' };
    gsap.from(q, { y: 90, opacity: 0, duration: 1.3, delay: i * .1, ease: 'expo.out', scrollTrigger: st });
    gsap.from($('.q__big', q), { yPercent: 40, opacity: 0, duration: 1.6, delay: .2 + i * .1, ease: 'expo.out', scrollTrigger: st });
    gsap.from($$('.q__list li, .q__answer, .q__impl', q), { y: 20, opacity: 0, duration: .9, stagger: .07, delay: .4 + i * .1, ease: 'expo.out', scrollTrigger: st });
    gsap.to($('.q__big', q), { yPercent: -25, ease: 'none', scrollTrigger: { trigger: q, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Chain list */
  gsap.from('.chain li', { x: 30, opacity: 0, stagger: .15, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.chain', start: 'top 85%' } });

  /* CTA */
  gsap.fromTo('.cta__media', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.cta .lead, .signup', { y: 40, opacity: 0, stagger: .12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 55%' } });
  gsap.from('.foot__logo', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 95%' } });

  /* Charts build when scrolled into view */
  ScrollTrigger.create({ trigger: '.charts', start: 'top 80%', once: true, onEnter: () => initCharts(false, 'research') });
  ScrollTrigger.create({ trigger: '.rev', start: 'top 80%', once: true, onEnter: () => initCharts(false, 'rev') });

  /* ── Pointer niceties ── */
  if (finePointer) {
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const dx = gsap.quickTo(dot, 'x', { duration: .15 }), dy = gsap.quickTo(dot, 'y', { duration: .15 });
    const rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
    window.addEventListener('pointermove', e => { cursor.classList.add('is-live'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    $$('a, button, .tilt, .seg label, input').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });

    $$('.magnetic').forEach(btn => {
      const inner = $('span', btn);
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * .25, y: y * .35, duration: .6, ease: 'power3.out' });
        gsap.to(inner, { x: x * .12, y: y * .15, duration: .6, ease: 'power3.out' });
      });
      btn.addEventListener('pointerleave', () => gsap.to([btn, inner], { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .4)' }));
    });

    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        gsap.to(card, { rotateY: (px - .5) * 10, rotateX: (.5 - py) * 10, transformPerspective: 900, duration: .6, ease: 'power3.out' });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1, .5)' }));
    });
  }

  bindUI();
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* ═════════ Charts ═════════ */
  function initCharts(instant, which) {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
    Chart.defaults.color = '#8591AD';
    const grid = 'rgba(42,51,80,.6)';
    const anim = instant ? false : { duration: 1600, easing: 'easeOutQuart' };

    if (!which || which === 'research') {
      new Chart($('#payChart'), {
        type: 'doughnut',
        data: {
          labels: ['Mobile Money (MTN/Moov)', 'Cash on delivery', 'Debit/credit card', 'Bank transfer'],
          datasets: [{ data: [60, 22, 12, 6], backgroundColor: ['#3B6FE8', '#E8A020', '#6B7896', '#2A3350'], borderColor: '#141927', borderWidth: 4, hoverOffset: 10 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '72%', animation: anim && { ...anim, animateRotate: true },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw}%` } } }
        }
      });

      const ctx = $('#tradeChart').getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 280);
      g.addColorStop(0, 'rgba(106,148,245,.95)');
      g.addColorStop(1, 'rgba(59,111,232,.15)');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
          datasets: [{ label: 'UK vehicle exports to West Africa (£M)', data: [148, 122, 161, 175, 183, 191], backgroundColor: (c) => c.dataIndex === 5 ? '#E8A020' : g, borderRadius: 8, borderSkipped: false, maxBarThickness: 44 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: anim && { ...anim, delay: c => c.dataIndex * 120 },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` £${c.raw}M` } } },
          scales: {
            x: { grid: { display: false }, border: { display: false } },
            y: { min: 100, grid: { color: grid }, border: { display: false }, ticks: { callback: v => '£' + v + 'M' } }
          }
        }
      });
    }

    if (!which || which === 'rev') {
      const subs = [0, 0, 680000, 1100000, 2400000, 3800000, 5200000, 6800000, 8500000, 11000000, 14000000, 17500000];
      const feat = [0, 0, 90000, 450000, 600000, 900000, 1200000, 1580000, 1800000, 2500000, 3200000, 4000000];
      window.__revChart = new Chart($('#revChart'), {
        type: 'bar',
        data: {
          labels: ['Q1 Y1', 'Q2 Y1', 'Q3 Y1', 'Q4 Y1', 'Q1 Y2', 'Q2 Y2', 'Q3 Y2', 'Q4 Y2', 'Q1 Y3', 'Q2 Y3', 'Q3 Y3', 'Q4 Y3'],
          datasets: [
            { label: 'Subscriptions', data: subs.slice(), _xof: subs, backgroundColor: '#3B6FE8', borderRadius: 6, stack: 'r', maxBarThickness: 48 },
            { label: 'Featured listings', data: feat.slice(), _xof: feat, backgroundColor: '#E8A020', borderRadius: 6, stack: 'r', maxBarThickness: 48 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: anim && { ...anim, delay: c => (c.type === 'data' ? c.dataIndex * 70 + c.datasetIndex * 250 : 0) },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'bottom', align: 'start', labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 20 } },
            tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${money(c.raw)}` } }
          },
          scales: {
            x: { stacked: true, grid: { display: false }, border: { display: false } },
            y: { stacked: true, grid: { color: grid }, border: { display: false }, ticks: { callback: v => money(v, true) } }
          }
        }
      });
    }
  }

  /* ═════════ Currency toggle + form ═════════ */
  function money(v, short) {
    if (currency === 'gbp') {
      return v >= 1000 ? '£' + (v / 1000).toFixed(short ? 0 : 1) + 'K' : '£' + Math.round(v);
    }
    if (v >= 1e6) return (v / 1e6).toFixed(short ? 0 : 2) + 'M XOF';
    return (v / 1e3).toFixed(0) + 'K XOF';
  }

  function bindUI() {
    /* Analysis tabs */
    const tabs = $$('.tab');
    const ink = $('.tabs__ink');
    const placeInk = tab => {
      ink.style.width = tab.offsetWidth + 'px';
      ink.style.transform = `translateX(${tab.offsetLeft}px)`;
      ink.style.setProperty('--ink', getComputedStyle(tab).getPropertyValue('--c'));
    };
    const selectTab = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      placeInk(tab);
      if (focus) tab.focus();
      const panel = $('#' + tab.getAttribute('aria-controls'));
      if (!reduce) {
        gsap.fromTo($$('.card', panel), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'expo.out', overwrite: true });
        const bars = $$('.sev-bar i', panel);
        if (bars.length) gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 1, stagger: .12, ease: 'expo.inOut' });
      }
      ScrollTrigger.refresh();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => selectTab(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        selectTab(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
    const placeActive = () => placeInk($('.tab[aria-selected="true"]'));
    placeActive();
    window.addEventListener('resize', placeActive);
    if (document.fonts) document.fonts.ready.then(placeActive);

    const toggle = $('.toggle');
    $$('button', toggle).forEach(b => b.addEventListener('click', () => {
      if (b.dataset.cur === currency) return;
      currency = b.dataset.cur;
      $$('button', toggle).forEach(x => x.classList.toggle('is-on', x === b));
      toggle.classList.toggle('is-gbp', currency === 'gbp');

      const chart = window.__revChart;
      if (chart) {
        chart.data.datasets.forEach(ds => (ds.data = ds._xof.map(v => currency === 'gbp' ? v / XOF_PER_GBP : v)));
        chart.update();
      }
      $$('.year').forEach(y => {
        const v = $('.year__v', y);
        const c = $('.year__c', y);
        const to = parseFloat(v.dataset[currency]);
        const o = { n: parseFloat(v.textContent.replace(/[^\d.]/g, '')) || 0 };
        const render = n => (currency === 'gbp' ? '£' + Math.round(n) + 'K' : n.toFixed(n < 10 ? 2 : 1) + 'M');
        if (reduce) v.textContent = render(to);
        else gsap.to(o, { n: to, duration: 1, ease: 'power3.out', onUpdate: () => (v.textContent = render(o.n)) });
        c.textContent = currency === 'gbp' ? `~${v.dataset.xof}M XOF` : `XOF · ~£${(+v.dataset.gbp * 1000).toLocaleString('en-US')}`;
      });
    }));

    // Front-end only: wire this to a backend / form service to actually collect sign-ups.
    const form = $('.signup');
    const msg = $('.signup__msg');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const phone = form.phone.value.trim();
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 8) {
        msg.textContent = 'Please enter a valid phone or WhatsApp number.';
        if (!reduce) gsap.fromTo('.signup__row', { x: -8 }, { x: 0, duration: .6, ease: 'elastic.out(1, .3)' });
        form.phone.focus();
        return;
      }
      const role = { mechanic: 'mechanic', dealer: 'parts dealer', uk: 'UK seller' }[form.role.value];
      msg.textContent = `Thank you! Your founding ${role} spot request for ${phone} has been noted.`;
      form.reset();
    });
  }
})();
