/* =========================================================
   KetemuTerus x Six Hands — Mock Data (PIM 3 Pilot)
   Semua data di bawah adalah data simulasi untuk mockup.
   ========================================================= */

const CATS = {
  fitness:   { label: 'Fitness',   color: '#34D399', icon: 'fa-dumbbell' },
  wellness:  { label: 'Wellness',  color: '#F472B6', icon: 'fa-spa' },
  corporate: { label: 'Corporate', color: '#60A5FA', icon: 'fa-building' },
  lifestyle: { label: 'Lifestyle', color: '#FBBF24', icon: 'fa-champagne-glasses' },
  community: { label: 'Community', color: '#A78BFA', icon: 'fa-people-group' },
};

const LEVERS = {
  acq:   'Customer Acquisition',
  brand: 'Brand Partnership',
  comm:  'Community',
  corp:  'Corporate',
  loc:   'Location Ecosystem',
  kol:   'Creator / KOL',
};

const STAGES = [
  { id: 'discovery', label: 'Discovery',          icon: 'fa-satellite-dish', color: '#94A3B8' },
  { id: 'scoring',   label: 'Evidence Scoring',   icon: 'fa-scale-balanced', color: '#60A5FA' },
  { id: 'outreach',  label: 'Outreach',           icon: 'fa-paper-plane',    color: '#FBBF24' },
  { id: 'sampling',  label: 'Community Sampling', icon: 'fa-bowl-food',      color: '#A78BFA' },
  { id: 'closed',    label: 'Deal Closed',        icon: 'fa-handshake',      color: '#34D399' },
];

