/* =========================================================
   KetemuTerus — Views
   Setiap view: { title, crumb, render() -> html, mount() }
   ========================================================= */

const State = {
  radius: 3,
  cats: new Set(Object.keys(CATS)),
  highOnly: false,
  heat: false,
  selected: PROSPECTS.find(p => p.id === 3),
  tone: 'friendly',
  channel: 'whatsapp',
  outlet: 'pik',
  portalPartner: 1,
};
const Timers = [];
const every = (fn, ms) => Timers.push(setInterval(fn, ms));
const later = (fn, ms) => Timers.push(setTimeout(fn, ms));

/* ---------- Shared pieces ---------- */
function ring(value, { size = 120, stroke = 10, color = '#A3E635', label = '', sub = '' } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const id = 'rg' + Math.random().toString(36).slice(2, 7);
  return `<div class="relative grid place-items-center" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" class="-rotate-90">
      <defs><linearGradient id="${id}"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#2DD4BF"/></linearGradient></defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="${stroke}"/>
      <circle class="ring-anim" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#${id})" stroke-width="${stroke}" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - value / 100)}" style="transition:stroke-dashoffset 1.6s cubic-bezier(.2,.9,.2,1);filter:drop-shadow(0 0 8px ${color}88)"/>
    </svg>
    <div class="absolute text-center"><div class="text-2xl font-extrabold text-white" data-count="${value}">0</div>${label ? `<div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">${label}</div>` : ''}${sub}</div>
  </div>`;
}
function animateRings(root) { requestAnimationFrame(() => setTimeout(() => $$('.ring-anim', root).forEach(c => (c.style.strokeDashoffset = c.dataset.off)), 60)); }

function sectionHead(title, sub = '', right = '') {
  return `<div class="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h3 class="text-[15px] font-bold text-white">${title}</h3>${sub ? `<p class="text-xs text-slate-400">${sub}</p>` : ''}</div>${right}</div>`;
}

function radarHTML({ mini = false } = {}) {
  const rings = [0.5, 1, 1.5, 2, 2.5, 3];
  const roads = [
    'M40,180 C160,220 260,260 300,300 S460,420 580,430',
    'M120,40 C200,160 260,240 300,300 S330,470 360,580',
    'M20,380 C140,360 240,330 300,300 S470,190 590,150',
  ];
  return `
  <div class="radar-wrap ${mini ? 'mini' : ''}" id="${mini ? 'miniRadar' : 'radar'}">
    <svg viewBox="0 0 600 600">
      <defs>
        <radialGradient id="rbg${mini ? 'm' : ''}"><stop offset="0" stop-color="#A3E635" stop-opacity=".10"/><stop offset=".7" stop-color="#0b1a14" stop-opacity=".35"/><stop offset="1" stop-color="#05080B" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="300" cy="300" r="290" fill="url(#rbg${mini ? 'm' : ''})"/>
      ${roads.map(d => `<path d="${d}" fill="none" stroke="rgba(148,163,184,.10)" stroke-width="6" stroke-linecap="round"/>`).join('')}
      <line x1="30" y1="300" x2="570" y2="300" stroke="rgba(163,230,53,.08)"/><line x1="300" y1="30" x2="300" y2="570" stroke="rgba(163,230,53,.08)"/>
      ${rings.map(k => `<circle class="ring" data-km="${k}" cx="300" cy="300" r="${k * 90}"/>${mini ? '' : `<text class="radar-label" x="${304 + k * 90 * .707}" y="${296 - k * 90 * .707}">${k.toFixed(1)}km</text>`}`).join('')}
      <circle class="ring-pulse" cx="300" cy="300" r="270"/><circle class="ring-pulse d2" cx="300" cy="300" r="270"/>
      <circle id="${mini ? 'mRadiusRing' : 'radiusRing'}" class="ring edge" cx="300" cy="300" r="${State.radius * 90}" style="transition:r .5s cubic-bezier(.2,.9,.2,1)"/>
      ${mini ? '' : LANDMARKS.map(l => { const a = l.angle * Math.PI / 180, r = l.dist * 90; return `<text class="landmark" text-anchor="middle" x="${300 + r * Math.sin(a)}" y="${300 - r * Math.cos(a)}">◇ ${l.name}</text>`; }).join('')}
      ${mini ? '' : `<text class="radar-label" x="300" y="22" text-anchor="middle">N</text>`}
    </svg>
    <div class="heat absolute inset-0 rounded-full transition-opacity duration-700 ${State.heat ? 'opacity-100' : 'opacity-0'}" style="filter:blur(26px);mix-blend-mode:screen">
      ${PROSPECTS.map(p => { const q = polar(p.dist, p.angle); return `<span class="absolute rounded-full" style="left:${q.x}%;top:${q.y}%;width:${p.score / 4}%;height:${p.score / 4}%;transform:translate(-50%,-50%);background:radial-gradient(circle, ${p.tier === 'High' ? '#ef4444' : '#f59e0b'}aa, transparent 70%)"></span>`; }).join('')}
    </div>
    <div class="radar-sweep"></div>
    <div class="center-node"><div class="pin ${mini ? 'scale-75' : ''}">PIM3</div></div>
    ${PROSPECTS.map(p => { const q = polar(p.dist, p.angle); return `<div class="node ${p.tier === 'High' ? 'high' : ''}" data-id="${p.id}" style="left:${q.x}%;top:${q.y}%;--c:${CATS[p.cat].color}"><div class="core"></div></div>`; }).join('')}
    ${mini ? '' : '<div id="tip" class="tip"></div>'}
  </div>`;
}

function applyRadarFilter(root = document) {
  $$('.node', root).forEach(n => {
    const p = PROSPECTS.find(x => x.id == n.dataset.id);
    const show = p.dist <= State.radius && State.cats.has(p.cat) && (!State.highOnly || p.tier === 'High');
    n.classList.toggle('hide', !show);
  });
  $$('.ring', root).forEach(r => r.dataset.km && r.classList.toggle('dim', +r.dataset.km > State.radius));
  const rr = $('#radiusRing', root); if (rr) rr.setAttribute('r', State.radius * 90);
}
const visibleProspects = () => PROSPECTS.filter(p => p.dist <= State.radius && State.cats.has(p.cat) && (!State.highOnly || p.tier === 'High'));

/* ---------- Prospect drawer ---------- */
const OFFERS = {
  brand: p => `Co-branded "${p.name.split(' ')[0]} × Six Hands Bowl" + bundling post-class`,
  comm:  () => 'Community sampling 50 bowl + kode diskon member eksklusif',
  corp:  () => 'Program "Friday Healthy Lunch" — langganan harga korporat',
  loc:   () => 'Resident Privilege Card — diskon & priority pickup',
  acq:   () => 'Member perk — diskon 20% untuk setiap member aktif',
  kol:   () => 'Engineered visit — private tasting + konten kolaborasi',
};
function reviewSignals(p) {
  const base = {
    fitness: ['"Habis kelas langsung lapar, sayang gak ada tempat makan sehat dekat sini"', '"Wish there was a protein bowl spot nearby 🥗"', '"Studio-nya enak, tinggal cari makan clean aja susah"'],
    wellness: ['"Dokternya sarankan diet seimbang, bingung beli di mana"', '"Treatment oke, pengen lanjut pola makan sehat juga"', '"Butuh opsi low-cal yang enak di sekitar PI"'],
    corporate: ['"Kantin terbatas, makan siang sehat harus delivery jauh"', '"Lunch break cuma 1 jam, pilihan healthy minim"', '"Program wellness kantor bagus tapi makanan belum support"'],
    lifestyle: ['"Lokasi premium, F&B sehat sekitar masih sedikit"', '"Concierge sangat membantu rekomendasi restoran"', '"Penghuni banyak keluarga muda yang health-conscious"'],
    community: ['"Abis kopdar enaknya makan bareng yang sehat"', '"Komunitasnya aktif banget tiap minggu!"', '"Sering cari spot after-event yang kids friendly & sehat"'],
  };
  return base[p.cat];
}
function openProspect(p) {
  const c = CATS[p.cat];
  $('#drawer').innerHTML = `
    <div class="relative overflow-hidden p-6 pb-5" style="background:linear-gradient(160deg, ${c.color}26, transparent 60%)">
      <button class="drawer-close absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/5 transition hover:rotate-90 hover:bg-white/10"><i class="fa-solid fa-xmark"></i></button>
      <div class="flex items-center gap-2">${catBadge(p.cat)}<span class="tier tier-${p.tier}">${p.tier} Potential</span></div>
      <h3 class="mt-3 pr-10 text-xl font-extrabold text-white">${p.name}</h3>
      <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span><i class="fa-solid fa-location-dot mr-1" style="color:${c.color}"></i>${p.dist} km dari PIM 3</span>
        <span><i class="fa-solid fa-star mr-1 text-amber-300"></i>${p.rating} (${p.reviews} review)</span>
        <span><i class="fa-brands fa-instagram mr-1 text-pink-300"></i>${p.ig}</span>
      </div>
    </div>
    <div class="space-y-5 p-6 pt-2 stagger">
      <div class="card p-5">
        <div class="flex items-center gap-5">
          ${ring(p.score, { size: 104, stroke: 9, color: c.color, label: 'Score' })}
          <div class="flex-1 space-y-3">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Evidence-First Scoring</div>
            <div><div class="mb-1 flex justify-between text-xs"><span class="text-slate-300">Customer-fit <span class="text-slate-500">(SES A-B ♀ 25-40)</span></span><b class="text-white">${p.fit}</b></div><div class="bar"><i data-w="${p.fit}" style="--c:${c.color}"></i></div></div>
            <div><div class="mb-1 flex justify-between text-xs"><span class="text-slate-300">Feasibility <span class="text-slate-500">(jarak & openness)</span></span><b class="text-white">${p.feas}</b></div><div class="bar"><i data-w="${p.feas}" style="--c:#2DD4BF"></i></div></div>
            <div class="font-mono text-[10.5px] text-slate-500">${p.fit} × ${p.feas} / 100 = <span class="text-lime-300">${p.score}</span></div>
          </div>
        </div>
      </div>
      <div class="card p-5">
        <div class="mb-2 flex items-center gap-2 text-xs font-bold text-lime-300"><i class="fa-solid fa-brain"></i> AI EVIDENCE</div>
        <p class="text-sm leading-relaxed text-slate-300">${p.insight}</p>
        <div class="mt-4 space-y-2">${reviewSignals(p).map(s => `<div class="rounded-xl border-l-2 bg-white/[.03] px-3 py-2 text-xs italic text-slate-400" style="border-color:${c.color}">${s}</div>`).join('')}</div>
        <div class="mt-3 text-[10.5px] text-slate-500"><i class="fa-solid fa-database mr-1"></i>Sumber: Google Maps reviews · Instagram · vector similarity 0.${80 + (p.id % 17)}</div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="card p-4"><div class="text-[10.5px] uppercase tracking-wider text-slate-500">Growth Lever</div><div class="mt-1 text-sm font-semibold text-white">${LEVERS[p.lever]}</div></div>
        <div class="card p-4"><div class="text-[10.5px] uppercase tracking-wider text-slate-500">PIC</div><div class="mt-1 text-sm font-semibold text-white">${p.contact}</div></div>
      </div>
      <div class="card shine border-lime-400/20 p-5" style="background:linear-gradient(135deg, rgba(163,230,53,.08), transparent)">
        <div class="text-[11px] font-bold uppercase tracking-wider text-lime-300"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>AI Recommended Offer</div>
        <div class="mt-2 text-sm font-semibold text-white">${OFFERS[p.lever](p)}</div>
        <div class="mt-2 grid grid-cols-3 gap-2 text-center">
          <div class="rounded-xl bg-white/5 p-2"><div class="text-base font-bold text-white">${Math.round(p.score * .4)}</div><div class="text-[10px] text-slate-400">visit/bln</div></div>
          <div class="rounded-xl bg-white/5 p-2"><div class="text-base font-bold text-white">${rpShort(Math.round(p.score * .4) * 89000)}</div><div class="text-[10px] text-slate-400">revenue</div></div>
          <div class="rounded-xl bg-white/5 p-2"><div class="text-base font-bold text-lime-300">${p.score}%</div><div class="text-[10px] text-slate-400">win prob.</div></div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn-primary flex-1 justify-center" data-act="pipeline"><i class="fa-solid fa-plus"></i> Ke Pipeline</button>
        <button class="btn-ghost flex-1 justify-center" data-act="pitch"><i class="fa-solid fa-wand-magic-sparkles"></i> Generate Pitch</button>
      </div>
    </div>`;
  showDrawer();
  runCounters($('#drawer')); animateRings($('#drawer'));
  $('#drawer [data-act=pipeline]').onclick = () => {
    if (p.stage === 'discovery') p.stage = 'scoring';
    toast(`${p.name} masuk pipeline`, { icon: 'fa-table-columns', sub: `Stage: ${STAGES.find(s => s.id === p.stage).label}` });
    hideDrawer();
  };
  $('#drawer [data-act=pitch]').onclick = () => { State.selected = p; hideDrawer(); navigate('pipeline'); };
}
function showDrawer() { $('#drawer').classList.remove('translate-x-full'); const m = $('#drawerMask'); m.classList.add('opacity-100'); m.classList.remove('pointer-events-none'); }
function hideDrawer() { $('#drawer').classList.add('translate-x-full'); const m = $('#drawerMask'); m.classList.remove('opacity-100'); m.classList.add('pointer-events-none'); }

