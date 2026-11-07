/* উত্তর ধরলা — সাইটের সাধারণ কনফিগ ও ফাংশন */
const SITE = {
  name: "উত্তর ধরলা",
  tagline: "সৎ বস্তুনিষ্ঠ ও নির্ভরযোগ্য",
  email: "uttordharla@gmail.com",
  phone: "01711579676",
  address: "পুরাতন থানাপাড়া, কুড়িগ্রাম ও সরকারি বালিকা বিদ্যালয় রোড, নাগেশ্বরী, কুড়িগ্রাম",
  facebook: "https://www.facebook.com/uttordharla",
  publisher: "অ্যাডভোকেট জহুরুল হক",
  editor: "মোঃ রাশেদুল হাসান",
  categories: ["জাতীয়", "কুড়িগ্রাম", "অপরাধ", "রাজনীতি", "শিক্ষা", "খেলা", "মতামত", "অন্যান্য"]
};

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
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) { return []; }
}

function imgTag(src, alt) {
  const i = el("img", { src: src || "", alt: alt || "", loading: "lazy" });
  i.onerror = () => { i.style.display = "none"; };
  return i;
}

function layoutChrome(activeCat) {
  const today = new Date().toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const top = `
  <div class="topline"><div class="wrap"><span>${today}</span><span>${SITE.email} · ${SITE.phone}</span></div></div>
  <header class="site"><div class="brandbar">
    <a class="brand" href="index.html" aria-label="${SITE.name}">
      <img src="logo.png" alt="${SITE.name}" onerror="this.outerHTML='<span class=&quot;fallback&quot;>${SITE.name}</span>'">
    </a>
    <div class="tagline">${SITE.tagline}</div>
  </div></header>
  <nav class="main"><div class="wrap" id="nav"></div></nav>`;
  document.body.insertAdjacentHTML("afterbegin", top);
  const nav = $("#nav");
  const link = (t, h, on) => nav.append(el("a", { href: h, class: on ? "on" : "", text: t }));
  link("প্রচ্ছদ", "index.html", !activeCat);
  SITE.categories.forEach(c => link(c, "index.html?cat=" + encodeURIComponent(c), activeCat === c));
  link("আমাদের সম্পর্কে", "about.html", activeCat === "__about");

  document.body.insertAdjacentHTML("beforeend", `
  <footer class="site"><div class="wrap">
    <div class="cols">
      <div><h4>${SITE.name}</h4>${SITE.tagline}</div>
      <div><h4>যোগাযোগ</h4>${SITE.address}<br>ফোন/হোয়াটসঅ্যাপ: ${SITE.phone}<br>ইমেইল: <a href="mailto:${SITE.email}">${SITE.email}</a></div>
      <div><h4>পরিচালনা</h4>প্রকাশক: ${SITE.publisher}<br>সম্পাদক: ${SITE.editor}<br><a href="${SITE.facebook}" target="_blank" rel="noopener">ফেসবুক: uttordharla</a></div>
    </div>
    <div class="copy">© ${new Date().getFullYear().toLocaleString("bn-BD",{useGrouping:false})} ${SITE.name} — সর্বস্বত্ব সংরক্ষিত</div>
  </div></footer>`);
}

function renderCard(n) {
  const a = el("a", { href: "article.html?id=" + encodeURIComponent(n.id) });
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