/* angle: derajat dari utara searah jarum jam, dist: km dari PIM 3 */
const PROSPECTS = [
  { id: 1,  name: 'Reform Pilates Studio PI',      cat: 'fitness',   lever: 'brand', dist: 0.6, angle: 35,  fit: 96, feas: 92, rating: 4.9, reviews: 412, ig: '18.2K', stage: 'closed',
    insight: '34 review menyebut "lapar setelah kelas" & "butuh makanan sehat dekat studio". 82% member wanita 25-40.', contact: 'Nadia (Studio Manager)' },
  { id: 2,  name: "Mom's Circle Pondok Indah",     cat: 'community', lever: 'comm',  dist: 0.9, angle: 120, fit: 94, feas: 88, rating: 4.8, reviews: 96,  ig: '9.4K',  stage: 'sampling',
    insight: 'Komunitas 1.200+ ibu SES A. Kopdar mingguan di area PIM, sering mencari menu anak & ibu yang sehat.', contact: 'Sarah W. (Founder)' },
  { id: 3,  name: 'Menara Selaras Office Tower',   cat: 'corporate', lever: 'corp',  dist: 2.7, angle: 150, fit: 82, feas: 90, rating: 4.5, reviews: 233, ig: '-',     stage: 'outreach',
    insight: '±3.400 karyawan, 41 tenant. HR mengadakan program wellness Jumat — belum ada vendor healthy lunch tetap.', contact: 'Andre (HR GA)' },
  { id: 4,  name: 'Pondok Indah Run Club',         cat: 'community', lever: 'comm',  dist: 1.2, angle: 300, fit: 90, feas: 86, rating: 4.9, reviews: 58,  ig: '12.7K', stage: 'sampling',
    insight: 'Sunday run 150-250 peserta, start & finish 800m dari PIM 3. Post-run spot belum ada partner F&B.', contact: 'Dimas (Captain)' },
  { id: 5,  name: 'Lumière Aesthetic Clinic',      cat: 'wellness',  lever: 'acq',   dist: 0.8, angle: 75,  fit: 92, feas: 80, rating: 4.8, reviews: 678, ig: '41K',   stage: 'scoring',
    insight: 'Pasien mayoritas wanita 28-45 SES A. Program "beauty from within" — cocok bundling diet bowl.', contact: 'dr. Clara (Owner)' },
  { id: 6,  name: 'Pondok Indah Residences',       cat: 'lifestyle', lever: 'loc',   dist: 0.4, angle: 210, fit: 88, feas: 84, rating: 4.7, reviews: 144, ig: '-',     stage: 'outreach',
    insight: '620 unit premium, concierge aktif. Penghuni ekspat & keluarga muda — potensi resident privilege card.', contact: 'Concierge Desk' },
  { id: 7,  name: 'Barre Society Jakarta',         cat: 'fitness',   lever: 'brand', dist: 1.6, angle: 20,  fit: 89, feas: 78, rating: 4.9, reviews: 201, ig: '22K',   stage: 'scoring',
    insight: 'Kelas penuh 92% weekday pagi. Review: "wish there was a smoothie/salad bar nearby".', contact: 'Kirana (Co-founder)' },
  { id: 8,  name: 'Ride Republic Cycling',         cat: 'fitness',   lever: 'acq',   dist: 2.1, angle: 340, fit: 78, feas: 74, rating: 4.7, reviews: 389, ig: '15K',   stage: 'discovery',
    insight: 'Indoor cycling premium, 60% wanita. Punya program "30-day challenge" yang butuh partner nutrisi.', contact: 'Studio Lead' },
  { id: 9,  name: 'Yoga Kula Pondok Indah',        cat: 'fitness',   lever: 'brand', dist: 1.1, angle: 250, fit: 86, feas: 72, rating: 4.8, reviews: 175, ig: '8.9K',  stage: 'discovery',
    insight: 'Komunitas yoga mindful-eating, sering adakan retreat & workshop nutrisi bulanan.', contact: 'Maya (Teacher)' },
  { id: 10, name: 'Nutrisync Dietitian Clinic',    cat: 'wellness',  lever: 'acq',   dist: 1.9, angle: 95,  fit: 84, feas: 82, rating: 4.9, reviews: 122, ig: '6.1K',  stage: 'discovery',
    insight: 'Ahli gizi klinik meresepkan meal plan — peluang "Prescribed Bowl" dengan label kalori Six Hands.', contact: 'Rina, S.Gz' },
  { id: 11, name: 'Serenity Spa & Sauna',          cat: 'wellness',  lever: 'acq',   dist: 2.4, angle: 60,  fit: 70, feas: 66, rating: 4.6, reviews: 512, ig: '11K',   stage: 'discovery',
    insight: 'Pengunjung weekend tinggi, namun overlap demografi sedang (lebih banyak pasangan 35-50).', contact: 'Ops Manager' },
  { id: 12, name: 'Mama Prenatal Wellness',        cat: 'wellness',  lever: 'comm',  dist: 1.4, angle: 165, fit: 87, feas: 70, rating: 4.9, reviews: 88,  ig: '7.3K',  stage: 'discovery',
    insight: 'Kelas prenatal yoga & laktasi. Ibu hamil SES A sangat peduli nutrisi — cocok sampling bowl folat tinggi.', contact: 'Bidan Ayu' },
  { id: 13, name: 'Graha Nusantara HQ',            cat: 'corporate', lever: 'corp',  dist: 2.9, angle: 135, fit: 72, feas: 68, rating: 4.3, reviews: 97,  ig: '-',     stage: 'discovery',
    insight: 'Kantor pusat BUMN ±1.800 karyawan, kantin terbatas. Potensi corporate subscription mingguan.', contact: 'Corporate Secretary' },
  { id: 14, name: 'Cilandak Co-Work Hub',          cat: 'corporate', lever: 'corp',  dist: 2.2, angle: 110, fit: 80, feas: 76, rating: 4.7, reviews: 164, ig: '5.5K',  stage: 'scoring',
    insight: '400 member startup & freelancer. Review sering mengeluh "pilihan makan siang sehat terbatas".', contact: 'Community Lead' },
  { id: 15, name: 'The Arboretum Apartments',      cat: 'lifestyle', lever: 'loc',   dist: 1.8, angle: 230, fit: 76, feas: 70, rating: 4.5, reviews: 210, ig: '-',     stage: 'discovery',
    insight: '380 unit, building management terbuka untuk program tenant perks bulanan.', contact: 'Building Manager' },
  { id: 16, name: 'Pondok Indah Golf Lounge',      cat: 'lifestyle', lever: 'acq',   dist: 1.3, angle: 280, fit: 68, feas: 62, rating: 4.6, reviews: 302, ig: '3.2K',  stage: 'discovery',
    insight: 'Member premium, tetapi demografi didominasi pria 40+. Fit sedang untuk persona utama.', contact: 'F&B Manager' },
  { id: 17, name: 'Oat & Pour Specialty Coffee',   cat: 'lifestyle', lever: 'brand', dist: 0.7, angle: 330, fit: 81, feas: 85, rating: 4.8, reviews: 940, ig: '27K',   stage: 'scoring',
    insight: 'Non-kompetitor (kopi). Pelanggan WFC wanita 25-35 tinggi — co-branded "Oat Bowl Combo".', contact: 'Owner' },
  { id: 18, name: 'Jakarta Trail Runners',         cat: 'community', lever: 'comm',  dist: 2.6, angle: 280, fit: 74, feas: 64, rating: 4.8, reviews: 41,  ig: '19K',   stage: 'discovery',
    insight: 'Komunitas besar namun aktivitas tersebar di luar Jakarta Selatan.', contact: 'Admin' },
  { id: 19, name: 'Plant-Based Indonesia',         cat: 'community', lever: 'kol',   dist: 2.0, angle: 190, fit: 83, feas: 69, rating: 4.7, reviews: 33,  ig: '34K',   stage: 'discovery',
    insight: 'Komunitas vegan aktif, sering review restoran. Potensi engineered UGC & GEO mention.', contact: 'Moderator' },
  { id: 20, name: 'Padel Pondok Indah League',     cat: 'fitness',   lever: 'comm',  dist: 1.5, angle: 315, fit: 85, feas: 81, rating: 4.9, reviews: 129, ig: '14K',   stage: 'outreach',
    insight: 'Padel booming di SES A. Liga mingguan 120 pemain, 48% wanita. Butuh F&B sponsor turnamen.', contact: 'League Organizer' },
  { id: 21, name: 'Intl. School Parents Assoc.',   cat: 'community', lever: 'comm',  dist: 2.3, angle: 200, fit: 79, feas: 60, rating: 4.4, reviews: 22,  ig: '2.1K',  stage: 'discovery',
    insight: 'Asosiasi orang tua sekolah internasional, bazaar & charity event per kuartal.', contact: 'PTA Chair' },
  { id: 22, name: 'Kirana Boutique Hotel',         cat: 'lifestyle', lever: 'loc',   dist: 2.8, angle: 30,  fit: 64, feas: 58, rating: 4.6, reviews: 455, ig: '9K',    stage: 'discovery',
    insight: 'Tamu bisnis & staycation. Concierge bisa rekomendasikan Six Hands untuk guest healthy dining.', contact: 'Concierge' },
  { id: 23, name: '@hannaeats.jkt (Micro-KOL)',    cat: 'community', lever: 'kol',   dist: 0.5, angle: 160, fit: 91, feas: 90, rating: 5.0, reviews: 0,   ig: '48K',   stage: 'closed',
    insight: 'Food creator Pondok Indah, audience 74% wanita 24-38. Engagement rate 6.8% — engineered visits.', contact: 'Hanna (Creator)' },
  { id: 24, name: 'Forma Strength Lab',            cat: 'fitness',   lever: 'acq',   dist: 1.7, angle: 70,  fit: 77, feas: 79, rating: 4.7, reviews: 266, ig: '7.8K',  stage: 'discovery',
    insight: 'Gym strength women-focused. Member challenge 8 minggu butuh partner high-protein bowl.', contact: 'Head Coach' },
];
PROSPECTS.forEach(p => { p.score = Math.round(p.fit * p.feas / 100); p.tier = p.score >= 70 ? 'High' : p.score >= 50 ? 'Medium' : 'Low'; });