/* =========================================================
   VIEWS
   ========================================================= */
const Views = {};

/* ---------------- 1. COMMAND CENTER ---------------- */
Views.dashboard = {
  title: 'Command Center', crumb: 'Intelligence',
  render() {
    const high = PROSPECTS.filter(p => p.tier === 'High').length;
    const hour = new Date().getHours();
    const greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
    const kpis = [
      { l: 'Prospek Terpetakan', v: PROSPECTS.length, d: '+4 minggu ini', ic: 'fa-satellite-dish', c: '#60A5FA', s: [8, 10, 12, 15, 17, 20, 24] },
      { l: 'High Potential', v: high, d: 'auto-scored AI', ic: 'fa-fire', c: '#A3E635', s: [2, 3, 3, 5, 6, 7, high] },
      { l: 'Store Visit Teratribusi', v: 201, d: '+38% vs bulan lalu', ic: 'fa-person-walking-arrow-right', c: '#2DD4BF', s: [40, 52, 61, 88, 120, 160, 201] },
      { l: 'Avg Cost / Visit', v: 34000, f: 'rp', d: '−66% vs CPC Rp 100rb', ic: 'fa-coins', c: '#FBBF24', s: [96, 80, 71, 58, 46, 39, 34] },
    ];
    const weeks = [[4, 18], [6, 21], [9, 22], [12, 26], [18, 24], [24, 25], [31, 27], [38, 26], [44, 28], [52, 27], [61, 29], [70, 30]];
    const maxW = 100;
    return `
    <div class="grid gap-4 lg:grid-cols-12">
      <div class="card shine p-6 lg:col-span-8" style="background:linear-gradient(120deg, rgba(163,230,53,.10), rgba(45,212,191,.04) 50%, transparent)">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div class="max-w-xl">
            <div class="inline-flex items-center gap-2 rounded-full bg-lime-400/10 px-3 py-1 text-[11px] font-bold text-lime-300"><span class="live-dot"></span> PILOT PIM 3 · HARI 47 / 90</div>
            <h1 class="mt-3 text-2xl font-extrabold leading-tight text-white md:text-[32px]">${greet}, Owner 👋<br><span class="text-gradient-anim">Every outlet into growth.</span></h1>
            <p class="mt-2 text-sm text-slate-400">AI menemukan <b class="text-white">3 peluang baru</b> & <b class="text-white">1 partner yang perlu dipotong budget-nya</b> sejak login terakhir Anda.</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <button class="btn-primary" data-go="radar"><i class="fa-solid fa-satellite-dish"></i> Buka Prospect Radar</button>
              <button class="btn-ghost" id="btnReport"><i class="fa-solid fa-file-waveform"></i> AI Weekly Report</button>
            </div>
          </div>
          <div class="flex flex-col items-center">${ring(87, { size: 150, stroke: 12, label: 'Growth Score' })}<div class="mt-2 text-xs text-lime-300"><i class="fa-solid fa-arrow-trend-up"></i> +9 poin minggu ini</div></div>
        </div>
        <div class="mt-6 grid grid-cols-3 gap-2 text-[11px]">
          ${[['Month 1', 'Foundation & Capture', 100, '#A3E635'], ['Month 2', 'Intelligence Mapping', 56, '#2DD4BF'], ['Month 3', 'Activation & Scale', 0, '#60A5FA']].map(([m, t, v, c]) => `
            <div><div class="mb-1.5 flex justify-between"><span class="font-semibold text-slate-300">${m} · <span class="text-slate-500">${t}</span></span><span style="color:${c}">${v}%</span></div><div class="bar"><i data-w="${v}" style="--c:${c}"></i></div></div>`).join('')}
        </div>
      </div>

      <div class="card p-5 lg:col-span-4">
        ${sectionHead('Foundation Health', 'Fase 1 — no leaky bucket')}
        <div class="space-y-3">
          ${[['fa-brands fa-google', 'Google Maps Rank', '#2 → target Top 3', 'Locked', '#A3E635'], ['fa-solid fa-star', 'GBP Reviews', '128 review · ⭐ 4.8', '+38 / bln', '#FBBF24'], ['fa-solid fa-bullseye', 'PMax Geofence 0.5-3km', 'ROAS 3.4× · 58 visit', 'Active', '#60A5FA'], ['fa-solid fa-camera', 'KOC / UGC Seeding', '18 / 20 micro-KOL', '90%', '#F472B6']].map(([i, t, s, b, c]) => `
          <div class="flex items-center gap-3 rounded-2xl bg-white/[.03] p-3 transition hover:bg-white/[.06]">
            <div class="kpi-icon" style="--c:${c}"><i class="${i}"></i></div>
            <div class="min-w-0 flex-1"><div class="text-sm font-semibold text-white">${t}</div><div class="text-xs text-slate-400">${s}</div></div>
            <span class="rounded-full px-2 py-0.5 text-[10px] font-bold" style="color:${c};background:${c}1f">${b}</span>
          </div>`).join('')}
        </div>
      </div>

      ${kpis.map(k => `
      <div class="card lift p-5 lg:col-span-3">
        <div class="flex items-start justify-between"><div class="kpi-icon" style="--c:${k.c}"><i class="fa-solid ${k.ic}"></i></div><span class="text-[11px] font-semibold" style="color:${k.c}">${k.d}</span></div>
        <div class="mt-4 text-[12px] text-slate-400">${k.l}</div>
        <div class="text-[28px] font-extrabold tracking-tight text-white" data-count="${k.v}" ${k.f ? `data-fmt="${k.f}"` : ''}>0</div>
        <div class="mt-2">${sparkline(k.s, { color: k.c })}</div>
      </div>`).join('')}

      <div class="card p-5 lg:col-span-4">
        ${sectionHead('Live Radar', 'Radius 3km · PIM 3', `<button class="btn-ghost !py-1.5 !text-[11px]" data-go="radar">Detail <i class="fa-solid fa-arrow-right"></i></button>`)}
        <div class="mx-auto max-w-[320px]">${radarHTML({ mini: true })}</div>
        <div class="mt-3 flex flex-wrap justify-center gap-3 text-[11px] text-slate-400">${Object.values(CATS).map(c => `<span class="flex items-center gap-1.5"><i class="h-2 w-2 rounded-full" style="background:${c.color};box-shadow:0 0 6px ${c.color}"></i>${c.label}</span>`).join('')}</div>
      </div>

      <div class="card p-5 lg:col-span-4">
        ${sectionHead('<i class="fa-solid fa-wand-magic-sparkles mr-1 text-lime-300"></i> AI Copilot', 'Rekomendasi otomatis untuk tim marketing')}
        <div class="space-y-3">
          ${AI_INSIGHTS.map((a, i) => `
          <div class="group flex gap-3 rounded-2xl border border-white/5 bg-white/[.02] p-3 transition hover:border-white/10 hover:bg-white/[.05]" style="animation:rise .6s ${.3 + i * .12}s both">
            <div class="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style="background:${a.color}1f;color:${a.color}"><i class="fa-solid ${a.icon} text-xs"></i></div>
            <div><div class="text-[13px] font-semibold text-white">${a.title}</div><div class="text-xs leading-relaxed text-slate-400">${a.text}</div>
            <button class="mt-1.5 text-[11px] font-semibold text-lime-300 opacity-70 transition group-hover:opacity-100 ai-apply">Terapkan <i class="fa-solid fa-arrow-right text-[9px]"></i></button></div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card p-5 lg:col-span-4">
        ${sectionHead('Live Activity', 'POS × Voucher × GBP — real-time', '<span class="flex items-center gap-2 text-[11px] text-lime-300"><span class="live-dot"></span>LIVE</span>')}
        <div id="liveFeed" class="space-y-2 overflow-hidden" style="height:330px"></div>
      </div>

      <div class="card p-5 lg:col-span-8">
        ${sectionHead('Store Visit Attribution', '12 minggu · partner vs paid ads', `<div class="flex gap-3 text-[11px]"><span class="flex items-center gap-1.5"><i class="h-2 w-2 rounded-sm bg-lime-400"></i>Partner</span><span class="flex items-center gap-1.5"><i class="h-2 w-2 rounded-sm bg-sky-400/60"></i>Paid Ads</span></div>`)}
        <svg viewBox="0 0 640 230" class="w-full">
          ${[0, 25, 50, 75, 100].map(v => `<line x1="30" x2="640" y1="${200 - v * 1.8}" y2="${200 - v * 1.8}" stroke="rgba(255,255,255,.05)"/><text x="0" y="${204 - v * 1.8}" fill="#64748B" font-size="10">${v}</text>`).join('')}
          ${weeks.map(([p, a], i) => { const x = 44 + i * 50, hp = p / maxW * 180, ha = a / maxW * 180; return `
            <g class="group">
              <rect class="grow" x="${x}" y="${200 - ha}" width="28" height="${ha}" rx="5" fill="rgba(56,189,248,.45)" style="animation-delay:${i * 50}ms"/>
              <rect class="grow" x="${x}" y="${200 - ha - hp}" width="28" height="${hp}" rx="5" fill="url(#barG)" style="animation-delay:${i * 50 + 150}ms"/>
              <text x="${x + 14}" y="218" text-anchor="middle" fill="#64748B" font-size="10">W${i + 1}</text>
              <text x="${x + 14}" y="${192 - ha - hp}" text-anchor="middle" fill="#BEF264" font-size="10" font-weight="700" class="opacity-0 transition group-hover:opacity-100">${p + a}</text>
            </g>`; }).join('')}
          <defs><linearGradient id="barG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BEF264"/><stop offset="1" stop-color="#34D399"/></linearGradient></defs>
        </svg>
      </div>

      <div class="card p-5 lg:col-span-4">
        ${sectionHead('Top Partners', 'Cost per visit — makin kecil makin bagus')}
        <div class="space-y-3">
          ${PARTNERS.filter(p => !p.paid).sort((a, b) => a.cost / a.visits - b.cost / b.visits).map((p, i) => `
          <div class="flex items-center gap-3">
            <div class="grid h-7 w-7 place-items-center rounded-lg text-xs font-extrabold ${i === 0 ? 'bg-lime-400 text-ink-950' : 'bg-white/5 text-slate-300'}">${i + 1}</div>
            <div class="min-w-0 flex-1"><div class="truncate text-[13px] font-semibold text-white">${p.name}</div><div class="bar mt-1"><i data-w="${Math.min(100, p.visits / 50 * 100)}" style="--c:${CATS[p.cat].color}"></i></div></div>
            <div class="text-right"><div class="text-[13px] font-bold text-white">${rpShort(p.cost / p.visits)}</div><div class="text-[10px] text-slate-500">${p.visits} visit</div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    animateRings(root);
    $$('.node', root).forEach(n => n.onclick = () => openProspect(PROSPECTS.find(p => p.id == n.dataset.id)));
    $$('.ai-apply', root).forEach(b => b.onclick = () => { b.innerHTML = '<i class="fa-solid fa-check"></i> Diterapkan'; b.classList.add('!opacity-100'); toast('Rekomendasi AI diterapkan', { icon: 'fa-wand-magic-sparkles', sub: 'Budget & kuota voucher diperbarui otomatis' }); });
    $('#btnReport', root).onclick = weeklyReport;

    const feed = $('#liveFeed', root);
    const events = () => {
      const p = pick(PARTNERS.filter(x => !x.paid));
      return pick([
        { ic: 'fa-ticket', c: '#A3E635', t: `<b>${p.code}</b> diredeem · ${pick(MENU_ITEMS)}`, s: `${pick(CUSTOMER_NAMES)} · ${rpShort(rand(65, 140) * 1000)}` },
        { ic: 'fa-cash-register', c: '#2DD4BF', t: `POS #${Math.ceil(rand(0, 3))} · ${pick(MENU_ITEMS)}`, s: `Walk-in · ${rpShort(rand(65, 140) * 1000)}` },
        { ic: 'fa-star', c: '#FBBF24', t: `Review ⭐5 baru di Google Maps`, s: `"${pick(['Bowl terenak di PI!', 'Fresh banget, porsinya pas', 'Habis pilates langsung ke sini 💚', 'Dressing-nya juara'])}"` },
        { ic: 'fa-satellite-dish', c: '#60A5FA', t: `Entitas baru terdeteksi radius ${rand(.5, 3).toFixed(1)}km`, s: `${pick(['Studio Barre', 'Klinik Gizi', 'Padel Court', 'Co-working'])} · auto-scored` },
        { ic: 'fa-robot', c: '#A78BFA', t: `Six Hands disebut oleh ${pick(['ChatGPT', 'Gemini', 'Perplexity'])}`, s: `"${pick(GEO_QUERIES).q}"` },
      ]);
    };
    const push = () => {
      const e = events();
      const el = document.createElement('div');
      el.className = 'feed-item flex items-center gap-3 rounded-xl bg-white/[.03] p-2.5';
      el.innerHTML = `<div class="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style="background:${e.c}1f;color:${e.c}"><i class="fa-solid ${e.ic} text-xs"></i></div><div class="min-w-0 flex-1"><div class="truncate text-[12.5px] text-slate-200">${e.t}</div><div class="truncate text-[11px] text-slate-500">${e.s}</div></div><span class="text-[10px] text-slate-500">baru</span>`;
      feed.prepend(el);
      [...feed.children].slice(7).forEach(x => x.remove());
    };
    for (let i = 0; i < 5; i++) push();
    every(push, 2600);
  },
};

