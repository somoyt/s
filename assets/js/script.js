
(function(){
  const API = window.API_URL || "";
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // Font + Dark
  const root = document.documentElement;
  function setFS(delta){
    const now = parseFloat(getComputedStyle(root).getPropertyValue("--fs"));
    root.style.setProperty("--fs", Math.min(22, Math.max(14, now + delta)) + "px");
  }
  const fMinus = qs("#fontMinus"), fPlus = qs("#fontPlus");
  fMinus && fMinus.addEventListener("click", ()=>setFS(-1));
  fPlus && fPlus.addEventListener("click", ()=>setFS(+1));
  const themeBtn = qs("#toggleTheme");
  if(localStorage.getItem("somoy-theme")==="dark") document.body.classList.add("dark");
  themeBtn && themeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("somoy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  function timeago(ts){
    if(!ts) return "";
    const diff = Date.now()-ts;
    const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
    if (m < 1) return "এইমাত্র";
    if (m < 60) return m + " মিনিট আগে";
    if (h < 24) return h + " ঘন্টা আগে";
    if (d === 1) return "গতকাল";
    return new Date(ts).toLocaleString("bn-BD");
  }
  function imgTag(n, w, h){
    const src = n.image ? n.image : "";
    const alt = n.title || "";
    const attrs = ['loading="lazy"'];
    if(w&&h) attrs.push(`width="${w}" height="${h}"`);
    return src ? `<img src="${src}" alt="${alt}" ${attrs.join(" ")}>` : "";
  }

  function rowItem(n){
    return `<a class="row" href="news.html?id=${n.id}">${imgTag(n,160,100)}<div><div class="meta"><span class="badge">${n.category||""}</span> · ${timeago(n.timestamp)}</div><h4>${n.title}</h4><div class="meta">${n.summary||""}</div></div></a>`;
  }
  function plainItem(n){
    return `<a href="news.html?id=${n.id}"><span class="meta"><span class="badge">${n.category||""}</span> · ${timeago(n.timestamp)}</span><br>${n.title}</a>`;
  }

  async function fetchList(limit=60){
    const res = await fetch(API + "?limit=" + limit);
    return await res.json();
  }

  function buildTicker(list){
    const track = list.slice(0,8).map(n=>`<span>• ${n.title}</span>`).join("");
    const ticker = qs("#breaking");
    if(ticker) ticker.innerHTML = `<span class="track">${track}&nbsp;&nbsp;&nbsp;${track}</span>`;
  }

  function buildHero(list){
    const big = qs("#heroBig");
    const small = qs("#heroList");
    if(!big || !small) return;
    const top = list[0];
    const next4 = list.slice(1,5);
    if(top){
      big.innerHTML = `<a href="news.html?id=${top.id}">${imgTag(top)}<h2 class="item-title">${top.title}</h2><div class="meta">${top.summary||""}</div></a>`;
    }
    if(next4.length){
      small.innerHTML = `<div class="mini">` + next4.map(n=>`<a href="news.html?id=${n.id}">${imgTag(n,120,70)}<div><div class="meta">${timeago(n.timestamp)}</div><strong>${n.title}</strong></div></a>`).join("") + `</div>`;
    }
  }

  function buildTrending(list){
    const el = qs("#trending");
    if(!el) return;
    el.innerHTML = list.slice(0,8).map(plainItem).join("");
  }

  function buildCategories(list){
    const wrap = qs("#categories");
    if(!wrap) return;
    const cats = ["জাতীয়","আন্তর্জাতিক","খেলা","অর্থনীতি","বিনোদন","মতামত","প্রযুক্তি"];
    wrap.innerHTML = "";
    cats.forEach(cat=>{
      const items = list.filter(n=>(n.category||"").trim()===cat).slice(0,6);
      if(!items.length) return;
      const html = `<section><h2 class="section-title">${cat}</h2><div class="list-rows">`+items.map(rowItem).join("")+`</div></section>`;
      wrap.insertAdjacentHTML("beforeend", html);
    });
  }

  async function init(){
    let list = await fetchList(80);
    if(!Array.isArray(list)) list = [];
    buildTicker(list);
    buildHero(list);
    buildTrending(list);

    // Latest with pagination
    const latest = qs("#latest");
    let page = 1, per = 10;
    const render = ()=>{
      const slice = list.slice((page-1)*per, page*per);
      latest.insertAdjacentHTML("beforeend", slice.map(rowItem).join(""));
    };
    render();
    const btn = qs("#loadMore");
    btn && btn.addEventListener("click", ()=>{ page++; render(); if(page*per >= list.length) btn.remove(); });

    buildCategories(list);

    // Search
    const si = qs("#searchInput");
    if(si){
      si.addEventListener("input", ()=>{
        const q = si.value.trim().toLowerCase();
        const filtered = list.filter(n =>
          (n.title||"").toLowerCase().includes(q) ||
          (n.summary||"").toLowerCase().includes(q) ||
          (n.body||"").toLowerCase().includes(q));
        latest.innerHTML = filtered.slice(0,30).map(rowItem).join("");
      });
    }

    // Category filter from header
    qsa(".nav a[data-cat]").forEach(a=>{
      a.addEventListener("click",(e)=>{
        e.preventDefault();
        qsa(".nav a").forEach(x=>x.classList.remove("active"));
        a.classList.add("active");
        const cat = a.dataset.cat;
        let filtered = list;
        if(cat && cat!=="all") filtered = list.filter(n => (n.category||"").trim()===cat);
        latest.innerHTML = filtered.slice(0,20).map(rowItem).join("");
      });
    });
  }
  init();
})();

