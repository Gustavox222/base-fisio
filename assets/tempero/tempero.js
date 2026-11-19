/* "Tempero" da cópia local: GSAP (ScrollTrigger, SplitText) + Motion.
   Roda depois do gsap.min.js, ScrollTrigger.min.js, SplitText.min.js (defer) e do módulo que põe o Motion em window.Motion. */
const { gsap, ScrollTrigger, SplitText } = window;
const Motion = window.Motion;
const root = document.documentElement;
const done = () => root.classList.add('tp-ready');

if (!gsap || !ScrollTrigger || !SplitText) {
  done();
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();

  mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' }, (ctx) => {
    const { motion, desktop } = ctx.conditions;
    if (!motion) { done(); return; }

    /* ---------- HERO: entrada em timeline ---------- */
    const hero = document.querySelector('.hero');
    const h1 = hero.querySelector('h1');
    const split = SplitText.create(h1, { type: 'words,lines', mask: 'lines', wordsClass: 'tp-word', linesClass: 'tp-line' });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, onStart: done });
    tl.from('.hero-eyebrow', { y: 16, autoAlpha: 0, duration: .6 })
      .from(split.words, { yPercent: 120, duration: 1, stagger: .06 }, '-=.3')
      .from('.hero .t-lead', { y: 24, autoAlpha: 0, duration: .8 }, '-=.6')
      .from('.hero .btn-row > *', { y: 20, autoAlpha: 0, duration: .6, stagger: .1 }, '-=.5')
      .from('.hero-facts > div', { y: 18, autoAlpha: 0, duration: .6, stagger: .08 }, '-=.4')
      .fromTo('.hero-visual', { clipPath: 'inset(12% 8% 12% 8% round 24px)', autoAlpha: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round 16px)', autoAlpha: 1, duration: 1.4, ease: 'expo.out' }, .15)
      .from('.hero-visual .frame__img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, .15)
      .from('.float-badge', { y: 30, autoAlpha: 0, scale: .9, duration: .8, stagger: .15, ease: 'back.out(1.6)' }, '-=1');

    // selos e orbs flutuando sem parar
    gsap.to('.fb-1', { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.fb-2', { y: 10, duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.orb--a', { x: -60, y: 40, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.orb--b', { x: 70, y: -30, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Spotlight: a luz segue o cursor, suavizada com quickTo
    const spot = hero.querySelector('.spotlight');
    if (spot && desktop) {
      const state = { x: 70, y: 30 };
      const apply = () => { spot.style.setProperty('--sx', state.x + '%'); spot.style.setProperty('--sy', state.y + '%'); };
      const qx = gsap.quickTo(state, 'x', { duration: .8, ease: 'power3', onUpdate: apply });
      const qy = gsap.quickTo(state, 'y', { duration: .8, ease: 'power3', onUpdate: apply });
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width) * 100); qy(((e.clientY - r.top) / r.height) * 100);
      });
    }

    // a foto do topo afunda devagar ao rolar
    gsap.to('.hero-visual .frame__img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.hero-copy', { yPercent: 0, opacity: 1 }, { yPercent: -10, opacity: .35, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'center top', end: 'bottom top', scrub: true } });

    /* ---------- MARQUEE: loop + aceleração pela velocidade da rolagem ---------- */
    const track = document.querySelector('.marquee__track');
    if (track) {
      const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      let boost = gsap.quickTo(loop, 'timeScale', { duration: .6, ease: 'power2.out' });
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
          boost(v === 0 ? 1 : (self.direction > 0 ? 1 + Math.abs(v) : -(1 + Math.abs(v))));
          gsap.delayedCall(.25, () => boost(1));
        },
      });
    }

    /* ---------- TÍTULOS: linhas sobem de dentro de uma máscara ---------- */
    document.querySelectorAll('main > section:not(.hero) h2, footer.closing h2').forEach((h2) => {
      SplitText.create(h2, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110, duration: 1, stagger: .1, ease: 'power4.out',
          scrollTrigger: { trigger: h2, start: 'top 85%', once: true },
        }),
      });
    });

    // parágrafos, listas e fatos entram em lote
    ScrollTrigger.batch('.section-head p, .sobre__bio p, .sobre__facts li, #tratamentos .rows li, .cx-map__card', {
      start: 'top 88%', once: true,
      onEnter: (els) => gsap.from(els, { y: 28, autoAlpha: 0, duration: .8, stagger: .08, ease: 'power3.out' }),
    });

    /* ---------- FOTOS: revelam com clip-path e fazem parallax por object-position ---------- */
    gsap.utils.toArray('#sobre .frame--photo, #tratamentos .frame--photo').forEach((fr, i) => {
      gsap.fromTo(fr, { clipPath: 'inset(100% 0% 0% 0% round 16px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.3, ease: 'expo.out', delay: (i % 2) * .12,
        scrollTrigger: { trigger: fr, start: 'top 85%', once: true },
      });
      const img = fr.querySelector('img');
      // a foto do Sobre tem legenda embaixo: fica parada no topo
      if (img && !fr.closest('#sobre')) gsap.fromTo(img, { objectPosition: '50% 20%' }, { objectPosition: '50% 80%', ease: 'none', scrollTrigger: { trigger: fr, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* ---------- 3 ETAPAS: trilho que enche + cartões em sequência ---------- */
    const rail = document.querySelector('.steps-rail');
    if (rail) {
      const dots = rail.querySelectorAll('i');
      gsap.to(rail.querySelector('span'), {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: '#como .steps', start: 'top 75%', end: 'bottom 60%', scrub: .6,
          onUpdate: (self) => dots.forEach((d, i) => d.classList.toggle('is-on', self.progress >= i / (dots.length - 1) - .02)),
        },
      });
    }
    gsap.from('#como .step', {
      y: 80, autoAlpha: 0, rotateX: -12, transformOrigin: '50% 0%', duration: 1, stagger: .15, ease: 'power3.out',
      scrollTrigger: { trigger: '#como .steps', start: 'top 80%', once: true },
    });
    gsap.from('#como .step__list li', {
      x: -16, autoAlpha: 0, duration: .5, stagger: .05, ease: 'power2.out',
      scrollTrigger: { trigger: '#como .steps', start: 'top 60%', once: true },
    });

    /* ---------- AVALIAÇÕES: Number Ticker 0 → 5,0 e cartões ---------- */
    const score = document.querySelector('.rating__score');
    if (score) {
      const n = { v: 0 };
      gsap.to(n, {
        v: 5, duration: 1.6, ease: 'power2.out',
        onUpdate: () => { score.textContent = n.v.toFixed(1).replace('.', ','); },
        scrollTrigger: { trigger: score, start: 'top 85%', once: true },
      });
    }
    const count = document.querySelector('.rating__count');
    if (count) {
      const c = { v: 0 }, rest = count.textContent.replace(/^\d+/, '');
      gsap.to(c, { v: 38, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
        onUpdate: () => { count.textContent = c.v + rest; },
        scrollTrigger: { trigger: count, start: 'top 90%', once: true } });
    }
    gsap.from('#avaliacoes .reviews > *', {
      y: 60, autoAlpha: 0, duration: .9, stagger: .12, ease: 'power3.out',
      scrollTrigger: { trigger: '#avaliacoes .reviews', start: 'top 80%', once: true },
    });

    /* ---------- MAPA: abre como uma janela ---------- */
    gsap.fromTo('#contato .cx-map', { clipPath: 'inset(8% 6% 8% 6% round 24px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: '#contato .cx-map', start: 'top 85%', once: true },
    });

    /* ---------- NAV: some ao descer, volta ao subir ---------- */
    const nav = document.querySelector('header.nav');
    if (nav) {
      const show = gsap.quickTo(nav, 'yPercent', { duration: .35, ease: 'power2.out' });
      ScrollTrigger.create({ start: 120, end: 'max', onUpdate: (self) => show(self.direction > 0 ? -110 : 0), onLeaveBack: () => show(0) });
    }

    // fontes e imagens mudam a altura das seções: recalcula
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());

    return () => { done(); };
  });
}

