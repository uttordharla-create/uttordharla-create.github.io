/* উত্তর ধরলা — সাইটের সাধারণ কনফিগ ও ফাংশন */
const SITE = {
  name: "উত্তর ধরলা",
  tagline: "সৎ বস্তুনিষ্ঠ ও নির্ভরযোগ্য",
  email: "uttordharla@gmail.com",
  phone: "01711579676",
  address: "পুরাতন থানাপাড়া, কুড়িগ্রাম ও সরকারি বালিকা বিদ্যালয় রোড, নাগেশ্বরী, কুড়িগ্রাম",
  facebook: "https://www.facebook.com/uttordharla",
  // প্রকাশক ও সম্পাদক
  team: [
    { name: "মোঃ রাশেদুল হাসান", place: "নাগেশ্বরী, কুড়িগ্রাম" },
    { name: "মোঃ মিজানুর রহমান মিজু", place: "সংযুক্ত আরব আমিরাত" },
    { name: "মোঃ মাসুদ আলম", place: "নাগেশ্বরী, কুড়িগ্রাম" },
    { name: "অ্যাডভোকেট জহুরুল হক", place: "টেক্সাস, ইউএসএ" }
  ],
  categories: ["জাতীয়", "কুড়িগ্রাম", "অপরাধ", "সারাদেশ", "শিক্ষা", "খেলা", "মতামত", "অন্যান্য"]
};

// পুরোনো বিভাগের নাম নতুন নামে রূপান্তর (পুরোনো লিংক ও খবর যেন কাজ করে)
const LEGACY_CATS = { "রাজনীতি": "সারাদেশ" };
const normCat = c => (c && LEGACY_CATS[c]) || c;

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else e.setAttribute(k, v);
  }
  kids.forEach(k => e.append(k));
  return e;
};

function bnDate(iso, withTime) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const o = { year: "numeric", month: "long", day: "numeric" };
  if (withTime) { o.hour = "numeric"; o.minute = "2-digit"; }
  return d.toLocaleString("bn-BD", o);
}

async function loadNews() {
  try {
    const r = await fetch("news.json?t=" + Date.now());
    if (!r.ok) throw 0;
    const data = await r.json();
    data.forEach(n => { n.category = normCat(n.category); });
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) { return []; }
}

function imgTag(src, alt) {
  const i = el("img", { src: src || "", alt: alt || "", loading: "lazy" });
  i.onerror = () => { i.style.display = "none"; };
  return i;
}

function layoutChrome(activeCat) {
  activeCat = normCat(activeCat);
  const today = new Date().toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const top = `
  <div class="topline"><div class="wrap"><span>${today}</span><span>${SITE.email} · ${SITE.phone}</span></div></div>
  <header class="site hero">
    <img class="hero-bg" src="header.webp" alt="" onerror="this.style.display='none'">
    <div class="hero-shade"></div>
    <a class="hero-brand" href="index.html" aria-label="${SITE.name}">
      <img class="hero-logo" src="logo.png" alt="${SITE.name}" onerror="this.outerHTML='<span class=&quot;hero-fallback&quot;>${SITE.name}</span>'">
      <span class="hero-tag">${SITE.tagline}</span>
    </a>
  </header>
  <nav class="main"><div class="wrap" id="nav"></div></nav>
  <div class="ticker" id="ticker" style="display:none"><span class="ticker-label">সর্বশেষ</span><div class="ticker-view"><div class="ticker-track" id="tickerTrack"></div></div></div>`;
  injectChromeCss();
  document.body.insertAdjacentHTML("afterbegin", top);
  const nav = $("#nav");
  const link = (t, h, on) => nav.append(el("a", { href: h, class: on ? "on" : "", text: t }));
  link("প্রচ্ছদ", "index.html", !activeCat);
  SITE.categories.forEach(c => link(c, "index.html?cat=" + encodeURIComponent(c), activeCat === c));
  link("আমাদের সম্পর্কে", "about.html", activeCat === "__about");

  initTicker();

  const teamHtml = SITE.team.map(p =>
    `<div style="margin-bottom:6px"><b>${p.name}</b><br><span style="opacity:.8;font-size:.88em">${p.place}</span></div>`).join("");

  document.body.insertAdjacentHTML("beforeend", `
  <footer class="site"><div class="wrap">
    <div class="cols">
      <div><h4>${SITE.name}</h4>${SITE.tagline}</div>
      <div><h4>যোগাযোগ</h4>${SITE.address}<br>ফোন/হোয়াটসঅ্যাপ: ${SITE.phone}<br>ইমেইল: <a href="mailto:${SITE.email}">${SITE.email}</a></div>
      <div><h4>প্রকাশক ও সম্পাদক</h4>${teamHtml}<a href="${SITE.facebook}" target="_blank" rel="noopener">ফেসবুক: uttordharla</a></div>
    </div>
    <div class="copy">© ${new Date().getFullYear().toLocaleString("bn-BD",{useGrouping:false})} ${SITE.name} — সর্বস্বত্ব সংরক্ষিত</div>
  </div></footer>`);
}

