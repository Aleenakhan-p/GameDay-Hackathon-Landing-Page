/* ═══════════════════════════════════════════════════════════════════════════
   AWS GAMEDAY 2026 – Main JavaScript
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Navbar scroll effect ────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile hamburger ────────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

/* ── Hero Canvas – animated cloud network ────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  let   W, H, nodes, animId;

  const NODE_COUNT = 60;
  const MAX_DIST   = 150;
  const ORANGE     = '#FF9900';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .5,
      vy: (Math.random() - .5) * .5,
      r:  Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += .02;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * .25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,153,0,${alpha})`;
          ctx.lineWidth = .8;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach(n => {
      const glow = .5 + .5 * Math.sin(n.pulse);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,153,0,${.3 + glow * .4})`;
      ctx.fill();

      // Subtle outer ring for some nodes
      if (n.r > 2) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 3 + glow * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,153,0,${.05 + glow * .08})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas);
  resize();
  createNodes();
  draw();
})();

/* ── Architecture diagram SVG lines ─────────────────────────────────────── */
(function drawArchLines() {
  const svg      = document.getElementById('archLines');
  if (!svg) return;
  const diagram  = document.getElementById('archDiagram');
  const center   = diagram.querySelector('.node-center');
  const spokes   = ['.node-1','.node-2','.node-3','.node-4','.node-5']
                     .map(s => diagram.querySelector(s));

  function getCenter(el) {
    return {
      x: el.offsetLeft + el.offsetWidth  / 2,
      y: el.offsetTop  + el.offsetHeight / 2,
    };
  }

  function redraw() {
    svg.innerHTML = '';
    const c = getCenter(center);
    spokes.forEach((node, i) => {
      const n = getCenter(node);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', c.x); line.setAttribute('y1', c.y);
      line.setAttribute('x2', n.x); line.setAttribute('y2', n.y);
      line.setAttribute('stroke', 'rgba(255,153,0,0.25)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '5,4');

      const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      anim.setAttribute('attributeName', 'stroke-dashoffset');
      anim.setAttribute('from', '0');
      anim.setAttribute('to', '-18');
      anim.setAttribute('dur', `${1.5 + i * .3}s`);
      anim.setAttribute('repeatCount', 'indefinite');
      line.appendChild(anim);
      svg.appendChild(line);
    });
  }
  redraw();
  window.addEventListener('resize', redraw);
})();

/* ── FAQ accordion ───────────────────────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // Toggle clicked
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ── Scroll reveal animation ─────────────────────────────────────────────── */
const revealItems = document.querySelectorAll(
  '.glass-card, .timeline-item, .workflow-step, .service-pill, .section-badge, .section-title, .section-sub'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealItems.forEach((el, i) => {
  el.classList.add('reveal-init');
  el.style.transitionDelay = `${(i % 6) * 60}ms`;
  revealObserver.observe(el);
});

/* ── Counter animation for stats ─────────────────────────────────────────── */
function animateCounter(el, target, suffix, duration = 1600) {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      const data = [
        { val: 200, suffix: '+' },
        { val: 10,  suffix: '+' },
        { val: 4,   suffix: '–6' },
        { val: 12,  suffix: '+' },
      ];
      nums.forEach((el, i) => {
        if (data[i]) animateCounter(el, data[i].val, data[i].suffix);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);
