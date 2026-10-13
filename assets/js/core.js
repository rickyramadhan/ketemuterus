/* =========================================================
   KetemuTerus — Core utilities (toast, count-up, typing,
   ripple, spotlight, confetti, sparkline, palette helpers)
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rupiah = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const rpShort = n => n >= 1e6 ? 'Rp ' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + ' jt' : 'Rp ' + Math.round(n / 1000) + 'rb';
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- Toast ---------- */
function toast(msg, { icon = 'fa-circle-check', color = '#A3E635', sub = '' } = {}) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style="background:${color}22;color:${color}"><i class="${icon.includes('fa-brands') ? icon : 'fa-solid ' + icon}"></i></div>
    <div class="min-w-0"><div class="text-sm font-semibold text-white">${msg}</div>${sub ? `<div class="text-xs text-slate-400">${sub}</div>` : ''}</div>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3600);
}

/* ---------- Count up ---------- */
function countUp(el, to, { dur = 1400, fmt = v => Math.round(v).toLocaleString('id-ID'), from = 0 } = {}) {
  const t0 = performance.now();
  const step = t => {
    const p = Math.max(0, Math.min(1, (t - t0) / dur));
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = fmt(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function runCounters(root = document) {
  $$('[data-count]', root).forEach(el => {
    const to = parseFloat(el.dataset.count);
    const type = el.dataset.fmt;
    const fmt = type === 'rp' ? v => rupiah(v)
      : type === 'rps' ? v => rpShort(v)
      : type === 'dec' ? v => v.toFixed(1).replace('.', ',')
      : type === 'pct' ? v => Math.round(v) + '%'
      : undefined;
    countUp(el, to, fmt ? { fmt } : {});
  });
  // animate bars
  requestAnimationFrame(() => $$('.bar > i[data-w]', root).forEach(b => (b.style.width = b.dataset.w + '%')));
}

/* ---------- Typewriter ---------- */
let typingToken = 0;
async function typeWrite(el, text, speed = 12) {
  const token = ++typingToken;
  el.innerHTML = '';
  el.classList.add('caret');
  for (let i = 0; i < text.length; i++) {
    if (token !== typingToken) return false;
    const ch = text[i];
    el.innerHTML += ch === '\n' ? '<br>' : ch.replace('<', '&lt;');
    if (i % 2 === 0) await sleep(ch === '.' || ch === '\n' ? speed * 6 : speed);
    const sc = el.closest('[data-autoscroll]'); if (sc) sc.scrollTop = sc.scrollHeight;
  }
  el.classList.remove('caret');
  return true;
}

/* ---------- Ripple on buttons ---------- */
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn-primary, .btn-ghost');
  if (!b) return;
  const r = b.getBoundingClientRect();
  const s = Math.max(r.width, r.height);
  const rp = document.createElement('span');
  rp.className = 'ripple';
  rp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.appendChild(rp);
  setTimeout(() => rp.remove(), 650);
});

/* ---------- Spotlight follow ---------- */
document.addEventListener('pointermove', e => {
  const c = e.target.closest('.card');
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px');
  c.style.setProperty('--my', e.clientY - r.top + 'px');
});

/* ---------- 3D tilt ---------- */
function bindTilt(root = document) {
  $$('.tilt', root).forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

/* ---------- Confetti ---------- */
const confetti = (() => {
  const cv = document.getElementById('confetti');
  const ctx = cv.getContext('2d');
  let parts = [], raf = null;
  const resize = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
  addEventListener('resize', resize); resize();
  const colors = ['#A3E635', '#34D399', '#2DD4BF', '#FBBF24', '#F472B6', '#60A5FA', '#ffffff'];
  function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => {
      p.vy += .25; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, p.life / 90);
      ctx.fillStyle = p.c;
      if (p.leaf) { ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s / 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
    raf = parts.length ? requestAnimationFrame(loop) : (ctx.clearRect(0, 0, innerWidth, innerHeight), null);
  }
  return (x = innerWidth / 2, y = innerHeight / 2, n = 140) => {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(4, 13);
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, r: rand(0, 6), vr: rand(-.3, .3), s: rand(6, 12), c: pick(colors), life: rand(70, 120), leaf: Math.random() < .4 });
    }
    if (!raf) loop();
  };
})();

/* ---------- SVG helpers ---------- */
function sparkline(data, { w = 120, h = 36, color = '#A3E635', fill = true } = {}) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const id = 'sg' + Math.random().toString(36).slice(2, 7);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${fill ? `<path d="${d} L${w} ${h} L0 ${h} Z" fill="url(#${id})"/>` : ''}
    <path class="line" d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="3" fill="${color}"><animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite"/></circle>
  </svg>`;
}

/* smooth path through points (catmull-rom -> bezier) */
function smoothPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/* polar (km, deg) -> % position in radar box (3km = 45% radius) */
function polar(dist, angle, maxKm = 3, rPct = 45) {
  const r = dist / maxKm * rPct, a = (angle - 90) * Math.PI / 180;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
}

function catBadge(cat) {
  const c = CATS[cat];
  return `<span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style="color:${c.color};background:${c.color}1a"><i class="fa-solid ${c.icon} text-[9px]"></i>${c.label}</span>`;
}
