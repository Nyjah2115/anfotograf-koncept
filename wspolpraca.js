// Podstrona „Współpraca”: menu, pojawianie się, wielkie słowo i formularz briefu.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
addEventListener('keydown', e => { if (e.key === 'Escape') ustawMenu(false); });

// litery w wielkim słowie wjeżdżają po kolei
document.querySelectorAll('[data-litery]').forEach(el => {
  el.innerHTML = [...el.textContent].map((z, i) => `<span class="l" style="--i:${i}">${z}</span>`).join('');
});

const io = new IntersectionObserver(wpisy => {
  wpisy.forEach(w => { if (w.isIntersecting) { w.target.classList.add('widac'); io.unobserve(w.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .mono').forEach(el => io.observe(el));

// lekki zoom zdjęcia w pasie MONOCHROME przy przewijaniu
const mono = document.querySelector('.mono');
const zoom = () => {
  const p = Math.min(1, Math.max(0, scrollY / innerHeight));
  mono.style.setProperty('--z', reduce ? 1 : (1 - p).toFixed(3));
};
addEventListener('scroll', zoom, { passive: true });
zoom();

// brief: otwiera pocztę z gotową wiadomością
document.getElementById('brief-form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (!f.imie.value.trim() || !f.tresc.value.trim()) {
    f.querySelector(!f.imie.value.trim() ? '[name=imie]' : '[name=tresc]').focus();
    return;
  }
  const zakres = [...f.querySelectorAll('[name=zakres]:checked')].map(x => x.value);
  const linie = [
    f.tresc.value.trim(), '',
    zakres.length ? `Zakres: ${zakres.join(', ')}` : '',
    f.auto.value.trim() ? `Auto / marka: ${f.auto.value.trim()}` : '',
    f.termin.value.trim() ? `Termin: ${f.termin.value.trim()}` : '',
    f.miasto.value.trim() ? `Miasto: ${f.miasto.value.trim()}` : '',
    '', f.imie.value.trim()
  ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i > 0));
  const temat = `Brief${f.auto.value.trim() ? ' — ' + f.auto.value.trim() : ''}`;
  location.href = `mailto:anfotograf.info@gmail.com?subject=${encodeURIComponent(temat)}&body=${encodeURIComponent(linie.join('\n'))}`;
});
