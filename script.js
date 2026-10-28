const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- hero: rolki Arka grają na zmianę, pierścień DALEJ pokazuje postęp filmu ----------
const filmy = [...document.querySelectorAll('.hero__wideo')];
const heroDalej = document.getElementById('heroDalej');
const heroNr = document.getElementById('heroNr');
const heroNazwa = document.getElementById('heroNazwa');
const heroOpis = document.getElementById('heroOpis');
let film = 0;
const start = () => document.body.classList.add('gotowe');
if (filmy[0].readyState >= 2) start();
else { filmy[0].addEventListener('loadeddata', start, { once: true }); setTimeout(start, 1500); }
// następna rolka ładuje się dopiero, gdy pierwsza już gra
filmy[0].addEventListener('playing', () => filmy.forEach(v => { if (v.preload === 'none') v.preload = 'auto'; }), { once: true });

// odtwarzanie z ponowieniem, gdy przeglądarka odrzuci pierwszą próbę (np. film jeszcze się ładuje)
const graj = (v) => v.play().catch(() => v.addEventListener('canplay', () => { if (v.classList.contains('aktywne')) v.play().catch(() => {}); }, { once: true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduce) graj(filmy[film]); });

function pokazFilm(i){
  film = (i + filmy.length) % filmy.length;
  filmy.forEach((v, k) => {
    if (k === film) { v.currentTime = 0; v.classList.add('aktywne'); if (!reduce) graj(v); }
    else { v.classList.remove('aktywne'); setTimeout(() => { if (!v.classList.contains('aktywne')) v.pause(); }, 1600); }
  });
  heroNr.textContent = String(film + 1).padStart(3, '0');
  heroNazwa.textContent = filmy[film].dataset.nazwa;
  heroOpis.textContent = '· ' + filmy[film].dataset.opis;
}
filmy.forEach(v => v.addEventListener('ended', () => pokazFilm(film + 1)));
heroDalej.addEventListener('click', () => pokazFilm(film + 1));
if (reduce) filmy[0].pause();
(function tik(){
  const v = filmy[film];
  if (v.duration) heroDalej.style.setProperty('--pk', (v.currentTime / v.duration).toFixed(4));
  requestAnimationFrame(tik);
})();

// ---------- nawigacja ----------
const nav = document.getElementById('nav');
const naScroll = () => nav.classList.toggle('nav--tlo', scrollY > 40);
addEventListener('scroll', naScroll, { passive: true });
naScroll();

const burger = document.getElementById('burger');
const ustawMenu = (o) => {
  nav.classList.toggle('nav--otwarte', o);
  burger.setAttribute('aria-expanded', o);
  document.body.style.overflow = o ? 'hidden' : '';
};
burger.addEventListener('click', () => ustawMenu(!nav.classList.contains('nav--otwarte')));
document.querySelectorAll('.nav__menu a').forEach(a => a.addEventListener('click', () => ustawMenu(false)));

// aktywny link w menu (kropka pod spodem)
const linki = [...document.querySelectorAll('.nav__menu a')];
const sekcje = linki.map(a => document.querySelector(a.getAttribute('href')));
const ioNav = new IntersectionObserver(wpisy => {
  wpisy.forEach(w => {
    if (!w.isIntersecting) return;
    linki.forEach(a => a.classList.toggle('aktywny', a.getAttribute('href') === '#' + w.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sekcje.forEach(s => s && ioNav.observe(s));

// ---------- pojawianie się przy przewijaniu ----------
const io = new IntersectionObserver(wpisy => {
  wpisy.forEach(w => { if (w.isIntersecting) { w.target.classList.add('widac'); io.unobserve(w.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .mono').forEach(el => io.observe(el));

// litery w wielkim słowie wjeżdżają po kolei
document.querySelectorAll('[data-litery]').forEach(el => {
  el.innerHTML = [...el.textContent].map((z, i) => `<span class="l" style="--i:${i}">${z}</span>`).join('');
});

// lekki zoom zdjęcia w pasie MONOCHROME przy przewijaniu
const mono = document.querySelector('.mono');
addEventListener('scroll', () => {
  const r = mono.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, 1 - r.top / innerHeight));
  mono.style.setProperty('--z', p.toFixed(3));
}, { passive: true });

// ---------- rolki: filmy grają tylko, gdy są na ekranie ----------
const ioWideo = new IntersectionObserver(wpisy => {
  wpisy.forEach(w => {
    const v = w.target;
    if (w.isIntersecting && !reduce) { v.play().then(() => v.closest('.rolka').classList.add('gra')).catch(() => {}); }
    else { v.pause(); }
  });
}, { threshold: 0.35 });
document.querySelectorAll('.rolka video').forEach(v => ioWideo.observe(v));

// ---------- taśma portfolio ----------
const tasma = document.getElementById('tasma');
const wstecz = document.getElementById('tasmaWstecz');
const dalej = document.getElementById('tasmaDalej');
const krok = () => tasma.querySelector('.kadr').offsetWidth + 22;
wstecz.addEventListener('click', () => tasma.scrollBy({ left: -krok(), behavior: 'smooth' }));
dalej.addEventListener('click', () => tasma.scrollBy({ left: krok(), behavior: 'smooth' }));
const strzalkiStan = () => {
  wstecz.disabled = tasma.scrollLeft < 4;
  dalej.disabled = tasma.scrollLeft > tasma.scrollWidth - tasma.clientWidth - 4;
};
tasma.addEventListener('scroll', strzalkiStan, { passive: true });
addEventListener('resize', strzalkiStan);
strzalkiStan();

// ---------- podgląd zdjęcia ----------
const kadry = [...document.querySelectorAll('.kadr')];
const lb = document.querySelector('.lb');
const lbImg = lb.querySelector('img');
const lbOpis = lb.querySelector('.lb__opis');
let li = 0;
const pokazLb = (i) => {
  li = (i + kadry.length) % kadry.length;
  const img = kadry[li].querySelector('img');
  lbImg.src = img.src; lbImg.alt = img.alt;
  lbOpis.textContent = `${String(li + 1).padStart(3, '0')} / ${String(kadry.length).padStart(3, '0')} · ${kadry[li].querySelector('b').textContent}`;
};
const otworzLb = (i) => { pokazLb(i); lb.classList.add('otwarty'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
const zamknijLb = () => { lb.classList.remove('otwarty'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
kadry.forEach((k, i) => k.addEventListener('click', () => otworzLb(i)));
lb.querySelector('.lb__x').addEventListener('click', zamknijLb);
lb.querySelector('.lb__wstecz').addEventListener('click', () => pokazLb(li - 1));
lb.querySelector('.lb__dalej').addEventListener('click', () => pokazLb(li + 1));
lb.addEventListener('click', e => { if (e.target === lb) zamknijLb(); });
addEventListener('keydown', e => {
  if (e.key === 'Escape') { zamknijLb(); ustawMenu(false); }
  if (!lb.classList.contains('otwarty')) return;
  if (e.key === 'ArrowLeft') pokazLb(li - 1);
  if (e.key === 'ArrowRight') pokazLb(li + 1);
});

// ---------- formularz: otwiera pocztę z gotową wiadomością ----------
document.querySelector('.formularz').addEventListener('submit', e => {
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