// Animate brand logo watch hands
function animateBrandWatch(){
  const h=document.querySelector('.hand.hour'),m=document.querySelector('.hand.minute'),s=document.querySelector('.hand.second');
  if(!h||!m||!s) return;
  function tick(){
    const now=new Date();const sec=now.getSeconds();const min=now.getMinutes()+sec/60;const hr=(now.getHours()%12)+min/60;
    h.style.transform=`translate(-50%,-100%) rotate(${hr*30}deg)`;
    m.style.transform=`translate(-50%,-100%) rotate(${min*6}deg)`;
    s.style.transform=`translate(-50%,-100%) rotate(${sec*6}deg)`;
  }
  tick();setInterval(tick,1000);
}
animateBrandWatch();


// News Load
async function loadNews(){
  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbxkMGLm--5BQgQCFvG40Qs5d2NShHtc9N6LXQuB7o1IVBFZlllNqvjxcXijusWfpVQw/exec?limit=20");
    const data = await res.json();
    const container = document.getElementById("news-list");
    if(container && data && data.length){
      container.innerHTML = data.map(n=>`
        <article class="news-item">
          ${n.image ? `<img src="${n.image}" alt="">` : ""}
          <h2>${n.title}</h2>
          <p>${n.summary}</p>
          <small>${n.category} • ${new Date(n.timestamp).toLocaleString()}</small>
        </article>
      `).join("");
    }
  } catch(err){
    console.error("News load failed", err);
  }
}
document.addEventListener("DOMContentLoaded", loadNews);


// Render Hero Section
function renderHero(articles){
  const hero = document.getElementById("hero-container");
  if(!hero) return;
  hero.innerHTML = "";
  if(!articles.length) return;
  if(articles[0].image){
    // 1 big + 4 small
    const big = articles[0];
    hero.innerHTML += `<div class="big"><img src="${big.image}" alt=""><h2>${big.title}</h2><span class="badge">${big.category}</span><span class="timeago" data-time="${big.time}"></span></div>`;
    articles.slice(1,5).forEach(a => {
      hero.innerHTML += `<div><img src="${a.image}" alt=""><h3>${a.title}</h3><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
    });
  } else {
    // 2 big text only + row list
    articles.slice(0,2).forEach(a => {
      hero.innerHTML += `<div class="big"><h2>${a.title}</h2><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
    });
    const rest = articles.slice(2,6);
    rest.forEach(a => {
      hero.innerHTML += `<div><h3>${a.title}</h3><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
    });
  }
}

// Render Latest News
function renderLatest(articles){
  const latest = document.getElementById("latest-list");
  if(!latest) return;
  latest.innerHTML = "";
  articles.forEach(a => {
    latest.innerHTML += `<div class="news-item"><h4>${a.title}</h4><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
  });
}

// Simple timeago
function updateTimeago(){
  document.querySelectorAll(".timeago").forEach(el => {
    const t = new Date(el.dataset.time);
    const diff = Math.floor((Date.now()-t)/60000);
    if(diff<1) el.innerText = "Just now";
    else if(diff<60) el.innerText = diff+" min ago";
    else el.innerText = Math.floor(diff/60)+"h ago";
  });
}
setInterval(updateTimeago,60000);

// Breaking ticker slow
const ticker = document.querySelector(".breaking-ticker");
if(ticker){
  let i=0;
  setInterval(()=>{
    const items = ticker.querySelectorAll("li");
    items.forEach((el,idx)=>el.style.display=(idx===i?"inline":"none"));
    i=(i+1)%items.length;
  },80000); // 80s
}
