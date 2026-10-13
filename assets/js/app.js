/* =========================================================
   KetemuTerus — App bootstrap, router, palette, menus
   ========================================================= */

let current = null;

function navigate(name) {
  const v = Views[name]; if (!v) return;
  Timers.splice(0).forEach(t => { clearInterval(t); clearTimeout(t); });
  typingToken++;
  current = name;
  $$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.view === name));
  $('#viewTitle').textContent = v.title;
  $('#crumb').textContent = v.crumb;
  const host = $('#view');
  host.classList.remove('view-enter');
  host.innerHTML = `<div class="space-y-4">${v.render()}</div>`;
  // re-trigger staggered entrance on the direct children of the view wrapper
  const inner = host.firstElementChild;
  inner.classList.add('view-enter');
  void host.offsetWidth;
  $('#main').scrollTo({ top: 0 });
  v.mount(inner);
  runCounters(inner);
  history.replaceState(null, '', '#' + name);
  $('#sidebar').classList.remove('mobile-open');
}

/* global delegated actions */
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) { navigate(go.dataset.go); return; }
  if (e.target.closest('.drawer-close') || e.target.id === 'drawerMask') hideDrawer();
  if (!e.target.closest('#notifBtn, #notifMenu')) $('#notifMenu').classList.remove('open');
  if (!e.target.closest('#locBtn, #locMenu')) $('#locMenu').classList.remove('open');
});
$$('.nav-item').forEach(a => a.addEventListener('click', () => navigate(a.dataset.view)));
$('#mobileMenu').onclick = () => $('#sidebar').classList.toggle('mobile-open');

/* ---------- Header menus ---------- */
$('#notifMenu').innerHTML = `
  <div class="flex items-center justify-between px-3 py-2"><b class="text-sm text-white">Notifikasi</b><button class="text-[11px] text-lime-300" onclick="document.querySelector('.notif-dot').remove()">Tandai dibaca</button></div>
  ${NOTIFS.map(n => `<div class="flex gap-3 rounded-xl p-3 transition hover:bg-white/5"><div class="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style="background:${n.color}1f;color:${n.color}"><i class="fa-solid ${n.icon} text-xs"></i></div><div class="text-xs text-slate-300">${n.text}<div class="mt-0.5 text-[10px] text-slate-500">${n.time} lalu</div></div></div>`).join('')}`;
$('#notifBtn').onclick = () => $('#notifMenu').classList.toggle('open');

$('#locMenu').innerHTML = `<div class="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Pilih outlet</div>` +
  OUTLETS.map(o => `<button class="loc-opt flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-white/5" data-id="${o.id}">
    <span class="h-2 w-2 rounded-full ${o.status === 'live' ? 'bg-lime-400 shadow-[0_0_8px_#A3E635]' : 'bg-slate-600'}"></span>
    <span class="flex-1"><span class="block text-[13px] font-semibold text-white">${o.name}</span><span class="text-[10.5px] text-slate-500">${o.area}</span></span>
    <span class="text-[10px] ${o.status === 'live' ? 'text-lime-300' : 'text-slate-500'}">${o.status === 'live' ? 'LIVE' : o.eta}</span></button>`).join('');
$('#locBtn').onclick = () => $('#locMenu').classList.toggle('open');
$$('.loc-opt').forEach(b => b.onclick = () => {
  const o = OUTLETS.find(x => x.id === b.dataset.id);
  $('#locMenu').classList.remove('open');
  if (o.status === 'live') return toast('Anda sedang di PIM 3', { icon: 'fa-location-dot' });
  State.outlet = o.id; navigate('expansion');
  toast(`${o.name} belum live`, { icon: 'fa-map-location-dot', color: '#2DD4BF', sub: 'Siapkan dengan Clone Playbook PIM 3' });
});

