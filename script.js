const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- hero: slajdy z paskami postępu ----------
const hero = document.querySelector('.hero');
const slides = [...hero.querySelectorAll('.slide')];
const bars = [...hero.querySelectorAll('.bar')];
const DURATION = 7000;
let cur = 0, elapsed = 0, paused = reduce, last = performance.now();

function goSlide(i){
  cur = (i + slides.length) % slides.length;
  elapsed = 0;
  slides.forEach((s, k) => s.classList.toggle('is-on', k === cur));
  bars.forEach((b, k) => { b.classList.toggle('is-on', k === cur); b.style.setProperty('--p', k < cur ? 1 : 0); });
}
(function tick(now){
  const dt = now - last; last = now;
  if (!paused) {
    elapsed += dt;
    bars[cur].style.setProperty('--p', Math.min(1, elapsed / DURATION));
    if (elapsed >= DURATION) goSlide(cur + 1);
  }
  requestAnimationFrame(tick);
})(last);
bars.forEach((b, k) => b.addEventListener('click', () => goSlide(k)));
const pauseBtn = hero.querySelector('.pause');
const setPaused = (p) => {
  paused = p;
  hero.classList.toggle('paused', p);
  pauseBtn.setAttribute('aria-label', p ? 'Wznów pokaz' : 'Zatrzymaj pokaz');
};
pauseBtn.addEventListener('click', () => setPaused(!paused));
setPaused(paused);

// ---------- nawigacja ----------
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.menu');
const toggleMenu = (open) => {
  menu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-hidden', !open);
  menuBtn.querySelector('.menu-label').textContent = open ? 'Zamknij' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
};
menuBtn.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) toggleMenu(false); });

// ---------- wejścia przy przewijaniu ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// ---------- projekty: karuzela ----------
const stage = document.querySelector('.proj-stage');
const track = document.querySelector('.proj-track');
const projs = [...track.children];
const titles = [...document.querySelectorAll('.proj-title')];
const tabs = [...document.querySelectorAll('.tab')];
const count = document.querySelector('.proj-count b');
let pi = 0;
function goProj(i){
  pi = (i + projs.length) % projs.length;
  const w = projs[0].offsetWidth;
  const m = parseFloat(getComputedStyle(projs[0]).marginRight);
  track.style.transform = `translateX(${(stage.offsetWidth - w) / 2 - pi * (w + m)}px)`;
  projs.forEach((p, k) => p.classList.toggle('is-on', k === pi));
  titles.forEach((t, k) => t.classList.toggle('is-on', k === pi));
  tabs.forEach((t, k) => { t.classList.toggle('is-on', k === pi); t.setAttribute('aria-selected', k === pi); });
  count.textContent = String(pi + 1).padStart(2, '0');
}
document.querySelector('.arrow.prev').addEventListener('click', () => goProj(pi - 1));
document.querySelector('.arrow.next').addEventListener('click', () => goProj(pi + 1));
tabs.forEach((t, k) => t.addEventListener('click', () => goProj(k)));
projs.forEach((p, k) => p.addEventListener('click', () => { if (k !== pi) goProj(k); }));
let sx = null;
stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', e => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 45) goProj(pi + (dx < 0 ? 1 : -1));
  sx = null;
});
addEventListener('resize', () => goProj(pi));
goProj(0);

// ---------- lightbox ----------
const tiles = [...document.querySelectorAll('.tile')];
const lb = document.querySelector('.lb');
const lbImg = lb.querySelector('img');
const lbCap = lb.querySelector('.lb-cap');
let li = 0;
const showLb = (i) => {
  li = (i + tiles.length) % tiles.length;
  const img = tiles[li].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = `${String(li + 1).padStart(2, '0')} / ${String(tiles.length).padStart(2, '0')} · ${tiles[li].querySelector('figcaption').lastChild.textContent}`;
};
const openLb = (i) => { showLb(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
const closeLb = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
tiles.forEach((t, k) => t.addEventListener('click', () => openLb(k)));
lb.querySelector('.lb-close').addEventListener('click', closeLb);
lb.querySelector('.lb-prev').addEventListener('click', () => showLb(li - 1));
lb.querySelector('.lb-next').addEventListener('click', () => showLb(li + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') showLb(li - 1);
  if (e.key === 'ArrowRight') showLb(li + 1);
});

// ---------- formularz: otwiera pocztę z gotową wiadomością ----------
document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (!f.imie.value.trim() || !f.tresc.value.trim()) {
    f.querySelector(!f.imie.value.trim() ? '[name=imie]' : '[name=tresc]').focus();
    return;
  }
  const temat = `Współpraca${f.auto.value.trim() ? ' — ' + f.auto.value.trim() : ''}`;
  const tresc = `${f.tresc.value.trim()}\n\n${f.imie.value.trim()}`;
  location.href = `mailto:anfotograf.info@gmail.com?subject=${encodeURIComponent(temat)}&body=${encodeURIComponent(tresc)}`;
});
