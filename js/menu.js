
/* navbar toggle */
const navbar     = document.querySelector('[data-navbar]');
const openBtn    = document.querySelector('.nav-open-btn');
const closeBtn   = document.querySelector('.nav-close-btn');
const overlay    = document.querySelector('[data-overlay]');

const closeNavbar = () => {
  navbar.classList.remove('active');
  overlay.classList.remove('active');
};

const openNavbar = () => {
  navbar.classList.add('active');
  overlay.classList.add('active');
};

openBtn.addEventListener('click', openNavbar);
closeBtn.addEventListener('click', closeNavbar);
overlay.addEventListener('click', closeNavbar);

/* header cambia de color cuando se hace scroll */
const header = document.querySelector('[data-header]');

window.addEventListener('scroll', () => {
  const current = window.pageYOffset;

  if (current > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* ---------- SCROLL SPY ---------- */
const spyLinks = document.querySelectorAll('[data-scroll-spy]');
const sections = Array.from(spyLinks).map(link =>
  document.querySelector(link.getAttribute('href'))
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      spyLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(
        `[data-scroll-spy][href="#${entry.target.id}"]`
      );
      if (active) active.classList.add('active');
    });
  },
  { rootMargin: '-40% 0px -60% 0px' } //centro del viewport
);

sections.forEach(sec => observer.observe(sec));