const LANDMARKS = [
  { name: 'Gandaria City',          dist: 2.5, angle: 10 },
  { name: 'Lebak Bulus MRT',        dist: 2.2, angle: 220 },
  { name: 'TB Simatupang',          dist: 2.9, angle: 140 },
  { name: 'Pondok Indah Golf',      dist: 1.0, angle: 285 },
  { name: 'Bintaro',                dist: 3.0, angle: 265 },
  { name: 'Cilandak Town Square',   dist: 2.4, angle: 120 },
];

const PARTNERS = [
  { id: 1,  name: 'Reform Pilates Studio PI',     cat: 'fitness',   code: 'SIXH-RFP', visits: 32, redeems: 41, cost: 896000,   revenue: 6720000, trend: [4,6,5,8,9,12,14] },
  { id: 23, name: '@hannaeats.jkt',               cat: 'community', code: 'SIXH-HNA', visits: 47, redeems: 63, cost: 2500000,  revenue: 9870000, trend: [2,3,8,14,11,13,16] },
  { id: 2,  name: "Mom's Circle Pondok Indah",    cat: 'community', code: 'SIXH-MOM', visits: 29, redeems: 35, cost: 650000,   revenue: 5510000, trend: [1,2,4,5,7,9,11] },
  { id: 4,  name: 'Pondok Indah Run Club',        cat: 'community', code: 'SIXH-RUN', visits: 24, redeems: 38, cost: 1200000,  revenue: 3840000, trend: [3,2,5,4,6,7,8] },
  { id: 6,  name: 'Pondok Indah Residences',      cat: 'lifestyle', code: 'SIXH-PIR', visits: 11, redeems: 14, cost: 1100000,  revenue: 1980000, trend: [1,1,2,2,3,3,4] },
  { id: 99, name: 'Google Ads PMax (baseline)',   cat: 'corporate', code: 'UTM-PMAX', visits: 58, redeems: 0,  cost: 5800000,  revenue: 8700000, trend: [6,7,8,8,9,10,10], paid: true },
];