async function weeklyReport() {
  $('#drawer').innerHTML = `
    <div class="p-6">
      <button class="drawer-close float-right grid h-9 w-9 place-items-center rounded-xl bg-white/5 transition hover:rotate-90"><i class="fa-solid fa-xmark"></i></button>
      <div class="text-[11px] font-bold uppercase tracking-wider text-lime-300"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>AI Weekly Report</div>
      <h3 class="mt-1 text-xl font-extrabold text-white">PIM 3 · Minggu ke-7</h3>
      <p class="text-xs text-slate-500">Digenerate dari 12.480 data points · ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
      <div class="mt-5 rounded-2xl border border-white/5 bg-white/[.03] p-4 text-sm leading-relaxed text-slate-300" style="min-height:360px" data-autoscroll><span class="typing-dots"><span></span><span></span><span></span></span></div>
      <div class="mt-4 flex gap-2"><button class="btn-primary flex-1 justify-center" onclick="toast('Report dikirim ke WhatsApp Owner',{icon:'fa-brands fa-whatsapp'})"><i class="fa-brands fa-whatsapp"></i> Kirim ke WA</button><button class="btn-ghost flex-1 justify-center" onclick="toast('PDF berhasil diunduh',{icon:'fa-file-pdf'})"><i class="fa-solid fa-file-pdf"></i> Export PDF</button></div>
    </div>`;
  showDrawer();
  const box = $('#drawer [data-autoscroll]');
  await sleep(1100);
  const span = document.createElement('div'); box.innerHTML = ''; box.appendChild(span);
  typeWrite(span, `📈 RINGKASAN\nStore visit teratribusi naik 38% (201 visit). Cost per visit rata-rata turun ke Rp 34rb — 66% lebih murah dibanding CPC Google Ads.\n\n🏆 WINNER\n1. Reform Pilates — 32 visit @ Rp 28rb. Scale: tambah kuota voucher +40%.\n2. @hannaeats.jkt — 47 visit, 63 redeem. Lanjutkan konten seri ke-2.\n3. Mom's Circle — conversion 83%. Jadwalkan sampling bulanan.\n\n✂️ CUT / REVIEW\nPondok Indah Residences: Rp 100rb/visit. Ganti mekanik ke "resident first-order free drink".\n\n🎯 NEXT ACTION (AI)\n• Outreach Menara Selaras — HR membuka vendor wellness Jumat.\n• Barre Society & Lumière siap dipitch (score 69 & 74).\n• Kirim lookalike audience partner ke Meta Ads → proyeksi CAC −18%.\n\n🤖 GEO\nSix Hands kini #1 di ChatGPT untuk "best healthy bowl Pondok Indah".`, 8);
}

