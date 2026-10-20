(() => {
  const KEY = "ios-sim-config-v1";
  const SESSION_KEY = "ios-sim-session-v1";
  const defaults = {
    wallpaper: "aurora",
    lockTitle: "오늘의 기록",
    lockText: "나만의 작은 디지털 공간",
    photos: [
      { title: "노을", emoji: "🌅" }, { title: "바다", emoji: "🌊" }, { title: "꽃", emoji: "🌷" },
      { title: "하늘", emoji: "☁️" }, { title: "여행", emoji: "🏞️" }, { title: "기억", emoji: "🪻" }
    ],
    contacts: [{ id: "jiwoo", name: "지우", avatar: "지", subtitle: "iMessage" }],
    chats: {
      jiwoo: [
        { from: "in", text: "안녕! 지금 뭐 해?", time: "오후 8:41" },
        { from: "out", text: "그냥 쉬고 있어 ㅎㅎ", time: "오후 8:42" },
        { from: "in", text: "나도 보고 싶다", time: "오후 8:43" }
      ]
    },
    rules: [
      { keywords: ["안녕", "하이", "ㅎㅇ"], reply: "안녕 ㅎㅎ 연락해 줘서 좋다" },
      { keywords: ["뭐 해", "뭐해", "머해"], reply: "그냥 쉬고 있었어! 너는 뭐 해?" },
      { keywords: ["보고 싶", "보고싶"], reply: "나도 보고 싶어 🥺" },
      { keywords: ["잘 자", "잘자"], reply: "응 너도 잘 자고 좋은 꿈 꿔 🌙" }
    ],
    fallbackReply: "ㅋㅋㅋ 진짜? 조금 더 얘기해 줘",
    music: { title: "Midnight Memories", artist: "Your Playlist", note: "나만의 플레이리스트" },
    note: "오늘도 기억하고 싶은 순간들을 모아 두기."
  };
  let config = loadConfig();
  let currentApp = "messages", currentContact = null, toastTimer = null, playing = false, phoneDigits = "";
  const $ = id => document.getElementById(id);
  function loadConfig() {
    try { return { ...structuredClone(defaults), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch { return structuredClone(defaults); }
  }
  function saveConfig() { localStorage.setItem(KEY, JSON.stringify(config)); }
  function session() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}"); } catch { return {}; }
  }
  function saveSession(s) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
  function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function toast(msg) {
    const el = $("toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }
  function setWallpaper() {
    const styles = {
      aurora: "linear-gradient(155deg,#8cc7d7 0%,#5b7bb7 34%,#a17db9 64%,#f0b9a6 100%)",
      sunset: "linear-gradient(150deg,#ffd49c,#ee8e9b 45%,#625e9a 100%)",
      ocean: "linear-gradient(155deg,#b5e9e9,#4a91b7 45%,#173a67 100%)",
      night: "linear-gradient(155deg,#11182e,#3d3e78 50%,#9a79a5 100%)",
      forest: "linear-gradient(155deg,#c5dfb5,#4f927b 48%,#173d43 100%)"
    };
    const wallpaper = config.wallpaper || "aurora";
    $("wallpaper").style.background = wallpaper.startsWith("url(") ? wallpaper : (styles[wallpaper] || styles.aurora);
    $("widget-title").textContent = config.lockTitle || defaults.lockTitle;
    $("widget-text").textContent = config.lockText || defaults.lockText;
    renderNotifications();
  }
  function dateLabel() {
    const d = new Date();
    return new Intl.DateTimeFormat("ko-KR", { month:"long", day:"numeric", weekday:"long" }).format(d);
  }
  function clockLabel() {
    return new Intl.DateTimeFormat("ko-KR", { hour:"numeric", minute:"2-digit", hour12:false }).format(new Date());
  }
  function updateClock() {
    const now = clockLabel(); $("status-time").textContent = now; $("lock-clock").textContent = now;
    $("lock-date").textContent = dateLabel(); $("home-date").textContent = dateLabel();
  }
  function renderNotifications() {
    const latest = Object.values(config.chats || {}).flat().slice(-2).reverse();
    $("lock-notifications").innerHTML = latest.map(m => `<div class="notification"><strong>메시지 · ${escapeHTML((config.contacts[0] || {}).name || "연락처")}</strong>${escapeHTML(m.text)}</div>`).join("");
  }
  function showScreen(id) {
    ["lock-screen","home-screen","app-screen"].forEach(x => $(x).classList.toggle("active", x === id));
  }
  function openApp(name) {
    currentApp = name; currentContact = null; showScreen("app-screen");
    const titles = { messages:["메시지","iMessage"], photos:["사진","보관함"], phone:["전화","키패드"], music:["음악","지금 재생 중"], contacts:["연락처","나의 사람들"], notes:["메모","iCloud 메모"], settings:["설정",""], safari:["Safari","시뮬레이션 브라우저"], camera:["카메라","카메라 미리보기"] };
    const [title, sub] = titles[name] || ["앱",""];
    $("app-title").textContent = title; $("app-subtitle").textContent = sub;
    $("app-action").style.visibility = ["messages","contacts","photos"].includes(name) ? "visible" : "hidden";
    $("app-content").innerHTML = renderApp(name);
    if (name === "messages") renderChats();
    bindAppControls();
  }
  function renderApp(name) {
    switch(name) {
      case "messages": return `<div class="chat-list" id="chat-list"></div>`;
      case "photos": return `<div class="section-title">최근 항목</div><div class="photo-grid">${(config.photos || []).map(p => `<div class="photo-tile" title="${escapeHTML(p.title)}">${p.url ? `<img src="${escapeHTML(p.url)}" alt="${escapeHTML(p.title)}">` : escapeHTML(p.emoji || "✿")}</div>`).join("")}</div><p class="photo-caption">${(config.photos || []).length}개의 항목 · 관리자 페이지에서 사진을 설정할 수 있어요</p>`;
      case "music": return `<div class="music-card">♫</div><div class="music-info"><h2>${escapeHTML(config.music?.title || defaults.music.title)}</h2><p>${escapeHTML(config.music?.artist || defaults.music.artist)}</p></div><div class="progress"><span id="music-progress"></span></div><div class="music-times"><span>0:42</span><span>3:18</span></div><div class="music-controls"><button data-toast="이전 곡은 데모 기능입니다">⏮</button><button class="play" id="play-music">${playing ? "Ⅱ" : "▶"}</button><button data-toast="다음 곡은 데모 기능입니다">⏭</button></div><div class="section-title">${escapeHTML(config.music?.note || "추천 플레이리스트")}</div><div class="list-card"><span class="list-icon">♫</span><div><strong>${escapeHTML(config.music?.title || defaults.music.title)}</strong><p>${escapeHTML(config.music?.artist || defaults.music.artist)}</p></div></div><p class="photo-caption">실제 음원 재생은 오디오 파일을 추가하도록 확장할 수 있습니다.</p>`;
      case "phone": return `<div class="call-number" id="call-number">${escapeHTML(phoneDigits || " " )}</div><div class="keypad">${["1","2","3","4","5","6","7","8","9","*","0","#"].map(n => `<button data-digit="${n}">${n}<small>${({"2":"ABC","3":"DEF","4":"GHI","5":"JKL","6":"MNO","7":"PQRS","8":"TUV","9":"WXYZ"}[n] || "")}</small></button>`).join("")}</div><button class="call-button" id="call-btn">☎</button><p class="photo-caption" style="text-align:center">실제 통화가 아닌 화면 시뮬레이션입니다.</p>`;
      case "contacts": return `<div class="section-title">내 연락처</div>${(config.contacts || []).map(c => `<div class="list-card"><span class="avatar">${escapeHTML(c.avatar || c.name?.[0] || "?")}</span><div><strong>${escapeHTML(c.name)}</strong><p>${escapeHTML(c.subtitle || "연락처")}</p></div></div>`).join("")}`;
      case "notes": return `<div class="section-title">메모 · 방금 편집함</div><div class="note-paper">${escapeHTML(config.note || defaults.note)}</div>`;
      case "settings": return `<div class="list-card"><span class="avatar">✦</span><div><strong>Apple 계정</strong><p>시뮬레이터 프로필</p></div></div>${[["비행기 모드","◈"],["Wi-Fi","⌁"],["Bluetooth","ᛒ"],["알림","♧"],["배경화면","▧"],["일반","⚙"]].map(([x,icon]) => `<div class="setting-row"><span>${icon}　${x}</span><span class="toggle"></span></div>`).join("")}<p class="photo-caption">설정은 시각적 데모입니다.</p>`;
      case "safari": return `<div class="list-card"><span class="list-icon">◎</span><div style="flex:1"><strong>검색 또는 웹사이트 이름</strong><p>시뮬레이션 브라우저</p></div></div><input id="url-input" placeholder="검색어 또는 URL" style="width:100%;padding:13px;border:1px solid #ddd;border-radius:12px"><button id="url-go" style="margin-top:10px;border:0;border-radius:10px;background:#1685f8;color:#fff;padding:11px 16px">이동</button><p class="photo-caption">외부 사이트는 별도 탭에서 열립니다.</p>`;
      case "camera": return `<div style="height:75%;background:#17171b;border-radius:18px;display:grid;place-items:center;color:#aaa;font-size:13px;text-align:center;padding:20px">카메라 미리보기<br><small>실제 카메라 연동은 브라우저 권한 기능으로 확장할 수 있습니다.</small></div><button id="camera-start" style="margin:15px auto;display:block;border:0;border-radius:50%;height:58px;width:58px;background:#fff;border:5px solid #ddd"></button>`;
      default: return `<div class="empty-state">아직 준비 중인 앱입니다.</div>`;
    }
  }
  function renderChats() {
    const list = $("chat-list"); if (!list) return;
    list.innerHTML = (config.contacts || []).map(c => {
      const messages = (config.chats || {})[c.id] || [];
      const last = messages[messages.length - 1];
      return `<button class="chat-row" data-contact="${escapeHTML(c.id)}"><span class="avatar">${escapeHTML(c.avatar || c.name?.[0] || "?")}</span><span class="chat-meta"><strong>${escapeHTML(c.name)}</strong><p>${escapeHTML(last?.text || "메시지 보내기")}</p></span><span class="chat-time">${escapeHTML(last?.time || "")}　›</span></button>`;
    }).join("") || `<div class="empty-state">아직 대화가 없습니다.</div>`;
    list.querySelectorAll("[data-contact]").forEach(b => b.addEventListener("click", () => openChat(b.dataset.contact)));
  }
  function openChat(id) {
    currentContact = id;
    const c = config.contacts.find(x => x.id === id); if (!c) return;
    $("app-title").textContent = c.name; $("app-subtitle").textContent = "iMessage"; $("app-action").style.visibility = "hidden";
    const messages = ((config.chats || {})[id] || []);
    $("app-content").innerHTML = `<div class="chat-view"><div class="chat-top"><span class="avatar">${escapeHTML(c.avatar || c.name[0])}</span><div><strong>${escapeHTML(c.name)}</strong><small>메시지</small></div></div><div class="bubbles" id="bubbles">${messages.map(m => `<div class="bubble-time">${escapeHTML(m.time || "")}</div><div class="bubble ${m.from === "out" ? "out" : "in"}">${escapeHTML(m.text)}</div>`).join("")}</div><form class="chat-compose" id="chat-form"><textarea id="chat-input" rows="1" placeholder="iMessage"></textarea><button class="send-btn" type="submit" aria-label="보내기">↑</button></form></div>`;
    $("chat-form").addEventListener("submit", e => { e.preventDefault(); sendMessage(id); });
    $("chat-input").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(id); } });
    $("app-content").scrollTop = $("app-content").scrollHeight;
  }
  function timeNow() { return new Intl.DateTimeFormat("ko-KR", {hour:"2-digit",minute:"2-digit"}).format(new Date()); }
  function sendMessage(id) {
    const input = $("chat-input"), text = input.value.trim(); if (!text) return;
    config.chats[id] = config.chats[id] || [];
    config.chats[id].push({from:"out",text,time:timeNow()});
    const normalized = text.toLowerCase();
    const rule = (config.rules || []).find(r => (r.keywords || []).some(k => k && normalized.includes(k.toLowerCase())));
    const reply = rule?.reply || config.fallbackReply || defaults.fallbackReply;
    saveConfig(); openChat(id);
    const bubbles = $("bubbles");
    setTimeout(() => {
      config.chats[id].push({from:"in",text:reply,time:timeNow()}); saveConfig();
      if (currentApp === "messages" && currentContact === id) openChat(id);
      renderNotifications();
    }, 650);
  }
  function bindAppControls() {
    document.querySelectorAll("[data-toast]").forEach(b => b.addEventListener("click", () => toast(b.dataset.toast)));
    document.querySelectorAll("[data-digit]").forEach(b => b.addEventListener("click", () => { phoneDigits += b.dataset.digit; $("call-number").textContent = phoneDigits; }));
    if ($("call-btn")) $("call-btn").addEventListener("click", () => toast(phoneDigits ? `시뮬레이션 통화: ${phoneDigits}` : "번호를 입력해 주세요."));
    if ($("play-music")) $("play-music").addEventListener("click", () => { playing = !playing; $("play-music").textContent = playing ? "Ⅱ" : "▶"; toast(playing ? "재생 화면을 시작했어요" : "일시정지했어요"); });
    if ($("url-go")) $("url-go").addEventListener("click", () => {
      let u = $("url-input").value.trim(); if (!u) return;
      if (!/^https?:\/\//i.test(u)) u = "https://www.google.com/search?q=" + encodeURIComponent(u);
      window.open(u, "_blank", "noopener,noreferrer");
    });
    if ($("camera-start")) $("camera-start").addEventListener("click", () => toast("카메라 연결은 다음 버전에서 추가할 수 있어요."));
  }
  document.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openApp(b.dataset.open)));
  $("unlock-btn").addEventListener("click", () => showScreen("home-screen"));
  $("home-screen").addEventListener("click", e => { if (e.target === $("home-screen")) showScreen("lock-screen"); });
  $("back-home").addEventListener("click", () => { if (currentApp === "messages" && currentContact) { currentContact = null; $("app-title").textContent = "메시지"; $("app-subtitle").textContent = "iMessage"; $("app-content").innerHTML = `<div class="chat-list" id="chat-list"></div>`; renderChats(); } else showScreen("home-screen"); });
  $("relock").addEventListener("click", () => showScreen("lock-screen"));
  $("app-action").addEventListener("click", () => toast("콘텐츠 추가는 관리자 페이지에서 설정할 수 있어요."));
  // Swipe up on lock screen / app screen to return home.
  let startY = null;
  $("lock-screen").addEventListener("touchstart", e => startY = e.touches[0].clientY, {passive:true});
  $("lock-screen").addEventListener("touchend", e => { if (startY - e.changedTouches[0].clientY > 35) showScreen("home-screen"); }, {passive:true});
  $("app-screen").addEventListener("touchstart", e => startY = e.touches[0].clientY, {passive:true});
  $("app-screen").addEventListener("touchend", e => { if (e.changedTouches[0].clientY - startY > 80 && e.changedTouches[0].clientY > window.innerHeight - 100) showScreen("home-screen"); }, {passive:true});
  setWallpaper(); updateClock(); setInterval(updateClock, 15000);
})();