const GEO_QUERIES = [
  { q: 'best healthy bowl Pondok Indah',  vol: 2400, gpt: 1, gem: 2, ppx: 1, aio: 3, delta: +4 },
  { q: 'salad sehat dekat PIM',            vol: 1900, gpt: 2, gem: 1, ppx: 3, aio: 2, delta: +6 },
  { q: 'post-workout meal near PIM 3',     vol: 880,  gpt: 1, gem: 3, ppx: 2, aio: 4, delta: +3 },
  { q: 'healthy lunch Jakarta Selatan',    vol: 6600, gpt: 4, gem: 5, ppx: 3, aio: 6, delta: +2 },
  { q: 'vegan bowl Pondok Indah',          vol: 720,  gpt: 2, gem: 2, ppx: 1, aio: 3, delta: +5 },
  { q: 'premium salad Jakarta',            vol: 3100, gpt: 6, gem: 7, ppx: 5, aio: 8, delta: +1 },
  { q: 'makanan diet enak Jaksel',         vol: 1300, gpt: 3, gem: 4, ppx: 0, aio: 5, delta: +2 },
];

const OUTLETS = [
  { id: 'pim',  name: 'PIM 3',            area: 'Pondok Indah',  x: 44, y: 70, status: 'live',      prospects: 24, high: 7,  partners: 5, eta: 'Live — Pilot' },
  { id: 'pik',  name: 'PIK Avenue',       area: 'Pantai Indah Kapuk', x: 28, y: 27, status: 'ready', prospects: 31, high: 11, partners: 0, eta: 'Jan 2027' },
  { id: 'scbd', name: 'SCBD',             area: 'Sudirman',      x: 52, y: 50, status: 'ready',     prospects: 46, high: 17, partners: 0, eta: 'Feb 2027' },
  { id: 'kmg',  name: 'Kemang',           area: 'Jakarta Selatan', x: 56, y: 64, status: 'scan',    prospects: 28, high: 9,  partners: 0, eta: 'Mar 2027' },
  { id: 'bsd',  name: 'BSD City',         area: 'Tangerang Sel.', x: 14, y: 82, status: 'scan',     prospects: 22, high: 6,  partners: 0, eta: 'Apr 2027' },
  { id: 'klg',  name: 'Kelapa Gading',    area: 'Jakarta Utara', x: 76, y: 26, status: 'planned',   prospects: 0,  high: 0,  partners: 0, eta: 'Mei 2027' },
];

const AI_INSIGHTS = [
  { icon: 'fa-bolt', color: '#34D399', title: 'Pilates partner = winner', text: 'Reform Pilates menghasilkan 32 visit @ Rp 28rb/visit — 7.4× lebih efisien dari CPC. Rekomendasi: naikkan kuota voucher +40%.' },
  { icon: 'fa-triangle-exclamation', color: '#FBBF24', title: 'Golf Lounge underperform', text: 'Fit score 68 — overlap demografi rendah. Sarankan pindahkan budget ke Padel League (score 69 → trending naik).' },
  { icon: 'fa-wand-magic-sparkles', color: '#A78BFA', title: 'Peluang baru terdeteksi', text: '3 studio barre/pilates baru buka dalam radius 2km minggu ini. Auto-scored: 2 High Potential.' },
  { icon: 'fa-robot', color: '#60A5FA', title: 'GEO naik +12%', text: 'ChatGPT kini menyebut Six Hands di posisi #1 untuk "best healthy bowl Pondok Indah". Pemicu: 38 review baru dari partner.' },
];

const NOTIFS = [
  { icon: 'fa-ticket', color: '#34D399', text: '<b>SIXH-RFP</b> diredeem 3× dalam 1 jam terakhir', time: '2 mnt' },
  { icon: 'fa-satellite-dish', color: '#60A5FA', text: 'Scan radius 3km selesai — <b>4 entitas baru</b>', time: '18 mnt' },
  { icon: 'fa-star', color: '#FBBF24', text: 'Review ⭐5 baru di GBP: "Bowl terbaik di PIM!"', time: '1 jam' },
  { icon: 'fa-handshake', color: '#A78BFA', text: "Mom's Circle setuju jadwal sampling Sabtu", time: '3 jam' },
];

const MENU_ITEMS = ['Glow Goddess Bowl', 'Protein Power Bowl', 'Pilates Green Bowl', 'Mediterranean Crunch', 'Salmon Poke Detox', 'Keto Avocado Bowl', 'Tropical Açaí'];
const CUSTOMER_NAMES = ['Anindya P.', 'Bella S.', 'Clarissa T.', 'Dewi R.', 'Elena K.', 'Fiona W.', 'Gita M.', 'Hana L.', 'Intan A.', 'Jessica H.', 'Kezia N.', 'Laras D.'];