/* ---------------- 2. PROSPECT RADAR ---------------- */
Views.radar = {
  title: 'Prospect Radar', crumb: 'Intelligence',
  render() {
    return `
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[.03] px-4 py-2.5 text-sm">
        <span class="text-slate-400">Terdeteksi</span> <b id="statCount" class="text-white">0</b>
        <span class="mx-2 h-4 w-px bg-white/10"></span><span class="text-slate-400">High</span> <b id="statHigh" class="text-lime-300">0</b>
        <span class="mx-2 h-4 w-px bg-white/10"></span><span class="text-slate-400">Radius</span> <b id="statRad" class="font-mono text-white">3.0km</b>
      </div>
      <div class="ml-auto flex flex-wrap gap-2">
        <button id="btnHeat" class="btn-ghost ${State.heat ? '!border-rose-400/50 !text-rose-300' : ''}"><i class="fa-solid fa-fire-flame-curved"></i> Heatmap</button>
        <button id="btnHigh" class="btn-ghost ${State.highOnly ? '!border-lime-400/50 !text-lime-300' : ''}"><i class="fa-solid fa-filter"></i> High only</button>
        <button id="btnScan" class="btn-primary"><i class="fa-solid fa-satellite-dish"></i> Run Live Scan</button>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-12">
      <div class="card relative p-4 md:p-8 xl:col-span-8">
        <div class="pointer-events-none absolute left-5 top-5 z-10 font-mono text-[10.5px] leading-5 text-lime-300/60">
          LAT -6.2655 · LNG 106.7837<br>GEOFENCE: PIM 3 · SES A-B<br>MODE: <span class="text-lime-300">EVIDENCE-FIRST</span>
        </div>
        <div class="pointer-events-none absolute right-5 top-5 z-10 text-right font-mono text-[10.5px] leading-5 text-slate-500">SWEEP 5.0s<br>NODES <span id="nodeCount" class="text-lime-300">24</span></div>
        ${radarHTML()}
        <div class="mt-4 flex flex-wrap justify-center gap-2" id="catChips">
          ${Object.entries(CATS).map(([k, c]) => `<span class="chip ${State.cats.has(k) ? 'on' : ''}" data-cat="${k}" style="--c:${c.color}"><span class="dot"></span>${c.label} <b class="text-[10px] opacity-60">${PROSPECTS.filter(p => p.cat === k).length}</b></span>`).join('')}
        </div>
      </div>

      <div class="space-y-4 xl:col-span-4">
        <div class="card p-5">
          <div class="flex items-center justify-between"><div class="text-sm font-bold text-white">Radius Geofence</div><div id="radVal" class="font-mono text-lg font-bold text-lime-300">${State.radius.toFixed(1)} km</div></div>
          <input id="radius" type="range" min="0.5" max="3" step="0.1" value="${State.radius}" class="range mt-4" style="--p:${(State.radius - .5) / 2.5 * 100}%"/>
          <div class="mt-2 flex justify-between font-mono text-[10px] text-slate-500"><span>0.5km</span><span>1.5km</span><span>3km</span></div>
        </div>

        <div class="card p-5">
          ${sectionHead('Scraping Pipeline', 'Playwright · Apify · Qdrant · LLM scoring', '<span id="scanState" class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-400">IDLE</span>')}
          <div id="term" class="terminal h-[150px] overflow-y-auto rounded-xl bg-black/40 p-3" data-autoscroll>
            <div class="mut">$ ketemuterus scan --outlet=pim3 --radius=3km</div><div class="mut">Siap. Tekan "Run Live Scan" untuk memulai.</div>
          </div>
          <div class="mt-3 bar"><i id="scanBar" style="--c:#A3E635"></i></div>
        </div>

        <div class="card p-5">
          ${sectionHead('Top Ranked', 'Diurutkan berdasarkan Evidence Score')}
          <div id="topList" class="max-h-[330px] space-y-2 overflow-y-auto pr-1"></div>
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    const wrap = $('#radar', root), tip = $('#tip', root);
    const refresh = () => {
      applyRadarFilter(root);
      const v = visibleProspects();
      $('#statCount').textContent = v.length; $('#statHigh').textContent = v.filter(p => p.tier === 'High').length;
      $('#statRad').textContent = State.radius.toFixed(1) + 'km'; $('#nodeCount').textContent = v.length;
      $('#topList').innerHTML = v.sort((a, b) => b.score - a.score).map(p => `
        <div class="top-item group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/[.05]" data-id="${p.id}">
          <div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style="background:${CATS[p.cat].color}1f;color:${CATS[p.cat].color}"><i class="fa-solid ${CATS[p.cat].icon} text-xs"></i></div>
          <div class="min-w-0 flex-1"><div class="truncate text-[13px] font-semibold text-white">${p.name}</div><div class="text-[11px] text-slate-500">${p.dist} km · ${LEVERS[p.lever]}</div></div>
          <div class="text-right"><div class="text-sm font-extrabold ${p.tier === 'High' ? 'text-lime-300' : p.tier === 'Medium' ? 'text-amber-300' : 'text-slate-400'}">${p.score}</div><div class="text-[9.5px] uppercase text-slate-500">${p.tier}</div></div>
        </div>`).join('');
      $$('.top-item').forEach(el => {
        const n = $(`.node[data-id="${el.dataset.id}"]`, wrap);
        el.onmouseenter = () => { n.classList.remove('ping'); void n.offsetWidth; n.classList.add('ping'); };
        el.onclick = () => openProspect(PROSPECTS.find(p => p.id == el.dataset.id));
      });
    };
    refresh();

    // tooltip
    $$('.node', wrap).forEach(n => {
      const p = PROSPECTS.find(x => x.id == n.dataset.id), c = CATS[p.cat];
      n.onmouseenter = () => {
        tip.innerHTML = `
          <div class="flex items-center justify-between">${catBadge(p.cat)}<span class="tier tier-${p.tier}">${p.tier}</span></div>
          <div class="mt-2 text-sm font-bold text-white">${p.name}</div>
          <div class="text-[11px] text-slate-400">${p.dist} km · ⭐ ${p.rating} · ${LEVERS[p.lever]}</div>
          <div class="mt-3 rounded-xl bg-white/[.04] p-2.5">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evidence-First Scoring</div>
            <div class="mt-1 flex items-baseline gap-1 font-mono text-xs text-slate-300">Fit <b class="text-white">${p.fit}</b> × Feas <b class="text-white">${p.feas}</b> = <b class="text-lg" style="color:${c.color}">${p.score}</b></div>
            <div class="mt-1 text-[11px] font-semibold text-lime-300">${p.tier} Potential ${p.fit >= 80 ? '· SES A-B Match ✓' : ''}</div>
          </div>
          <div class="mt-2 text-[10.5px] text-slate-500">Klik untuk detail & AI pitch →</div>`;
        const r = wrap.getBoundingClientRect(), nr = n.getBoundingClientRect();
        let x = nr.left - r.left + 22, y = nr.top - r.top - 20;
        if (x + 280 > r.width) x = nr.left - r.left - 290;
        if (y + 200 > r.height) y = r.height - 210;
        tip.style.left = x + 'px'; tip.style.top = Math.max(0, y) + 'px';
        tip.classList.add('show');
      };
      n.onmouseleave = () => tip.classList.remove('show');
      n.onclick = () => openProspect(p);
    });

    // radius
    const rg = $('#radius', root);
    rg.oninput = () => {
      State.radius = +rg.value;
      rg.style.setProperty('--p', (State.radius - .5) / 2.5 * 100 + '%');
      $('#radVal').textContent = State.radius.toFixed(1) + ' km';
      refresh();
    };
    // chips
    $$('#catChips .chip', root).forEach(ch => ch.onclick = () => {
      const k = ch.dataset.cat;
      State.cats.has(k) ? State.cats.delete(k) : State.cats.add(k);
      ch.classList.toggle('on'); refresh();
    });
    $('#btnHigh', root).onclick = e => { State.highOnly = !State.highOnly; e.currentTarget.classList.toggle('!border-lime-400/50'); e.currentTarget.classList.toggle('!text-lime-300'); refresh(); };
    $('#btnHeat', root).onclick = e => { State.heat = !State.heat; $('.heat', wrap).classList.toggle('opacity-0', !State.heat); $('.heat', wrap).classList.toggle('opacity-100', State.heat); e.currentTarget.classList.toggle('!border-rose-400/50'); e.currentTarget.classList.toggle('!text-rose-300'); };
    $('#btnScan', root).onclick = e => liveScan(e.currentTarget, wrap, refresh);
  },
};

async function liveScan(btn, wrap, refresh) {
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning…';
  const term = $('#term'), bar = $('#scanBar'), st = $('#scanState');
  st.textContent = 'RUNNING'; st.className = 'rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-bold text-lime-300';
  term.innerHTML = '';
  const log = (cls, t) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = t; term.appendChild(d); term.scrollTop = term.scrollHeight; };
  const nodes = $$('.node', wrap);
  nodes.forEach(n => n.classList.add('hide'));
  const steps = [
    ['mut', '$ ketemuterus scan --outlet=pim3 --radius=3km'],
    ['info', '▸ Launch Playwright cluster (8 workers, rotating proxy)'],
    ['info', '▸ Query Google Maps: pilates, gym, clinic, office, apartment, community…'],
    ['ok', '✓ 1.284 raw places · dedup → 312 entitas'],
    ['info', '▸ Enrich: reviews, IG followers, jam ramai, foto'],
    ['info', '▸ Embedding 312 entitas → Qdrant (cosine)'],
    ['warn', '▸ LLM scoring: Customer-fit × Feasibility…'],
  ];
  for (let i = 0; i < steps.length; i++) { log(...steps[i]); bar.style.width = (i + 1) / (steps.length + 2) * 60 + '%'; await sleep(420); }
  const order = [...PROSPECTS].sort((a, b) => a.angle - b.angle);
  for (let i = 0; i < order.length; i++) {
    const p = order[i], n = $(`.node[data-id="${p.id}"]`, wrap);
    if (p.dist <= State.radius && State.cats.has(p.cat) && (!State.highOnly || p.tier === 'High')) { n.classList.remove('hide'); n.classList.remove('spawn'); void n.offsetWidth; n.classList.add('spawn'); }
    if (i % 3 === 0) log(p.tier === 'High' ? 'ok' : 'mut', `  ${p.tier === 'High' ? '★' : '·'} ${p.name.padEnd(28, ' ').slice(0, 28)} ${String(p.score).padStart(3)}`);
    bar.style.width = 60 + (i + 1) / order.length * 40 + '%';
    await sleep(90);
  }
  log('ok', `✓ Selesai — ${PROSPECTS.length} prospek relevan · ${PROSPECTS.filter(p => p.tier === 'High').length} High Potential`);
  refresh();
  st.textContent = 'DONE'; btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> Run Live Scan';
  toast('Live scan selesai', { icon: 'fa-satellite-dish', sub: `${PROSPECTS.filter(p => p.tier === 'High').length} High Potential siap di-outreach` });
}

/* ---------------- 3. AI DEAL PIPELINE ---------------- */
function pitchText(p) {
  const first = p.contact.split(' ')[0].replace(/[(),]/g, '');
  const offer = OFFERS[p.lever](p);
  const code = 'SIXH-' + p.name.replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');
  const insight = p.insight.split('.')[0].toLowerCase();
  if (State.tone === 'formal') return `Yth. ${p.contact},\n\nPerkenalkan, kami dari Six Hands — premium salad & healthy bowl yang baru hadir di Pondok Indah Mall 3, hanya ${p.dist} km dari ${p.name}.\n\nDari riset kami, ${insight}. Karena itu kami ingin menawarkan kolaborasi:\n\n• ${offer}\n• Kode voucher unik ${code} khusus komunitas Anda\n• Laporan redeem transparan via Partner Portal KetemuTerus\n\nApakah Bapak/Ibu berkenan berdiskusi 15 menit minggu ini?\n\nHormat kami,\nTim Partnership Six Hands Indonesia`;
  if (State.tone === 'genz') return `Haii ${first}! ✨\n\nKita dari Six Hands, salad bar premium yang baru buka di PIM 3 — literally ${p.dist} km dari ${p.name} 🥗💚\n\nKita notice ${insight} — relate banget sama misi kita!\n\nIdenya gini:\n🔥 ${offer}\n🎟️ Kode ${code} buat member kamu\n📊 Kamu bisa pantau redeem-nya live di Partner Portal\n\nKapan bisa ngopi bareng? Kita yang traktir bowl-nya 😆`;
  return `Halo Kak ${first} 👋\n\nSaya dari Six Hands — premium salad & healthy bowl yang baru buka di PIM 3 (sekitar ${p.dist} km dari ${p.name}).\n\nKami lihat ${insight}. Kayaknya pas banget untuk kolaborasi bareng:\n\n✅ ${offer}\n✅ Kode voucher khusus ${code} untuk member Kakak\n✅ Dashboard partner untuk lihat berapa yang redeem\n\nBoleh minta waktu 15 menit minggu ini untuk ngobrol? Kami bawakan sample bowl juga 🥗\n\nSalam hangat,\nTim Partnership Six Hands`;
}

Views.pipeline = {
  title: 'AI Deal Pipeline', crumb: 'Intelligence',
  render() {
    const value = PROSPECTS.filter(p => p.stage !== 'discovery').reduce((s, p) => s + p.score * .4 * 89000 * 12, 0);
    return `
    <div class="mb-4 flex flex-wrap items-center gap-3">
      ${STAGES.map(s => `<div class="flex items-center gap-2 rounded-xl bg-white/[.03] px-3 py-2 text-xs"><i class="fa-solid ${s.icon}" style="color:${s.color}"></i><span class="text-slate-400">${s.label}</span><b class="text-white" data-stagecount="${s.id}">${PROSPECTS.filter(p => p.stage === s.id).length}</b></div>`).join('')}
      <div class="ml-auto rounded-xl border border-lime-400/20 bg-lime-400/[.06] px-4 py-2 text-xs"><span class="text-slate-400">Pipeline value / thn</span> <b class="ml-1 text-lime-300" data-count="${value}" data-fmt="rps">0</b></div>
    </div>
    <div class="flex flex-col gap-4 xl:flex-row">
      <div class="min-w-0 flex-1 overflow-x-auto pb-3">
        <div id="kanban" class="flex gap-3">
          ${STAGES.map(s => `
          <div class="kcol" data-stage="${s.id}">
            <div class="flex items-center gap-2 px-4 pb-2 pt-4">
              <span class="h-2 w-2 rounded-full" style="background:${s.color};box-shadow:0 0 8px ${s.color}"></span>
              <span class="text-[13px] font-bold text-white">${s.label}</span>
              <span class="ml-auto rounded-full bg-white/5 px-2 text-[11px] text-slate-400" data-stagecount="${s.id}">${PROSPECTS.filter(p => p.stage === s.id).length}</span>
            </div>
            <div class="kbody flex max-h-[calc(100vh-270px)] min-h-[200px] flex-col gap-2.5 overflow-y-auto p-3 pt-1"></div>
          </div>`).join('')}
        </div>
      </div>

      <aside class="card w-full shrink-0 p-5 xl:w-[380px]" id="aiPanel"></aside>
    </div>`;
  },
  mount(root) {
    const draw = () => {
      STAGES.forEach(s => {
        const body = $(`.kcol[data-stage="${s.id}"] .kbody`, root);
        body.innerHTML = PROSPECTS.filter(p => p.stage === s.id).sort((a, b) => b.score - a.score).map(p => `
          <div class="kcard ${State.selected?.id === p.id ? 'selected' : ''}" draggable="true" data-id="${p.id}" style="--c:${CATS[p.cat].color}">
            <div class="flex items-start justify-between gap-2"><div class="text-[13px] font-semibold leading-snug text-white">${p.name}</div><span class="tier tier-${p.tier} shrink-0">${p.score}</span></div>
            <div class="mt-2 flex items-center gap-2">${catBadge(p.cat)}<span class="text-[10.5px] text-slate-500">${p.dist} km</span></div>
            <div class="mt-2.5 flex items-center justify-between text-[10.5px] text-slate-500">
              <span><i class="fa-regular fa-user mr-1"></i>${p.contact.split(' (')[0]}</span>
              <span class="text-lime-300/80"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>AI</span>
            </div>
          </div>`).join('') || `<div class="grid flex-1 place-items-center rounded-xl border border-dashed border-white/10 py-8 text-[11px] text-slate-500">Drop di sini</div>`;
      });
      $$('[data-stagecount]', root).forEach(el => (el.textContent = PROSPECTS.filter(p => p.stage === el.dataset.stagecount).length));
      bindCards();
    };
    let dragId = null;
    const bindCards = () => $$('.kcard', root).forEach(c => {
      c.ondragstart = e => { dragId = +c.dataset.id; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
      c.ondragend = () => c.classList.remove('dragging');
      c.onclick = () => { State.selected = PROSPECTS.find(p => p.id == c.dataset.id); $$('.kcard', root).forEach(x => x.classList.toggle('selected', x === c)); aiPanel(); };
    });
    $$('.kcol', root).forEach(col => {
      col.ondragover = e => { e.preventDefault(); col.classList.add('over'); };
      col.ondragleave = e => { if (!col.contains(e.relatedTarget)) col.classList.remove('over'); };
      col.ondrop = e => {
        e.preventDefault(); col.classList.remove('over');
        const p = PROSPECTS.find(x => x.id === dragId); if (!p) return;
        const to = col.dataset.stage; if (p.stage === to) return;
        p.stage = to; State.selected = p; draw();
        const card = $(`.kcard[data-id="${p.id}"]`, root); card?.classList.add('dropped', 'selected');
        const st = STAGES.find(s => s.id === to);
        if (to === 'closed') { const r = card.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2); toast(`Deal closed: ${p.name} 🎉`, { icon: 'fa-handshake', sub: 'Voucher & UTM otomatis dibuat' }); }
        else toast(`${p.name} → ${st.label}`, { icon: st.icon, color: st.color, sub: to === 'sampling' ? 'AI memproyeksikan dampak sampling…' : 'AI memperbarui rekomendasi' });
        aiPanel(to === 'sampling');
      };
    });

    const aiPanel = async (simulate = false) => {
      const p = State.selected || PROSPECTS[0];
      const visits = Math.round(p.score * .4 * (p.stage === 'sampling' ? 1.35 : 1));
      const panel = $('#aiPanel', root);
      panel.innerHTML = `
        <div class="flex items-center gap-2"><div class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime-300 to-emerald-400 text-ink-950"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
          <div><div class="text-sm font-bold text-white">AI Suggester</div><div class="text-[11px] text-slate-500">DeepSeek / Ollama · personalised pitch</div></div></div>
        <div class="mt-4 rounded-2xl bg-white/[.03] p-3">
          <div class="flex items-center justify-between">${catBadge(p.cat)}<span class="tier tier-${p.tier}">${p.tier} · ${p.score}</span></div>
          <div class="mt-2 text-[15px] font-bold text-white">${p.name}</div>
          <div class="text-[11px] text-slate-400">${LEVERS[p.lever]} · ${p.contact}</div>
        </div>

        <div class="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Deal Simulator</div>
        <div class="mt-2 grid grid-cols-3 gap-2 text-center">
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-lg font-extrabold text-white" data-count="${visits}">0</div><div class="text-[10px] text-slate-500">visit / bln</div></div>
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-lg font-extrabold text-white" data-count="${visits * 89000}" data-fmt="rps">0</div><div class="text-[10px] text-slate-500">revenue / bln</div></div>
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-lg font-extrabold text-lime-300" data-count="${Math.round(900000 / Math.max(visits, 1))}" data-fmt="rps">0</div><div class="text-[10px] text-slate-500">cost / visit</div></div>
        </div>
        ${simulate ? `<div class="mt-3 rounded-xl border border-violet-400/20 bg-violet-400/[.07] p-3 text-xs text-violet-200"><i class="fa-solid fa-flask mr-1"></i> Simulasi sampling: 50 bowl → est. <b>${visits}</b> repeat visit (+35%), 18 UGC post, +9 review Google.</div>` : ''}

        <div class="mt-4 flex items-center justify-between">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Draft Pitch</div>
          <div class="flex gap-1">${[['formal', 'Formal'], ['friendly', 'Friendly'], ['genz', 'Gen-Z']].map(([k, l]) => `<button class="tone rounded-lg px-2 py-1 text-[11px] font-semibold transition ${State.tone === k ? 'bg-lime-400 text-ink-950' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tone="${k}">${l}</button>`).join('')}</div>
        </div>
        <div class="mt-2 flex gap-1">${[['whatsapp', 'fa-brands fa-whatsapp'], ['email', 'fa-regular fa-envelope'], ['instagram', 'fa-brands fa-instagram']].map(([k, i]) => `<button class="chan grid h-8 flex-1 place-items-center rounded-lg text-sm transition ${State.channel === k ? 'bg-white/10 text-white' : 'bg-white/[.03] text-slate-500 hover:text-white'}" data-ch="${k}"><i class="${i}"></i></button>`).join('')}</div>
        <div class="mt-2 h-[300px] overflow-y-auto rounded-2xl border border-white/5 bg-black/30 p-4 text-[13px] leading-relaxed text-slate-200" data-autoscroll><div id="pitch"></div></div>
        <div class="mt-3 flex gap-2">
          <button class="btn-primary flex-1 justify-center" id="sendPitch"><i class="fa-solid fa-paper-plane"></i> Kirim</button>
          <button class="btn-ghost" id="copyPitch" title="Copy"><i class="fa-regular fa-copy"></i></button>
          <button class="btn-ghost" id="regen" title="Regenerate"><i class="fa-solid fa-rotate"></i></button>
        </div>`;
      runCounters(panel);
      const out = $('#pitch', panel);
      out.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span><span class="ml-2 text-xs text-slate-500">AI membaca 412 review & profil…</span>';
      $$('.tone', panel).forEach(b => b.onclick = () => { State.tone = b.dataset.tone; aiPanel(); });
      $$('.chan', panel).forEach(b => b.onclick = () => { State.channel = b.dataset.ch; $$('.chan', panel).forEach(x => x.className = x.className.replace('bg-white/10 text-white', 'bg-white/[.03] text-slate-500')); b.className = b.className.replace('bg-white/[.03] text-slate-500', 'bg-white/10 text-white'); });
      $('#regen', panel).onclick = () => aiPanel();
      $('#copyPitch', panel).onclick = () => { navigator.clipboard?.writeText(pitchText(p)); toast('Pitch disalin ke clipboard', { icon: 'fa-copy' }); };
      $('#sendPitch', panel).onclick = () => {
        if (p.stage === 'discovery' || p.stage === 'scoring') { p.stage = 'outreach'; draw(); }
        toast(`Pitch terkirim via ${State.channel}`, { icon: State.channel === 'email' ? 'fa-envelope' : 'fa-paper-plane', sub: `${p.name} dipindah ke Outreach · reminder H+3 dijadwalkan` });
      };
      await sleep(700);
      typeWrite(out, pitchText(p), 9);
    };
    draw(); aiPanel();
  },
};

/* ---------------- 4. LEAK-PROOF FUNNEL ---------------- */
Views.attribution = {
  title: 'Leak-Proof Funnel', crumb: 'Growth',
  render() {
    const flow = [
      { t: 'Partner', s: 'START', v: 5, l: 'partner aktif', ic: 'fa-handshake', c: '#A78BFA' },
      { t: 'Offer / Voucher', s: 'ASSET', v: 191, l: 'voucher diredeem', ic: 'fa-ticket', c: '#F472B6' },
      { t: 'Landing Page', s: 'CONVERT', v: 1240, l: 'kunjungan LP + UTM', ic: 'fa-window-maximize', c: '#60A5FA' },
      { t: 'Store Visit', s: 'ACTION', v: 201, l: 'visit teratribusi', ic: 'fa-store', c: '#2DD4BF' },
      { t: 'Review & GEO', s: 'LOOP', v: 38, l: 'review baru', ic: 'fa-arrows-rotate', c: '#A3E635' },
    ];
    const rows = PARTNERS.map(p => ({ ...p, cpv: p.cost / p.visits, roas: p.revenue / p.cost })).sort((a, b) => a.cpv - b.cpv);
    return `
    <div class="card p-6">
      ${sectionHead('The Flow: Start → Asset → Convert → Action → Loop', 'Setiap visit teratribusi ke partner — bukan vanity metrics', '<span class="flex items-center gap-2 text-[11px] text-lime-300"><span class="live-dot"></span>Streaming data</span>')}
      <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        ${flow.map((f, i) => `
          <div class="flow-node flex-1" style="--c:${f.c}">
            <div class="text-[9.5px] font-bold tracking-[.2em]" style="color:${f.c}">${f.s}</div>
            <div class="ic mt-2"><i class="fa-solid ${f.ic}"></i></div>
            <div class="text-sm font-bold text-white">${f.t}</div>
            <div class="mt-1 text-2xl font-extrabold text-white" data-count="${f.v}">0</div>
            <div class="text-[11px] text-slate-500">${f.l}</div>
          </div>
          ${i < flow.length - 1 ? `
          <div class="relative hidden h-10 w-14 shrink-0 lg:block">
            <svg viewBox="0 0 56 40" class="absolute inset-0 h-full w-full overflow-visible"><path id="fp${i}" d="M0 20 L56 20" stroke="${flow[i + 1].c}" stroke-width="2" class="flow-link" fill="none"/></svg>
            <span class="packet absolute left-0 top-1/2 -mt-1 h-2 w-2 rounded-full" style="background:${flow[i + 1].c};box-shadow:0 0 10px ${flow[i + 1].c};offset-path:path('M0 4 L56 4');animation-delay:${i * .4}s"></span>
          </div>
          <div class="mx-auto h-6 w-px bg-gradient-to-b from-white/20 to-transparent lg:hidden"></div>` : ''}`).join('')}
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-12">
      <div class="card p-6 lg:col-span-5" style="background:linear-gradient(135deg, rgba(163,230,53,.12), transparent 60%)">
        <div class="text-[11px] font-bold uppercase tracking-[.2em] text-lime-300">Cost per Visit per Partner</div>
        <div class="mt-3 flex items-end gap-3"><div class="text-5xl font-extrabold tracking-tight text-white" data-count="28000" data-fmt="rp">0</div><div class="pb-2 text-sm text-slate-400">/visit</div></div>
        <div class="mt-1 text-sm text-slate-400">Reform Pilates · 32 visit tracked dari kode <span class="font-mono text-lime-300">SIXH-RFP</span></div>
        <div class="mt-6 space-y-3">
          <div><div class="mb-1 flex justify-between text-xs"><span class="text-slate-300">Partner (best)</span><b class="text-lime-300">Rp 28rb</b></div><div class="bar lg"><i data-w="28" style="--c:linear-gradient(90deg,#A3E635,#34D399)"></i></div></div>
          <div><div class="mb-1 flex justify-between text-xs"><span class="text-slate-300">Partner (avg)</span><b class="text-white">Rp 34rb</b></div><div class="bar lg"><i data-w="34" style="--c:#2DD4BF"></i></div></div>
          <div><div class="mb-1 flex justify-between text-xs"><span class="text-slate-300">Google Ads CPC → visit</span><b class="text-rose-300">Rp 100rb</b></div><div class="bar lg"><i data-w="100" style="--c:#FB7185"></i></div></div>
        </div>
        <div class="mt-5 rounded-2xl bg-black/30 p-4 text-xs leading-relaxed text-slate-300"><i class="fa-solid fa-lightbulb mr-1 text-amber-300"></i> <b class="text-white">Top 20% partner mendorong 62% visit.</b> AI menyarankan memindahkan Rp 2,4 jt dari PMax broad ke lookalike audience Reform Pilates & @hannaeats.</div>
      </div>

      <div class="card p-6 lg:col-span-7">
        ${sectionHead('Voucher & UTM Generator', 'Unique code per partner — bukti visit nyata')}
        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-3">
            <label class="text-xs text-slate-400">Partner</label>
            <select id="vPartner" class="input">${PROSPECTS.filter(p => p.tier === 'High').map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-xs text-slate-400">Benefit</label><select id="vBenefit" class="input mt-1"><option>Diskon 20%</option><option>Free Drink</option><option>Buy 1 Get 1</option><option>Free Topping</option></select></div>
              <div><label class="text-xs text-slate-400">Kuota</label><input id="vQuota" class="input mt-1" value="100" type="number"/></div>
            </div>
            <button id="vGen" class="btn-primary w-full justify-center"><i class="fa-solid fa-bolt"></i> Generate Voucher</button>
          </div>
          <div id="vOut" class="tilt relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300 p-5 text-ink-950 shadow-[0_30px_60px_-20px_rgba(163,230,53,.5)]">
            <div class="flex items-center justify-between"><div class="text-xs font-extrabold tracking-widest">SIX HANDS</div><i class="fa-solid fa-leaf"></i></div>
            <div class="mt-3 text-[11px] font-semibold opacity-70">Exclusive for</div>
            <div id="vName" class="text-sm font-extrabold leading-tight">Pilih partner →</div>
            <div class="mt-3 flex items-end justify-between gap-3">
              <div><div id="vBen" class="text-2xl font-black">—</div><div id="vCode" class="mt-1 rounded-lg bg-ink-950/90 px-2 py-1 font-mono text-xs font-bold text-lime-300">SIXH-XXXX</div></div>
              <div id="vQr" class="qr w-20 rounded-lg bg-white p-1.5"></div>
            </div>
            <div id="vUtm" class="mt-3 truncate font-mono text-[9.5px] opacity-70">sixhands.id/pim3?utm_source=…</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      ${sectionHead('Partner Leaderboard', 'Scale winners · cut losers · retarget', '<button class="btn-ghost !text-[11px]" onclick="toast(\'Lookalike audience dikirim ke Meta & Google\',{icon:\'fa-bullseye\'})"><i class="fa-solid fa-bullseye"></i> Sync Lookalike</button>')}
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead><tr class="text-[11px] uppercase tracking-wider text-slate-500"><th class="pb-3 font-semibold">Partner</th><th class="pb-3 font-semibold">Kode</th><th class="pb-3 font-semibold">Redeem</th><th class="pb-3 font-semibold">Visit</th><th class="pb-3 font-semibold">Cost / Visit</th><th class="pb-3 font-semibold">ROAS</th><th class="pb-3 font-semibold">Trend 7 mgg</th><th class="pb-3 font-semibold">AI Verdict</th></tr></thead>
          <tbody>
            ${rows.map((p, i) => {
              const v = p.paid ? ['Baseline', '#94A3B8', 'fa-minus'] : p.cpv < 40000 ? ['Scale ↑', '#A3E635', 'fa-arrow-trend-up'] : p.cpv < 60000 ? ['Optimize', '#FBBF24', 'fa-sliders'] : ['Cut ✂', '#FB7185', 'fa-scissors'];
              return `<tr class="border-t border-white/5 transition hover:bg-white/[.03]" style="animation:rise .5s ${i * 70}ms both">
                <td class="py-3"><div class="flex items-center gap-3"><div class="grid h-8 w-8 place-items-center rounded-lg" style="background:${CATS[p.cat].color}1f;color:${CATS[p.cat].color}"><i class="fa-solid ${p.paid ? 'fa-rectangle-ad' : CATS[p.cat].icon} text-xs"></i></div><span class="font-semibold text-white">${p.name}</span></div></td>
                <td class="font-mono text-xs text-lime-300/90">${p.code}</td>
                <td class="text-slate-300">${p.redeems || '—'}</td>
                <td class="font-semibold text-white">${p.visits}</td>
                <td><div class="flex items-center gap-2"><div class="bar w-20"><i data-w="${Math.min(100, p.cpv / 1000)}" style="--c:${v[1]}"></i></div><span class="font-semibold text-white">${rpShort(p.cpv)}</span></div></td>
                <td class="font-semibold" style="color:${p.roas > 4 ? '#A3E635' : '#E2E8F0'}">${p.roas.toFixed(1)}×</td>
                <td class="w-28">${sparkline(p.trend, { w: 100, h: 28, color: CATS[p.cat].color })}</td>
                <td><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style="color:${v[1]};background:${v[1]}1a"><i class="fa-solid ${v[2]} text-[9px]"></i>${v[0]}</span></td>
              </tr>`; }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },
  mount(root) {
    bindTilt(root);
    const gen = () => {
      const p = PROSPECTS.find(x => x.id == $('#vPartner').value);
      const code = 'SIXH-' + p.name.replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      $('#vName').textContent = p.name;
      $('#vBen').textContent = $('#vBenefit').value;
      $('#vCode').textContent = code;
      $('#vUtm').textContent = `sixhands.id/pim3?utm_source=${p.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 14)}&utm_medium=partner&utm_campaign=pim3_q4&code=${code}`;
      let h = 0; for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const finder = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const fOn = (x, y) => { const lx = x > 13 ? x - 14 : x, ly = y > 13 ? y - 14 : y; return lx === 0 || ly === 0 || lx === 6 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4); };
      let cells = '';
      for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
        h = (h * 1103515245 + 12345) >>> 0;
        const on = finder(x, y) ? fOn(x, y) : (h >> 16) % 2 === 0;
        cells += `<i class="${on ? 'on' : ''}" style="animation-delay:${(x + y) * 12}ms;${on ? '' : 'background:transparent'}"></i>`;
      }
      $('#vQr').innerHTML = cells;
    };
    gen();
    $('#vGen', root).onclick = e => { gen(); const r = $('#vOut').getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, 80); toast('Voucher & UTM link dibuat', { icon: 'fa-ticket', sub: `Kuota ${$('#vQuota').value} · otomatis tersinkron ke POS` }); };
    $('#vPartner', root).onchange = gen;
  },
};