/* ---------- MOTION (motion.dev) ---------- */
if (Motion && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const { animate, scroll, inView, stagger, hover } = Motion;

  // barra de progresso da página
  const bar = document.querySelector('.scroll-progress');
  if (bar) scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));

  // estrelas das avaliações pulam uma a uma quando entram na tela
  document.querySelectorAll('#avaliacoes .stars').forEach((s) => {
    inView(s, () => {
      animate(s.querySelectorAll('svg'), { scale: [0, 1.25, 1], rotate: [-40, 0], opacity: [0, 1] }, { delay: stagger(.08, { startDelay: .3 }), duration: .6, ease: 'easeOut' });
    }, { amount: .6 });
  });

  // botões magnéticos: puxam levemente na direção do cursor (spring)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn--primary, .rating').forEach((el) => {
      const strength = el.classList.contains('btn--wide') ? .08 : .25;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength, y = (e.clientY - r.top - r.height / 2) * strength;
        animate(el, { translate: `${x}px ${y}px` }, { type: 'spring', stiffness: 260, damping: 18 });
      });
      el.addEventListener('pointerleave', () => animate(el, { translate: '0px 0px' }, { type: 'spring', stiffness: 220, damping: 14 }));
    });
  }

  // Spotlight nos cartões: a luz acompanha o cursor dentro de cada cartão
  document.querySelectorAll('.step, .review').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    hover(card, () => { animate(card, { y: -6 }, { type: 'spring', stiffness: 300, damping: 20 }); return () => animate(card, { y: 0 }, { type: 'spring', stiffness: 300, damping: 20 }); });
  });
}

// segurança: nada fica escondido se algo der errado
setTimeout(done, 3000);
