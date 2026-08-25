// ===================== 3D AMBIENT HERO SCENE (Three.js) =====================
(function initHero3D() {
  const canvas = document.getElementById('hero-3d');
  const heroSection = document.getElementById('home');
  if (!canvas || !heroSection) return;

  // Respect users who prefer reduced motion, and skip gracefully if the
  // Three.js CDN failed to load or WebGL isn't supported — the page still
  // works perfectly fine with the existing 2D particle background.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof THREE === 'undefined') return;
  if (window.innerWidth <= 768) return; // desktop-only enhancement

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // no WebGL support — fail silently
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(0, 0, 34);

  function sizeToHero() {
    const rect = heroSection.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  sizeToHero();
  window.addEventListener('resize', sizeToHero);

  // Brand colors matching the CSS accent palette (purple / cyan)
  const colorAccent = new THREE.Color(0x6c63ff);
  const colorAccent2 = new THREE.Color(0x00d4ff);

  // --- Wireframe geometric cluster (icosahedron + torus) ---
  const group = new THREE.Group();
  scene.add(group);

  const icoGeo = new THREE.IcosahedronGeometry(9, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: colorAccent, wireframe: true, transparent: true, opacity: 0.35 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(9, 2, -6);
  group.add(ico);

  const torusGeo = new THREE.TorusGeometry(5, 0.6, 8, 60);
  const torusMat = new THREE.MeshBasicMaterial({ color: colorAccent2, wireframe: true, transparent: true, opacity: 0.3 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(-11, -4, -4);
  torus.rotation.x = Math.PI / 3;
  group.add(torus);

  const smallIcoGeo = new THREE.IcosahedronGeometry(3.2, 0);
  const smallIcoMat = new THREE.MeshBasicMaterial({ color: colorAccent, wireframe: true, transparent: true, opacity: 0.4 });
  const smallIco = new THREE.Mesh(smallIcoGeo, smallIcoMat);
  smallIco.position.set(-4, 8, -10);
  group.add(smallIco);

  // --- Ambient starfield / particle points ---
  const starCount = 220;
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 70;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    const c = Math.random() > 0.5 ? colorAccent : colorAccent2;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // --- Mouse parallax (smoothly eased) ---
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  let rafId;
  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    group.rotation.y = t * 0.08;
    group.rotation.x = Math.sin(t * 0.15) * 0.1;
    stars.rotation.y = t * 0.015;

    curX += (targetX - curX) * 0.04;
    curY += (targetY - curY) * 0.04;
    camera.position.x = curX * 3;
    camera.position.y = -curY * 2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // Pause rendering when the hero scrolls out of view to save battery/CPU
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!rafId) animate();
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0 });
  io.observe(heroSection);
})();

// ===================== PARTICLES =====================
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#6c63ff', '#00d4ff', '#a855f7', '#3b82f6'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 14 + 8}s;
      animation-delay:${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
})();

// ===================== CURSOR GLOW AURA =====================
(function createCursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let currentX = mouseX, currentY = mouseY;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

// ===================== NAVBAR SCROLL =====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
});

// ===================== HAMBURGER MENU =====================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ===================== ACTIVE LINK ON SCROLL =====================
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
  });
  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

// ===================== TYPED TEXT =====================
const roles = [
  'Odoo Developer',
  'Python Engineer',
  'AI/ML Builder',
  'FastAPI Developer',
  'ERP Specialist',
  'Full-Stack Engineer'
];
let rIdx = 0, cIdx = 0, isDeleting = false;
const typedEl = document.getElementById('typed');

function type() {
  if (!typedEl) return;
  const word = roles[rIdx];
  if (!isDeleting) {
    typedEl.textContent = word.slice(0, ++cIdx);
    if (cIdx === word.length) { isDeleting = true; return setTimeout(type, 1800); }
  } else {
    typedEl.textContent = word.slice(0, --cIdx);
    if (cIdx === 0) { isDeleting = false; rIdx = (rIdx + 1) % roles.length; }
  }
  setTimeout(type, isDeleting ? 50 : 90);
}
setTimeout(type, 500);