function articleUrl(id) { return "news/" + encodeURIComponent(id) + ".html"; }

function renderCard(n) {
  const a = el("a", { href: articleUrl(n.id) });
  a.append(imgTag(n.image, n.title));
  const t = el("div", { class: "txt" },
    el("span", { class: "cat-tag", text: n.category || "অন্যান্য" }),
    el("h3", { text: n.title }),
    el("div", { class: "meta", text: bnDate(n.date) }));
  a.append(t);
  return el("div", { class: "card" }, a);
}

function summaryOf(n) {
  if (n.summary) return n.summary;
  const p = (n.body || "").split(/\n\s*\n/)[0] || "";
  return p.length > 180 ? p.slice(0, 180) + "…" : p;
}

/* ---- হেডার ব্যানার ও স্ক্রল নিউজ ---- */
function injectChromeCss() {
  if ($("#chromeCss")) return;
  const st = document.createElement("style");
  st.id = "chromeCss";
  st.textContent = `
  header.site.hero{position:relative;display:flex;align-items:center;justify-content:center;min-height:clamp(120px,22vw,200px);padding:8px 12px;overflow:hidden;background:#14284b}
  .hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .hero-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,30,60,.50),rgba(14,30,60,.62))}
  .hero-brand{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;max-width:92%}
  .hero-logo{height:clamp(72px,13vw,122px);width:auto;max-width:100%;display:block;
    filter:brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,.55))}
  .hero-fallback{font:700 clamp(26px,6vw,44px)/1.2 "Noto Serif Bengali",serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)}
  .hero-tag{font-size:clamp(12px,2.2vw,15px);font-weight:600;color:#ffd24a;letter-spacing:.3px;text-shadow:0 1px 5px rgba(0,0,0,.7)}
  @media (max-width:520px){.hero-tag{display:none}}
  .ticker{display:flex;align-items:stretch;background:#14284b;color:#fff;overflow:hidden}
  .ticker-label{background:#c8102e;padding:9px 14px;font-weight:700;white-space:nowrap;position:relative;z-index:1}
  .ticker-view{flex:1;overflow:hidden;white-space:nowrap;display:flex;align-items:center}
  .ticker-track{display:inline-flex;flex:none;white-space:nowrap;will-change:transform}
  .ticker-track a{color:#fff;text-decoration:none;padding:9px 0}
  .ticker-track a:hover{text-decoration:underline}
  .ticker-track .sep{padding:9px 16px;color:#f4c542}
  article.full figure{margin:14px 0}
  article.full figure img{width:100%;height:auto;display:block}
  article.full figcaption{font-size:.9rem;line-height:1.55;color:#5d6978;padding:8px 2px 0;border-bottom:1px solid #e3e7ec;padding-bottom:10px}
  `;
  document.head.append(st);
}

async function initTicker() {
  const box = $("#ticker"), track = $("#tickerTrack");
  if (!box || !track) return;
  const items = (await loadNews()).slice(0, 10);
  if (!items.length) return;
  const view = track.parentNode;
  const addSet = () => items.forEach(n => {
    track.append(el("a", { href: articleUrl(n.id), text: n.title }));
    track.append(el("span", { class: "sep", text: "●" }));
  });
  box.style.display = "flex";
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }

  addSet();
  const setW = track.offsetWidth;
  if (!setW) return;
  // খবর কম হলে স্ক্রিন ভরানো পর্যন্ত পুনরাবৃত্তি
  let reps = 1;
  while (setW * reps < view.clientWidth && reps < 30) { addSet(); reps++; }
  const cycle = setW * reps;
  for (let i = 0; i < reps; i++) addSet(); // দ্বিতীয় কপি: মসৃণ ঘূর্ণনের জন্য

  const SPEED = 55; // পিক্সেল/সেকেন্ড — বাড়ালে দ্রুত, কমালে ধীর
  let x = 0, paused = false, last = performance.now();
  const step = t => {
    const dt = Math.min((t - last) / 1000, 0.1); last = t;
    if (!paused) {
      x -= SPEED * dt;
      if (-x >= cycle) x += cycle;
      track.style.transform = "translate3d(" + x + "px,0,0)";
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  view.addEventListener("mouseenter", () => paused = true);
  view.addEventListener("mouseleave", () => paused = false);
  view.addEventListener("touchstart", () => paused = true, { passive: true });
  view.addEventListener("touchend", () => setTimeout(() => paused = false, 1200), { passive: true });
}