/* ---------------- 5. GEO COMMAND CENTER ---------------- */
Views.geo = {
  title: 'GEO Command Center', crumb: 'Growth',
  render() {
    const engines = [
      { n: 'ChatGPT', ic: 'fa-solid fa-comment-dots', c: '#A3E635', v: 71, s: [22, 30, 35, 44, 52, 63, 71] },
      { n: 'Gemini', ic: 'fa-solid fa-gem', c: '#60A5FA', v: 64, s: [18, 22, 31, 40, 48, 55, 64] },
      { n: 'Perplexity', ic: 'fa-solid fa-magnifying-glass', c: '#2DD4BF', v: 58, s: [10, 18, 26, 31, 42, 50, 58] },
      { n: 'Google AI Overview', ic: 'fa-brands fa-google', c: '#FBBF24', v: 49, s: [5, 12, 20, 27, 33, 41, 49] },
    ];
    const W = 12, reviews = [8, 14, 20, 29, 35, 44, 58, 70, 86, 101, 116, 128], share = [4, 6, 9, 12, 18, 24, 31, 38, 47, 55, 63, 71];
    const pts = share.map((v, i) => [40 + i * 52, 190 - v * 2.2]);
    const rk = r => `<span class="rank ${r === 0 ? 'rank-0' : r === 1 ? 'rank-1' : r <= 3 ? 'rank-' + r : 'rank-x'}">${r === 0 ? '—' : '#' + r}</span>`;
    return `
    <div class="grid gap-4 lg:grid-cols-12">
      <div class="card p-6 lg:col-span-4" style="background:radial-gradient(circle at 50% 0%, rgba(163,230,53,.14), transparent 60%)">
        <div class="text-center text-[11px] font-bold uppercase tracking-[.2em] text-lime-300">AI Visibility Score</div>
        <div class="relative mx-auto mt-2 w-[230px]">
          <svg viewBox="0 0 200 120" class="w-full overflow-visible">
            <defs><linearGradient id="gGrad"><stop offset="0" stop-color="#34D399"/><stop offset="1" stop-color="#BEF264"/></linearGradient></defs>
            <path class="gauge-track" d="M20 110 A80 80 0 0 1 180 110"/>
            <path id="gaugeVal" class="gauge-val" d="M20 110 A80 80 0 0 1 180 110" stroke-dasharray="251.3" stroke-dashoffset="251.3"/>
          </svg>
          <div class="absolute inset-x-0 bottom-0 text-center"><div class="text-5xl font-extrabold text-white" data-count="78">0</div><div class="text-xs text-slate-400">/ 100 · <span class="text-lime-300">+12 bulan ini</span></div></div>
        </div>
        <div class="mt-5 grid grid-cols-3 gap-2 text-center">
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-lg font-bold text-white" data-count="62" data-fmt="pct">0</div><div class="text-[10px] text-slate-500">Share of voice</div></div>
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-lg font-bold text-white" data-count="214">0</div><div class="text-[10px] text-slate-500">AI mentions</div></div>
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-lg font-bold text-white" data-count="7">0</div><div class="text-[10px] text-slate-500">query tracked</div></div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:col-span-8">
        ${engines.map(e => `
        <div class="card lift p-5">
          <div class="flex items-center gap-3"><div class="kpi-icon" style="--c:${e.c}"><i class="${e.ic}"></i></div><div><div class="text-sm font-bold text-white">${e.n}</div><div class="text-[11px] text-slate-500">mention rate</div></div>
            <div class="ml-auto text-3xl font-extrabold text-white"><span data-count="${e.v}">0</span><span class="text-base text-slate-500">%</span></div></div>
          <div class="mt-3">${sparkline(e.s, { color: e.c, h: 44 })}</div>
        </div>`).join('')}
      </div>

      <div class="card p-6 lg:col-span-7">
        ${sectionHead('Query Tracking', 'Posisi Six Hands di jawaban AI per engine', '<button class="btn-ghost !text-[11px]" id="addQuery"><i class="fa-solid fa-plus"></i> Track query</button>')}
        <div class="overflow-x-auto">
          <table class="w-full min-w-[560px] text-sm">
            <thead><tr class="text-left text-[11px] uppercase tracking-wider text-slate-500"><th class="pb-3 font-semibold">Query</th><th class="pb-3 font-semibold">Vol/bln</th><th class="pb-3 text-center font-semibold">GPT</th><th class="pb-3 text-center font-semibold">Gemini</th><th class="pb-3 text-center font-semibold">Pplx</th><th class="pb-3 text-center font-semibold">AIO</th><th class="pb-3 text-right font-semibold">Δ</th></tr></thead>
            <tbody id="qBody">
              ${GEO_QUERIES.map((q, i) => `<tr class="geo-q cursor-pointer border-t border-white/5 transition hover:bg-white/[.03]" data-i="${i}" style="animation:rise .5s ${i * 60}ms both">
                <td class="py-2.5 font-medium text-white">"${q.q}"</td><td class="text-slate-400">${q.vol.toLocaleString('id-ID')}</td>
                <td class="text-center">${rk(q.gpt)}</td><td class="text-center">${rk(q.gem)}</td><td class="text-center">${rk(q.ppx)}</td><td class="text-center">${rk(q.aio)}</td>
                <td class="text-right font-bold text-lime-300">▲${q.delta}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card p-6 lg:col-span-5">
        ${sectionHead('<i class="fa-solid fa-flask mr-1 text-lime-300"></i> Live AI Answer Simulator', 'Apa yang dijawab AI ke calon customer?')}
        <select id="simQ" class="input">${GEO_QUERIES.map(q => `<option>${q.q}</option>`).join('')}</select>
        <div class="mt-4 space-y-3">
          <div class="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-lime-400/15 px-4 py-2 text-sm text-lime-100" id="simAsk"></div>
          <div class="flex gap-2"><div class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10"><i class="fa-solid fa-robot text-xs text-slate-200"></i></div>
            <div class="h-[210px] flex-1 overflow-y-auto rounded-2xl rounded-tl-md bg-white/[.05] px-4 py-3 text-[13px] leading-relaxed text-slate-300" data-autoscroll><div id="simAns"></div></div></div>
        </div>
      </div>

      <div class="card p-6 lg:col-span-7">
        ${sectionHead('Reviews → AI Authority', 'Korelasi review & UGC partner dengan share AI mention', '<div class="flex gap-3 text-[11px]"><span class="flex items-center gap-1.5"><i class="h-2 w-2 rounded-sm bg-white/30"></i>Review kumulatif</span><span class="flex items-center gap-1.5"><i class="h-0.5 w-3 bg-lime-400"></i>AI mention %</span></div>')}
        <svg viewBox="0 0 640 220" class="w-full">
          <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A3E635" stop-opacity=".35"/><stop offset="1" stop-color="#A3E635" stop-opacity="0"/></linearGradient></defs>
          ${[0, 25, 50, 75].map(v => `<line x1="30" x2="630" y1="${190 - v * 2.2}" y2="${190 - v * 2.2}" stroke="rgba(255,255,255,.05)"/>`).join('')}
          ${reviews.map((r, i) => `<rect class="grow" x="${28 + i * 52}" y="${190 - r * 1.3}" width="24" height="${r * 1.3}" rx="5" fill="rgba(255,255,255,.08)" style="animation-delay:${i * 50}ms"/><text x="${40 + i * 52}" y="208" fill="#64748B" font-size="10" text-anchor="middle">W${i + 1}</text>`).join('')}
          <path d="${smoothPath(pts)} L${pts.at(-1)[0]},190 L${pts[0][0]},190 Z" fill="url(#areaG)" style="animation:fadeIn 1s 1.2s both"/>
          <path class="draw-line" d="${smoothPath(pts)}" fill="none" stroke="#A3E635" stroke-width="3" stroke-linecap="round" style="filter:drop-shadow(0 0 8px #A3E635)"/>
          ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#05080B" stroke="#A3E635" stroke-width="2" style="animation:pop .4s ${1 + i * .08}s both;transform-origin:${p[0]}px ${p[1]}px"/>`).join('')}
        </svg>
      </div>

      <div class="card p-6 lg:col-span-5">
        ${sectionHead('The Flywheel', 'Compounding, bukan campaign')}
        <div class="relative mx-auto aspect-square w-full max-w-[300px]">
          <svg viewBox="0 0 300 300" class="absolute inset-0 h-full w-full">
            <circle cx="150" cy="150" r="105" fill="none" stroke="rgba(163,230,53,.18)" stroke-width="2" stroke-dasharray="6 8" class="orbit" style="transform-origin:150px 150px"/>
            <circle cx="150" cy="150" r="70" fill="none" stroke="rgba(45,212,191,.12)" stroke-width="1" class="orbit orbit-rev" style="transform-origin:150px 150px"/>
            <g class="orbit" style="transform-origin:150px 150px;animation-duration:6s"><circle cx="150" cy="45" r="6" fill="#A3E635" style="filter:drop-shadow(0 0 10px #A3E635)"/></g>
          </svg>
          <div class="absolute inset-0 grid place-items-center"><div class="text-center"><div class="logo-mark mx-auto"><span>6</span><i></i></div><div class="mt-2 text-[11px] font-bold text-white">SIX HANDS</div><div class="text-[10px] text-slate-500">Top 3 Maps</div></div></div>
          ${[['Partnerships', 'fa-handshake', '#A78BFA', 50, 6], ['Content & Reviews', 'fa-camera', '#F472B6', 94, 50], ['GEO Authority', 'fa-robot', '#A3E635', 50, 94], ['New Customers', 'fa-user-plus', '#2DD4BF', 6, 50]].map(([t, i, c, x, y]) => `
            <div class="absolute -translate-x-1/2 -translate-y-1/2 text-center" style="left:${x}%;top:${y}%">
              <div class="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-ink-900 transition hover:scale-110" style="color:${c};box-shadow:0 0 24px -6px ${c}"><i class="fa-solid ${i}"></i></div>
              <div class="mt-1 whitespace-nowrap text-[10.5px] font-semibold text-slate-300">${t}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    setTimeout(() => ($('#gaugeVal', root).style.strokeDashoffset = 251.3 * (1 - .78)), 80);
    const sim = async () => {
      const q = $('#simQ').value;
      $('#simAsk').textContent = q;
      const ans = $('#simAns');
      ans.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
      await sleep(800);
      const ok = await typeWrite(ans, `Berikut rekomendasi teratas untuk "${q}":\n\n1. Six Hands — Pondok Indah Mall 3. Premium salad & healthy bowl, bahan segar harian. Favorit komunitas pilates & running di Pondok Indah. ⭐ 4.8 (128 review).\n\n2. Green Habit — opsi salad build-your-own.\n\n3. Bowl & Co — poke bowl, cocok untuk delivery.\n\nTips: tanyakan kode partner dari studio/komunitas Anda untuk diskon di Six Hands.`, 7);
      if (ok) ans.innerHTML = ans.innerHTML.replace('Six Hands —', '<mark class="rounded bg-lime-400/25 px-1 font-bold text-lime-200">Six Hands</mark> —');
    };
    sim();
    $('#simQ', root).onchange = sim;
    $$('.geo-q', root).forEach(tr => tr.onclick = () => { $('#simQ').value = GEO_QUERIES[tr.dataset.i].q; sim(); });
    $('#addQuery', root).onclick = () => toast('Query baru ditambahkan', { icon: 'fa-robot', sub: '"salad high protein Pondok Indah" — dicek tiap 24 jam' });
  },
};

/* ---------------- 6. OUTLET EXPANSION ---------------- */
Views.expansion = {
  title: 'Outlet Expansion', crumb: 'Growth',
  render() {
    const st = { live: ['#A3E635', 'LIVE'], ready: ['#2DD4BF', 'PLAYBOOK READY'], scan: ['#60A5FA', 'SCANNING'], planned: ['#94A3B8', 'PLANNED'] };
    return `
    <div class="grid gap-4 xl:grid-cols-12">
      <div class="card relative overflow-hidden p-0 xl:col-span-8" style="min-height:540px">
        <div class="absolute left-5 top-5 z-10">
          <div class="text-[11px] font-bold uppercase tracking-[.2em] text-lime-300">Six Hands Indonesia</div>
          <div class="text-xl font-extrabold text-white">6 Titik · 1 Playbook</div>
          <div class="text-xs text-slate-400">PIM 3 sebagai proof of concept → replikasi ke 5 outlet</div>
        </div>
        <div class="absolute right-5 top-5 z-10 flex flex-col gap-1.5 text-[11px]">${Object.values(st).map(([c, l]) => `<span class="flex items-center gap-2 rounded-lg bg-black/40 px-2 py-1"><i class="h-2 w-2 rounded-full" style="background:${c};box-shadow:0 0 6px ${c}"></i>${l}</span>`).join('')}</div>
        <div id="jkt" class="absolute inset-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 h-full w-full">
            <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a3a"/><stop offset="1" stop-color="#0c2a3a" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,0 L100,0 L100,10 C90,13 82,9 72,12 C62,15 55,10 45,12 C35,14 28,9 18,12 C10,14 5,11 0,13 Z" fill="url(#sea)"/>
            <path d="M0,13 C5,11 10,14 18,12 C28,9 35,14 45,12 C55,10 62,15 72,12 C82,9 90,13 100,10" fill="none" stroke="rgba(45,212,191,.35)" stroke-width=".3"/>
            <ellipse cx="50" cy="52" rx="34" ry="30" fill="none" stroke="rgba(148,163,184,.12)" stroke-width=".6" stroke-dasharray="1.5 1"/>
            <path d="M8,60 C25,58 40,55 52,50 S80,40 96,38" stroke="rgba(148,163,184,.10)" stroke-width="1" fill="none"/>
            <path d="M52,14 C52,30 50,45 44,70 S38,90 36,100" stroke="rgba(148,163,184,.10)" stroke-width="1" fill="none"/>
            <path d="M14,82 C25,78 35,74 44,70" stroke="rgba(148,163,184,.10)" stroke-width="1" fill="none"/>
            ${OUTLETS.filter(o => o.id !== 'pim').map(o => `<path d="M44,70 Q${(44 + o.x) / 2 + 6},${(70 + o.y) / 2 - 8} ${o.x},${o.y}" stroke="${st[o.status][0]}" stroke-opacity=".45" stroke-width=".35" fill="none" class="flow-link" style="stroke-dasharray:1 1.5"/>`).join('')}
          </svg>
          ${OUTLETS.map(o => `<div class="outlet-pin ${o.status === 'live' ? 'live' : ''} ${State.outlet === o.id ? 'sel' : ''}" data-id="${o.id}" style="left:${o.x}%;top:${o.y}%;--c:${st[o.status][0]}"><div class="p"></div><div class="lbl">${o.name}</div></div>`).join('')}
        </div>
      </div>

      <div class="space-y-4 xl:col-span-4">
        <div class="card p-5" id="outletPanel"></div>
        <div class="card p-5">
          ${sectionHead('AI Site Selection', 'Rekomendasi lokasi ke-7 berdasarkan density prospek')}
          ${[['Senayan City', 94], ['Bintaro Jaya Xchange', 88], ['Alam Sutera', 81]].map(([n, s], i) => `
          <div class="mb-3 flex items-center gap-3"><div class="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-xs font-bold text-slate-300">${i + 1}</div><div class="flex-1"><div class="text-sm font-semibold text-white">${n}</div><div class="bar mt-1"><i data-w="${s}" style="--c:#2DD4BF"></i></div></div><b class="text-sm text-teal-300">${s}</b></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card p-6">
      ${sectionHead('Outlet Benchmark', 'Satu dashboard untuk semua cabang')}
      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-sm">
          <thead><tr class="text-left text-[11px] uppercase tracking-wider text-slate-500"><th class="pb-3 font-semibold">Outlet</th><th class="pb-3 font-semibold">Status</th><th class="pb-3 font-semibold">Prospek 3km</th><th class="pb-3 font-semibold">High Potential</th><th class="pb-3 font-semibold">Partner aktif</th><th class="pb-3 font-semibold">Opportunity density</th><th class="pb-3 font-semibold">Launch</th></tr></thead>
          <tbody>${OUTLETS.map(o => `<tr class="border-t border-white/5 transition hover:bg-white/[.03]">
            <td class="py-3"><div class="font-semibold text-white">${o.name}</div><div class="text-[11px] text-slate-500">${o.area}</div></td>
            <td><span class="rounded-full px-2 py-0.5 text-[10px] font-bold" style="color:${st[o.status][0]};background:${st[o.status][0]}1a">${st[o.status][1]}</span></td>
            <td class="text-white">${o.prospects || '—'}</td><td class="font-semibold text-lime-300">${o.high || '—'}</td><td class="text-white">${o.partners || '—'}</td>
            <td><div class="bar w-32"><i data-w="${o.prospects / 46 * 100}" style="--c:${st[o.status][0]}"></i></div></td>
            <td class="text-slate-400">${o.eta}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  },
  mount(root) {
    const st = { live: '#A3E635', ready: '#2DD4BF', scan: '#60A5FA', planned: '#94A3B8' };
    const panel = () => {
      const o = OUTLETS.find(x => x.id === State.outlet);
      $('#outletPanel').innerHTML = `
        <div class="flex items-center justify-between"><div><div class="text-[11px] uppercase tracking-wider text-slate-500">${o.area}</div><div class="text-lg font-extrabold text-white">${o.name}</div></div><span class="rounded-full px-2 py-0.5 text-[10px] font-bold" style="color:${st[o.status]};background:${st[o.status]}1a">${o.eta}</span></div>
        <div class="mt-4 grid grid-cols-3 gap-2 text-center">
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-xl font-extrabold text-white" data-count="${o.prospects}">0</div><div class="text-[10px] text-slate-500">prospek</div></div>
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-xl font-extrabold text-lime-300" data-count="${o.high}">0</div><div class="text-[10px] text-slate-500">high</div></div>
          <div class="rounded-xl bg-white/[.04] p-2.5"><div class="text-xl font-extrabold text-white" data-count="${o.partners}">0</div><div class="text-[10px] text-slate-500">partner</div></div>
        </div>
        <div id="cloneSteps" class="mt-4 space-y-2 text-xs"></div>
        ${o.status === 'live' ? `<button class="btn-primary mt-4 w-full justify-center" data-go="dashboard"><i class="fa-solid fa-gauge-high"></i> Buka Dashboard PIM 3</button>`
          : `<button id="cloneBtn" class="btn-primary mt-4 w-full justify-center"><i class="fa-solid fa-clone"></i> Clone Playbook PIM 3 → ${o.name}</button>`}`;
      runCounters($('#outletPanel'));
      $('#cloneBtn')?.addEventListener('click', async e => {
        const b = e.currentTarget; b.disabled = true; b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cloning…';
        const steps = ['Salin scoring model & bobot persona', 'Set geofence 3km & scan Google Maps', 'Embedding + LLM scoring prospek', 'Generate outreach sequence & voucher', 'Setup GBP checklist & PMax template'];
        const box = $('#cloneSteps');
        for (const s of steps) {
          const d = document.createElement('div'); d.className = 'flex items-center gap-2 rounded-lg bg-white/[.03] p-2 feed-item';
          d.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-teal-300"></i><span class="text-slate-300">${s}</span>`; box.appendChild(d);
          await sleep(650); d.firstElementChild.className = 'fa-solid fa-circle-check text-lime-300';
        }
        b.innerHTML = '<i class="fa-solid fa-check"></i> Playbook siap'; const r = b.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top);
        toast(`Playbook ${o.name} siap`, { icon: 'fa-clone', sub: `${o.prospects} prospek · ${o.high} High Potential` });
      });
    };
    panel();
    $$('.outlet-pin', root).forEach(pin => pin.onclick = () => { State.outlet = pin.dataset.id; $$('.outlet-pin', root).forEach(x => x.classList.toggle('sel', x === pin)); panel(); });
  },
};

/* ---------------- 7. CUSTOMER DATA & POS ---------------- */
Views.cdp = {
  title: 'Customer Data & POS', crumb: 'Ecosystem',
  render() {
    const segs = [['Pilates Girls', 34, '#34D399'], ['Corporate Lunchers', 24, '#60A5FA'], ['Healthy Moms', 18, '#F472B6'], ['Weekend Runners', 12, '#A78BFA'], ['Mall Walk-in', 12, '#FBBF24']];
    const C = 2 * Math.PI * 70; let acc = 0;
    return `
    <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-violet-400/20 bg-gradient-to-r from-violet-500/10 to-transparent px-5 py-3 text-sm">
      <i class="fa-solid fa-flask text-violet-300"></i><b class="text-white">Preview Fase 4</b><span class="text-slate-400">Integrasi POS (Moka · ESB · Pawoon) + Customer Data Platform + WhatsApp CRM</span>
      <button class="btn-ghost ml-auto !text-[11px]" data-go="roadmap">Lihat roadmap <i class="fa-solid fa-arrow-right"></i></button>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      ${[['Unique Customers', 3482, '', 'fa-users', '#60A5FA', '+412 bln ini'], ['Repeat Rate', 38, 'pct', 'fa-repeat', '#A3E635', '+6 pts'], ['Avg Order Value', 92000, 'rp', 'fa-receipt', '#FBBF24', 'Rp 89rb → 92rb'], ['Customer LTV', 1140000, 'rps', 'fa-gem', '#F472B6', 'prediksi 12 bln']].map(([l, v, f, i, c, d]) => `
      <div class="card lift p-5"><div class="flex justify-between"><div class="kpi-icon" style="--c:${c}"><i class="fa-solid ${i}"></i></div><span class="text-[11px] font-semibold" style="color:${c}">${d}</span></div><div class="mt-4 text-xs text-slate-400">${l}</div><div class="text-[28px] font-extrabold text-white" data-count="${v}" ${f ? `data-fmt="${f}"` : ''}>0</div></div>`).join('')}
    </div>
    <div class="grid gap-4 xl:grid-cols-12">
      <div class="card p-5 xl:col-span-5">
        ${sectionHead('<i class="fa-solid fa-cash-register mr-1 text-teal-300"></i> Live POS Stream', 'Setiap transaksi otomatis tersambung ke sumber akuisisi', '<span class="flex items-center gap-2 text-[11px] text-lime-300"><span class="live-dot"></span>LIVE</span>')}
        <div class="mb-3 flex items-baseline gap-2"><span class="text-xs text-slate-400">Omzet hari ini</span><b id="todayRev" class="text-xl text-white">Rp 0</b><span class="text-xs text-lime-300" id="todayTx">0 trx</span></div>
        <div id="posFeed" class="space-y-2 overflow-hidden" style="height:380px"></div>
      </div>
      <div class="card p-5 xl:col-span-3">
        ${sectionHead('Segmen AI', 'Clustering otomatis dari perilaku')}
        <div class="relative mx-auto w-[190px]">
          <svg viewBox="0 0 180 180" class="-rotate-90">${segs.map(([, v, c]) => { const len = v / 100 * C, s = `<circle class="donut-seg" cx="90" cy="90" r="70" fill="none" stroke="${c}" stroke-width="20" stroke-dasharray="0 ${C}" data-len="${len - 2}" stroke-dashoffset="${-acc}"/>`; acc += len; return s; }).join('')}</svg>
          <div class="absolute inset-0 grid place-items-center text-center"><div><div class="text-2xl font-extrabold text-white">5</div><div class="text-[10px] text-slate-500">segmen</div></div></div>
        </div>
        <div class="mt-4 space-y-2">${segs.map(([n, v, c]) => `<div class="flex items-center gap-2 text-xs"><i class="h-2.5 w-2.5 rounded-sm" style="background:${c}"></i><span class="flex-1 text-slate-300">${n}</span><b class="text-white">${v}%</b></div>`).join('')}</div>
      </div>
      <div class="space-y-4 xl:col-span-4">
        <div class="card shine p-5" style="background:linear-gradient(135deg, rgba(163,230,53,.1), transparent)">
          <div class="text-[11px] font-bold uppercase tracking-wider text-lime-300"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Next Best Action</div>
          <div class="mt-2 text-sm font-semibold text-white">214 "Pilates Girls" belum kembali 21 hari</div>
          <p class="mt-1 text-xs text-slate-400">AI menyarankan broadcast WA: "Post-class Glow Bowl — gratis add-on protein hari ini". Prediksi win-back 27% ≈ Rp 5,2 jt.</p>
          <button class="btn-primary mt-3 w-full justify-center" id="wa"><i class="fa-brands fa-whatsapp"></i> Kirim Broadcast</button>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3"><div class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 to-violet-400 font-bold text-ink-950">AP</div>
            <div><div class="text-sm font-bold text-white">Anindya P.</div><div class="text-[11px] text-slate-500">Customer 360 · via SIXH-RFP</div></div><span class="tier tier-High ml-auto">VIP</span></div>
          <div class="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]"><div class="rounded-lg bg-white/[.04] p-2"><b class="block text-sm text-white">14×</b>visit</div><div class="rounded-lg bg-white/[.04] p-2"><b class="block text-sm text-white">Rp 1,3jt</b>spend</div><div class="rounded-lg bg-white/[.04] p-2"><b class="block text-sm text-white">Glow</b>favorit</div></div>
          <div class="mt-3 flex flex-wrap gap-1.5 text-[10.5px]">${['Pilates', 'Vegan-curious', 'Lunch 12-13', 'No onion', 'Reviewer ⭐5'].map(t => `<span class="rounded-full bg-white/5 px-2 py-0.5 text-slate-300">${t}</span>`).join('')}</div>
        </div>
        <div class="card p-5">
          ${sectionHead('Menu Intelligence', 'Top seller × partner source')}
          ${MENU_ITEMS.slice(0, 5).map((m, i) => `<div class="mb-2.5"><div class="mb-1 flex justify-between text-xs"><span class="text-slate-300">${m}</span><b class="text-white">${[412, 356, 298, 241, 188][i]}</b></div><div class="bar"><i data-w="${[100, 86, 72, 58, 46][i]}" style="--c:${['#A3E635', '#34D399', '#2DD4BF', '#60A5FA', '#A78BFA'][i]}"></i></div></div>`).join('')}
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    setTimeout(() => $$('.donut-seg', root).forEach(s => s.setAttribute('stroke-dasharray', `${s.dataset.len} ${2 * Math.PI * 70}`)), 100);
    let rev = 4250000, tx = 47;
    const feed = $('#posFeed', root);
    const push = (init) => {
      const amt = Math.round(rand(65, 160)) * 1000;
      const src = pick([['SIXH-RFP', '#34D399'], ['SIXH-MOM', '#F472B6'], ['SIXH-HNA', '#A78BFA'], ['Walk-in', '#94A3B8'], ['GrabFood', '#22C55E'], ['PMax Ads', '#60A5FA'], ['Walk-in', '#94A3B8']]);
      const el = document.createElement('div');
      el.className = (init ? '' : 'feed-item ') + 'flex items-center gap-3 rounded-xl bg-white/[.03] p-2.5';
      el.innerHTML = `<div class="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-xs font-bold text-slate-300">${pick(CUSTOMER_NAMES).slice(0, 2).toUpperCase()}</div>
        <div class="min-w-0 flex-1"><div class="truncate text-[12.5px] font-medium text-white">${pick(MENU_ITEMS)}${Math.random() < .3 ? ' + Kombucha' : ''}</div><div class="text-[10.5px] text-slate-500">${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · POS #${Math.ceil(rand(0, 3))}</div></div>
        <span class="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold" style="color:${src[1]};background:${src[1]}1a">${src[0]}</span>
        <b class="w-16 text-right text-[12.5px] text-white">${rpShort(amt)}</b>`;
      feed.prepend(el); [...feed.children].slice(8).forEach(x => x.remove());
      if (!init) { countUp($('#todayRev'), rev + amt, { from: rev, dur: 700, fmt: v => rupiah(v) }); rev += amt; tx++; $('#todayTx').textContent = tx + ' trx'; }
    };
    for (let i = 0; i < 7; i++) push(true);
    countUp($('#todayRev', root), rev, { fmt: v => rupiah(v) }); $('#todayTx', root).textContent = tx + ' trx';
    every(() => push(false), 2200);
    $('#wa', root).onclick = e => { const r = e.currentTarget.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top, 60); toast('Broadcast terjadwal ke 214 customer', { icon: 'fa-brands fa-whatsapp', color: '#22C55E', sub: 'Dikirim bertahap 11:00–11:30 (anti-spam)' }); };
  },
};

/* ---------------- 8. PARTNER PORTAL ---------------- */
Views.portal = {
  title: 'Partner Portal', crumb: 'Ecosystem',
  render() {
    const p = PARTNERS.find(x => x.id === State.portalPartner) || PARTNERS[0];
    const tierPct = Math.min(100, p.visits / 50 * 100);
    return `
    <div class="flex flex-wrap items-center gap-3">
      <div class="text-sm text-slate-400"><i class="fa-solid fa-eye mr-1"></i> Preview sebagai mitra:</div>
      ${PARTNERS.filter(x => !x.paid).map(x => `<span class="chip ${x.id === p.id ? 'on' : ''}" data-pp="${x.id}" style="--c:${CATS[x.cat].color}"><span class="dot"></span>${x.name}</span>`).join('')}
    </div>
    <div class="portal-light overflow-hidden p-5 md:p-8">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2"><div class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white"><i class="fa-solid fa-leaf"></i></div><div class="leading-tight"><div class="text-sm font-extrabold">Six Hands</div><div class="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Partner Portal</div></div></div>
        <div class="ml-auto flex items-center gap-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>${p.name}</div>
      </div>
      <div class="mt-6 grid gap-4 lg:grid-cols-12">
        <div class="pcard p-6 lg:col-span-7" style="background:linear-gradient(135deg,#ECFCCB,#fff 60%)">
          <div class="text-sm text-slate-500">Halo, partner hebat 👋</div>
          <div class="mt-1 text-2xl font-extrabold">Member Anda sudah menikmati <span class="text-emerald-600" data-count="${p.redeems || p.visits}">0</span> bowl sehat bulan ini.</div>
          <div class="mt-5 grid grid-cols-3 gap-3">
            <div class="rounded-2xl bg-white p-3 shadow-sm"><div class="text-[11px] text-slate-500">Voucher redeem</div><div class="text-2xl font-extrabold" data-count="${p.redeems || p.visits}">0</div></div>
            <div class="rounded-2xl bg-white p-3 shadow-sm"><div class="text-[11px] text-slate-500">Store visit</div><div class="text-2xl font-extrabold" data-count="${p.visits}">0</div></div>
            <div class="rounded-2xl bg-white p-3 shadow-sm"><div class="text-[11px] text-slate-500">Reward Anda</div><div class="text-2xl font-extrabold text-emerald-600" data-count="${p.visits * 15000}" data-fmt="rps">0</div></div>
          </div>
          <div class="mt-5">
            <div class="mb-1.5 flex justify-between text-xs font-semibold"><span>🥇 Gold Partner</span><span class="text-slate-500">${Math.max(0, 50 - p.visits)} visit lagi → 💎 Platinum</span></div>
            <div class="h-3 overflow-hidden rounded-full bg-slate-200"><div class="portal-bar h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-1000" style="width:0" data-w="${tierPct}"></div></div>
          </div>
        </div>
        <div class="pcard flex flex-col items-center justify-center p-6 text-center lg:col-span-5">
          <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Kode Voucher Member</div>
          <div class="mt-2 rounded-2xl bg-slate-900 px-5 py-3 font-mono text-2xl font-black tracking-wider text-lime-300">${p.code}</div>
          <div class="mt-2 text-xs text-slate-500">Diskon 20% · berlaku s/d 31 Des 2026</div>
          <div class="mt-4 flex gap-2">
            <button class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:scale-105 active:scale-95" onclick="toast('Link voucher disalin',{icon:'fa-link'})"><i class="fa-solid fa-link mr-1"></i>Share link</button>
            <button class="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold transition hover:scale-105 active:scale-95" onclick="toast('Poster QR diunduh',{icon:'fa-qrcode'})"><i class="fa-solid fa-qrcode mr-1"></i>Poster QR</button>
          </div>
        </div>
        <div class="pcard p-6 lg:col-span-7">
          <div class="mb-4 flex items-center justify-between"><div class="font-bold">Redeem terbaru</div><span class="text-xs text-slate-500">real-time dari POS</span></div>
          ${CUSTOMER_NAMES.slice(0, 5).map((n, i) => `<div class="flex items-center gap-3 border-t border-slate-100 py-2.5 text-sm first:border-0"><div class="grid h-8 w-8 place-items-center rounded-full bg-lime-100 text-xs font-bold text-emerald-700">${n.slice(0, 1)}</div><div class="flex-1"><div class="font-semibold">${n.replace(/ .*/, '')} •••</div><div class="text-[11px] text-slate-500">${MENU_ITEMS[i]}</div></div><div class="text-xs text-slate-500">${[3, 18, 42, 65, 120][i]} mnt lalu</div></div>`).join('')}
        </div>
        <div class="pcard p-6 lg:col-span-5">
          <div class="font-bold">Co-marketing Kit</div>
          <div class="mt-3 grid grid-cols-2 gap-3">
            ${[['IG Story Template', 'fa-brands fa-instagram', '#EC4899'], ['Poster A4', 'fa-solid fa-image', '#10B981'], ['Caption AI', 'fa-solid fa-wand-magic-sparkles', '#8B5CF6'], ['Laporan Bulanan', 'fa-solid fa-file-pdf', '#F59E0B']].map(([t, i, c]) => `<button class="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:-translate-y-1 hover:shadow-lg" onclick="toast('${t} diunduh',{icon:'fa-download'})"><i class="${i} text-lg" style="color:${c}"></i><div class="mt-2 text-xs font-bold">${t}</div></button>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    setTimeout(() => $$('.portal-bar', root).forEach(b => (b.style.width = b.dataset.w + '%')), 150);
    $$('[data-pp]', root).forEach(c => c.onclick = () => { State.portalPartner = +c.dataset.pp; navigate('portal'); });
  },
};

/* ---------------- 9. ROADMAP ---------------- */
Views.roadmap = {
  title: 'Product Roadmap', crumb: 'Ecosystem',
  render() {
    const phases = [
      { n: '01', t: 'Foundation & Capture', d: 'Okt 2026', s: 'done', c: '#A3E635', f: ['GBP optimization tracker', 'PMax geofence 0.5–3km', 'KOC/UGC seeding manager', 'Review monitoring'] },
      { n: '02', t: 'Prospect Intelligence', d: 'Nov 2026', s: 'live', c: '#34D399', f: ['Live radar & geofence', 'Playwright/Apify scraping', 'Evidence-First scoring', 'Qdrant semantic search'] },
      { n: '03', t: 'AI Outreach & CRM', d: 'Des 2026', s: 'build', c: '#2DD4BF', f: ['AI pitch generator (multi-tone)', 'Kanban deal pipeline', 'WhatsApp Business API', 'Auto follow-up sequence'] },
      { n: '04', t: 'Attribution & GEO', d: 'Jan 2027', s: 'beta', c: '#60A5FA', f: ['Voucher + UTM per partner', 'Cost per visit engine', 'GEO tracker (GPT/Gemini/Pplx)', 'Partner portal'] },
      { n: '05', t: 'CDP + POS Integration', d: 'Q1 2027', s: 'next', c: '#A78BFA', f: ['Integrasi Moka / ESB / Pawoon', 'Customer 360 & segmentasi AI', 'Loyalty "Six Hands Club"', 'WA CRM broadcast'] },
      { n: '06', t: 'Multi-Outlet OS', d: 'Q2 2027', s: 'next', c: '#F472B6', f: ['Playbook cloning 5 outlet', 'AI site selection', 'Demand forecasting & inventory', 'Menu intelligence'] },
      { n: '07', t: 'Ecosystem & Marketplace', d: '2027+', s: 'vision', c: '#FBBF24', f: ['B2B corporate catering portal', 'Membership & subscription bowl', 'AI nutrition coach (chat)', 'Franchise readiness kit'] },
    ];
    const lab = { done: 'SELESAI', live: 'LIVE', build: 'IN BUILD', beta: 'BETA', next: 'NEXT', vision: 'VISION' };
    const stack = [['Vue 3 + Vite', 'fa-brands fa-vuejs', '#42B883'], ['Node.js API', 'fa-brands fa-node-js', '#84CC16'], ['PostgreSQL + PostGIS', 'fa-solid fa-database', '#60A5FA'], ['Playwright / Apify', 'fa-solid fa-spider', '#F472B6'], ['Qdrant Vector DB', 'fa-solid fa-diagram-project', '#F43F5E'], ['LLM: Claude / DeepSeek / Ollama', 'fa-solid fa-brain', '#A78BFA'], ['Redis + BullMQ', 'fa-solid fa-layer-group', '#EF4444'], ['WhatsApp Business API', 'fa-brands fa-whatsapp', '#22C55E'], ['POS API (Moka/ESB)', 'fa-solid fa-cash-register', '#FBBF24'], ['Mapbox GL / deck.gl', 'fa-solid fa-map', '#2DD4BF']];
    return `
    <div class="card p-6" style="background:radial-gradient(circle at 0% 0%, rgba(163,230,53,.12), transparent 50%)">
      <div class="text-[11px] font-bold uppercase tracking-[.2em] text-lime-300">KetemuTerus Growth OS</div>
      <h2 class="mt-1 text-2xl font-extrabold text-white md:text-3xl">Dari scraping tool → <span class="text-gradient-anim">sistem operasi pertumbuhan</span> Six Hands.</h2>
      <p class="mt-2 max-w-3xl text-sm text-slate-400">6 lokasi selesai bukan akhir. Setiap fase membuka data baru yang memperkuat fase berikutnya — dari prospek, ke deal, ke visit, ke customer, ke cabang baru.</p>
    </div>
    <div class="relative">
      <div class="absolute bottom-0 left-[27px] top-0 w-px bg-gradient-to-b from-lime-400 via-violet-400 to-transparent md:left-1/2"></div>
      <div class="space-y-5">
        ${phases.map((p, i) => `
        <div class="relative flex flex-col gap-4 pl-16 md:flex-row md:pl-0 ${i % 2 ? 'md:flex-row-reverse' : ''} ${i ? 'md:-mt-20' : ''}" style="animation:rise .6s ${i * 90}ms both">
          <div class="absolute left-[14px] top-5 grid h-7 w-7 place-items-center rounded-full border-2 bg-ink-950 text-[10px] font-bold md:left-1/2 md:-translate-x-1/2" style="border-color:${p.c};color:${p.c};box-shadow:0 0 18px ${p.c}">${p.s === 'done' ? '<i class="fa-solid fa-check"></i>' : p.n}</div>
          <div class="md:w-1/2 ${i % 2 ? 'md:pl-10' : 'md:pr-10'}">
            <div class="card lift tilt p-5">
              <div class="flex items-center justify-between"><span class="font-mono text-xs text-slate-500">FASE ${p.n} · ${p.d}</span><span class="rounded-full px-2 py-0.5 text-[10px] font-bold" style="color:${p.c};background:${p.c}1a">${lab[p.s]}</span></div>
              <div class="mt-2 text-lg font-bold text-white">${p.t}</div>
              <div class="mt-3 grid grid-cols-2 gap-2">${p.f.map(f => `<div class="flex items-start gap-2 text-xs text-slate-300"><i class="fa-solid fa-circle-check mt-0.5 text-[10px]" style="color:${p.c}"></i>${f}</div>`).join('')}</div>
            </div>
          </div>
          <div class="hidden md:block md:w-1/2"></div>
        </div>`).join('')}
      </div>
    </div>
    <div class="card p-6">
      ${sectionHead('Tech Stack', 'Modern, AI-native, scalable ke 6+ outlet')}
      <div class="grid grid-cols-2 gap-3 md:grid-cols-5">
        ${stack.map(([n, i, c]) => `<div class="group rounded-2xl border border-white/5 bg-white/[.03] p-4 text-center transition hover:-translate-y-1 hover:border-white/15"><i class="${i} text-2xl transition group-hover:scale-125" style="color:${c};filter:drop-shadow(0 0 10px ${c}88)"></i><div class="mt-2 text-[11.5px] font-semibold text-slate-300">${n}</div></div>`).join('')}
      </div>
    </div>`;
  },
  mount(root) { bindTilt(root); },
};