const tick = () => ($('#clock').textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
tick(); setInterval(tick, 15000);

/* ---------- Command palette (AI semantic search) ---------- */
const NAV_CMDS = Object.entries(Views).map(([k, v]) => ({ k, t: v.title, c: v.crumb }));
const EXAMPLES = ['studio olahraga yang member-nya butuh makanan sehat', 'komunitas ibu di dekat PIM', 'kantor dengan program wellness karyawan', 'apartemen premium untuk resident perks', 'creator makanan sehat Pondok Indah'];
let palIdx = 0, palItems = [];

function openPalette() { $('#palette').classList.add('open'); $('#paletteInput').value = ''; renderPalette(''); setTimeout(() => $('#paletteInput').focus(), 50); }
function closePalette() { $('#palette').classList.remove('open'); }

function semanticSearch(q) {
  const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const syn = { olahraga: 'fitness', gym: 'fitness', sehat: 'makanan', ibu: 'community mom ibu', kantor: 'corporate karyawan', apartemen: 'lifestyle unit penghuni', creator: 'kol creator', klinik: 'wellness', komunitas: 'community', kecantikan: 'aesthetic beauty' };
  const terms = words.flatMap(w => [w, ...(syn[w] || '').split(' ')]).filter(Boolean);
  return PROSPECTS.map(p => {
    const hay = `${p.name} ${p.cat} ${p.insight} ${LEVERS[p.lever]}`.toLowerCase();
    const hits = terms.filter(t => hay.includes(t)).length;
    return { p, sim: Math.min(.98, .55 + hits * .09 + p.score / 900) , hits };
  }).filter(r => r.hits > 0).sort((a, b) => b.sim - a.sim).slice(0, 6);
}

let palTimer;
function renderPalette(q) {
  const body = $('#paletteBody');
  clearTimeout(palTimer);
  if (!q.trim()) {
    palItems = [...EXAMPLES.map(e => ({ type: 'ask', q: e })), ...NAV_CMDS.map(n => ({ type: 'nav', ...n }))];
    body.innerHTML = `<div class="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Coba tanya AI</div>` +
      EXAMPLES.map((e, i) => `<div class="pal-item" data-i="${i}"><i class="fa-solid fa-wand-magic-sparkles w-5 text-center text-lime-300"></i><span class="text-sm text-slate-200">${e}</span><i class="fa-solid fa-arrow-turn-down ml-auto rotate-90 text-[10px] text-slate-600"></i></div>`).join('') +
      `<div class="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Navigasi</div>` +
      NAV_CMDS.map((n, i) => `<div class="pal-item" data-i="${EXAMPLES.length + i}"><i class="fa-solid fa-arrow-right w-5 text-center text-slate-500"></i><span class="text-sm text-slate-200">${n.t}</span><span class="ml-auto text-[10px] text-slate-500">${n.c}</span></div>`).join('');
    return bindPal();
  }
  body.innerHTML = `<div class="flex items-center gap-3 p-3 font-mono text-[11px] text-lime-300/80"><i class="fa-solid fa-spinner fa-spin"></i> embedding query → Qdrant cosine search (12.480 vektor)…</div>` +
    [1, 2, 3].map(() => `<div class="flex items-center gap-3 p-3"><div class="skeleton h-9 w-9"></div><div class="flex-1 space-y-2"><div class="skeleton h-3 w-1/2"></div><div class="skeleton h-2.5 w-3/4"></div></div></div>`).join('');
  palTimer = setTimeout(() => {
    const res = semanticSearch(q);
    const navs = NAV_CMDS.filter(n => n.t.toLowerCase().includes(q.toLowerCase()));
    palItems = [...res.map(r => ({ type: 'prospect', ...r })), ...navs.map(n => ({ type: 'nav', ...n }))];
    if (!palItems.length) { body.innerHTML = `<div class="p-6 text-center text-sm text-slate-500">Tidak ada hasil semantik. Coba kata lain seperti "pilates", "kantor", "ibu".</div>`; return; }
    body.innerHTML = (res.length ? `<div class="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">${res.length} prospek paling relevan</div>` : '') +
      res.map((r, i) => `<div class="pal-item stagger" data-i="${i}" style="animation-delay:${i * 50}ms">
        <div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style="background:${CATS[r.p.cat].color}1f;color:${CATS[r.p.cat].color}"><i class="fa-solid ${CATS[r.p.cat].icon} text-xs"></i></div>
        <div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="truncate text-sm font-semibold text-white">${r.p.name}</span><span class="tier tier-${r.p.tier}">${r.p.score}</span></div><div class="truncate text-[11.5px] text-slate-400">${r.p.insight}</div></div>
        <div class="text-right"><div class="font-mono text-xs font-bold text-lime-300">${r.sim.toFixed(2)}</div><div class="text-[9.5px] text-slate-500">similarity</div></div></div>`).join('') +
      (navs.length ? `<div class="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Navigasi</div>` + navs.map((n, i) => `<div class="pal-item" data-i="${res.length + i}"><i class="fa-solid fa-arrow-right w-5 text-center text-slate-500"></i><span class="text-sm text-slate-200">${n.t}</span></div>`).join('') : '');
    bindPal();
  }, 650);
}
function bindPal() {
  palIdx = 0;
  $$('.pal-item').forEach(el => {
    el.onmouseenter = () => { palIdx = +el.dataset.i; markPal(); };
    el.onclick = () => runPal(+el.dataset.i);
  });
  markPal();
}
function markPal() { $$('.pal-item').forEach(el => el.classList.toggle('act', +el.dataset.i === palIdx)); }
function runPal(i) {
  const it = palItems[i]; if (!it) return;
  if (it.type === 'ask') { $('#paletteInput').value = it.q; renderPalette(it.q); return; }
  closePalette();
  if (it.type === 'nav') navigate(it.k);
  if (it.type === 'prospect') { if (current !== 'radar') navigate('radar'); setTimeout(() => openProspect(it.p), 250); }
}
$('#cmdTrigger').onclick = openPalette;
$('#paletteInput').addEventListener('input', e => renderPalette(e.target.value));
$('#palette').addEventListener('click', e => { if (e.target.id === 'palette') closePalette(); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#palette').classList.contains('open') ? closePalette() : openPalette(); }
  if (e.key === 'Escape') { closePalette(); hideDrawer(); }
  if ($('#palette').classList.contains('open')) {
    if (e.key === 'ArrowDown') { e.preventDefault(); palIdx = Math.min(palItems.length - 1, palIdx + 1); markPal(); $('.pal-item.act')?.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'ArrowUp') { e.preventDefault(); palIdx = Math.max(0, palIdx - 1); markPal(); $('.pal-item.act')?.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); runPal(palIdx); }
  }
});