// ===================== 3D TILT & MOUSE SPOTLIGHT =====================
const tiltCards = document.querySelectorAll(
  '.project-card, .cert-card, .volunteer-card, .stat-card, .skill-category, .timeline-card'
);

tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Relative mouse percentage for spotlight gradient
    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${mouseXPercent}%`);
    card.style.setProperty('--mouse-y', `${mouseYPercent}%`);

    // 3D tilt calculation (-8deg to 8deg)
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  });
});

// ===================== ANIMATED NUMBER COUNTER =====================
let statsAnimated = false;
function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length || statsAnimated) return;

  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  const rect = aboutSection.getBoundingClientRect();
  if (rect.top <= window.innerHeight * 0.75) {
    statsAnimated = true;
    statNumbers.forEach(stat => {
      const rawText = stat.textContent.trim();
      const target = parseInt(rawText.replace(/\D/g, ''), 10) || 0;
      const suffix = rawText.replace(/[0-9]/g, '');
      let current = 0;
      const duration = 1500;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target + suffix;
          clearInterval(timer);
        } else {
          stat.textContent = Math.floor(current) + suffix;
        }
      }, stepTime);
    });
  }
}
window.addEventListener('scroll', animateStats);
animateStats();

// ===================== BUTTON RIPPLE EFFECT =====================
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ===================== SCROLL FADE ANIMATIONS =====================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.stat-card, .skill-category, .timeline-card, .project-card, .cert-card, .volunteer-card, .contact-card, .about-text, .about-stats'
).forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// ===================== CONTACT FORM =====================
// Web3Forms integration — get your free access key at https://web3forms.com
// Enter ranamoeenodeen@gmail.com → copy the key sent to your inbox → paste below
const WEB3FORMS_ACCESS_KEY = '13faf4f3-568c-43f2-ba87-e1d473cd2430';

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.getElementById('send-btn');
    const status = document.getElementById('form-status');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    btn.textContent = 'Sending Email...';
    btn.disabled = true;
    status.style.color = 'var(--accent2)';
    status.textContent = '⏳ Sending your message...';

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: name,
      email: email,
      replyto: email,
      subject: subject ? `[Portfolio] ${subject}` : `[Portfolio] New message from ${name}`,
      message: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      from_name: name,
      botcheck: ''
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async response => {
        const data = await response.json();
        btn.textContent = 'Send Message';
        btn.disabled = false;
        if (data.success) {
          status.style.color = '#4ade80';
          status.textContent = '✅ Message sent! I will get back to you soon.';
          contactForm.reset();
          setTimeout(() => { status.textContent = ''; }, 6000);
        } else {
          console.error('Web3Forms error:', data);
          status.style.color = '#ef4444';
          status.textContent = data.message || '⚠️ Failed to send. Please email ranamoeenodeen@gmail.com directly.';
        }
      })
      .catch(err => {
        console.error('Contact form error:', err);
        btn.textContent = 'Send Message';
        btn.disabled = false;
        status.style.color = '#ef4444';
        status.textContent = '⚠️ Network error. Please email ranamoeenodeen@gmail.com directly.';
      });
  });
}

// ===================== SMOOTH SCROLL =====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===================== STAGGER DELAYS =====================
document.querySelectorAll('.projects-grid .project-card').forEach((card, i) => {
  card.style.transitionDelay = `${(i % 3) * 0.08}s`;
});
document.querySelectorAll('.skills-categories .skill-category').forEach((cat, i) => {
  cat.style.transitionDelay = `${(i % 3) * 0.08}s`;
});
document.querySelectorAll('.certs-grid .cert-card').forEach((cert, i) => {
  cert.style.transitionDelay = `${(i % 3) * 0.08}s`;
});