/* ---------- Splash boot sequence ---------- */
(async function boot() {
  const log = $('#bootLog');
  const lines = ['› connecting Qdrant vector cluster… ok', '› loading 24 prospects · PIM 3 geofence… ok', '› AI scoring engine warm… ok'];
  for (const l of lines) { const d = document.createElement('div'); d.textContent = l; d.style.animation = 'rise .4s both'; log.appendChild(d); await sleep(380); }
  $('#loginCard').classList.remove('opacity-0', 'translate-y-4');
})();

function enterApp(view) {
  const btn = $('#btnLogin');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengautentikasi…';
  setTimeout(() => {
    $('#splash').classList.add('leave');
    $('#app').classList.add('enter');
    navigate(view);
    setTimeout(() => { $('#splash').remove(); toast('Selamat datang kembali 👋', { icon: 'fa-leaf', sub: 'AI menemukan 3 peluang baru sejak kemarin' }); }, 900);
  }, 650);
}
$('#btnLogin').onclick = () => enterApp(location.hash.slice(1) in Views ? location.hash.slice(1) : 'dashboard');
$('#btnPartnerLogin').onclick = () => enterApp('portal');

/* ?skip — langsung masuk tanpa splash (untuk presentasi / deep-link) */
if (new URLSearchParams(location.search).has('skip')) $('#btnLogin').click();
