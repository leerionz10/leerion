(() => {
  const KEY = "ios-sim-config-v1";
  const defaults = {
    wallpaper:"aurora", lockTitle:"오늘의 기록", lockText:"나만의 작은 디지털 공간",
    photos:[{title:"노을",emoji:"🌅"},{title:"바다",emoji:"🌊"},{title:"꽃",emoji:"🌷"},{title:"하늘",emoji:"☁️"},{title:"여행",emoji:"🏞️"},{title:"기억",emoji:"🪻"}],
    contacts:[{id:"jiwoo",name:"지우",avatar:"지",subtitle:"iMessage"}],
    chats:{jiwoo:[{from:"in",text:"안녕! 지금 뭐 해?",time:"오후 8:41"},{from:"out",text:"그냥 쉬고 있어 ㅎㅎ",time:"오후 8:42"},{from:"in",text:"나도 보고 싶다",time:"오후 8:43"}]},
    rules:[{keywords:["안녕","하이","ㅎㅇ"],reply:"안녕 ㅎㅎ 연락해 줘서 좋다"},{keywords:["뭐 해","뭐해","머해"],reply:"그냥 쉬고 있었어! 너는 뭐 해?"},{keywords:["보고 싶","보고싶"],reply:"나도 보고 싶어 🥺"},{keywords:["잘 자","잘자"],reply:"응 너도 잘 자고 좋은 꿈 꿔 🌙"}],
    fallbackReply:"ㅋㅋㅋ 진짜? 조금 더 얘기해 줘",
    music:{title:"Midnight Memories",artist:"Your Playlist",note:"나만의 플레이리스트"},note:"오늘도 기억하고 싶은 순간들을 모아 두기."
  };
  let config = load(), tab = "appearance";
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function load(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(defaults)}}
  function save(){localStorage.setItem(KEY,JSON.stringify(config));}
  function notify(msg){let t=document.querySelector(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.append(t)}t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
  const titles={appearance:"배경화면 & 홈",photos:"사진 갤러리",contacts:"연락처",messages:"메시지 & 자동 답장",music:"음악",notes:"메모"};
  function card(title,desc,body){return `<section class="card"><h2>${title}</h2><p class="desc">${desc}</p>${body}</section>`}
  function field(label,key,value,placeholder="",type="text"){return `<div class="field"><label>${label}</label><input type="${type}" data-field="${key}" value="${esc(value)}" placeholder="${esc(placeholder)}"></div>`}
  function textarea(label,key,value,placeholder=""){return `<div class="field"><label>${label}</label><textarea data-field="${key}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></div>`}
  function render(){
    $("page-title").textContent=titles[tab];
    const panel=$("panel");
    if(tab==="appearance"){
      panel.innerHTML=card("배경화면","홈 화면과 잠금 화면의 분위기를 선택하세요.",`<div class="wallpaper-options">${["aurora","sunset","ocean","night","forest"].map(w=>`<button class="wall-choice ${w} ${config.wallpaper===w?"selected":""}" data-wall="${w}" aria-label="${w}"></button>`).join("")}</div><p class="hint">원하는 배경을 누른 뒤 저장하세요.</p>`)+card("잠금 화면 위젯","홈 화면에 표시되는 제목과 설명을 편집합니다.",field("위젯 제목","lockTitle",config.lockTitle)+field("위젯 설명","lockText",config.lockText));
      panel.querySelectorAll("[data-wall]").forEach(b=>b.onclick=()=>{config.wallpaper=b.dataset.wall;render()});
    } else if(tab==="photos"){
      panel.innerHTML=card("사진 항목","이미지 URL을 입력하거나 이모지 플레이스홀더를 사용하세요. 업로드 기능과 영구 이미지 저장은 스토리지 연결 후 추가할 수 있습니다.",`<div id="photo-items">${config.photos.map((p,i)=>`<div class="item-row"><div class="field"><label>사진 이름</label><input data-photo="${i}" data-key="title" value="${esc(p.title)}"></div><div class="field"><label>이모지 / 아이콘</label><input data-photo="${i}" data-key="emoji" value="${esc(p.emoji||"✿")}"></div><div class="field wide"><label>이미지 URL (선택)</label><input data-photo="${i}" data-key="url" value="${esc(p.url||"")}" placeholder="https://..."></div><div class="wide"><button class="small-btn remove-btn" data-remove-photo="${i}">항목 삭제</button></div></div>`).join("")}</div><button class="add-btn" id="add-photo">＋ 사진 항목 추가</button>`);
      $("add-photo").onclick=()=>{config.photos.push({title:"새 사진",emoji:"✿"});render()};
      panel.querySelectorAll("[data-remove-photo]").forEach(b=>b.onclick=()=>{config.photos.splice(+b.dataset.removePhoto,1);render()});
      panel.querySelectorAll("[data-photo]").forEach(i=>i.oninput=()=>{config.photos[+i.dataset.photo][i.dataset.key]=i.value});
    } else if(tab==="contacts"){
      panel.innerHTML=card("연락처","메시지 앱에서 표시할 이름과 프로필 아이콘을 설정합니다.",`<div id="contact-items">${config.contacts.map((c,i)=>`<div class="item-row"><div class="field"><label>표시 이름</label><input data-contact="${i}" data-key="name" value="${esc(c.name)}"></div><div class="field"><label>프로필 문자/이모지</label><input data-contact="${i}" data-key="avatar" value="${esc(c.avatar||"")}"></div><div class="field wide"><label>설명</label><input data-contact="${i}" data-key="subtitle" value="${esc(c.subtitle||"iMessage")}"></div><div class="wide"><button class="small-btn remove-btn" data-remove-contact="${i}">연락처 삭제</button></div></div>`).join("")}</div><button class="add-btn" id="add-contact">＋ 연락처 추가</button>`);
      $("add-contact").onclick=()=>{let id="contact-"+Date.now();config.contacts.push({id,name:"새 연락처",avatar:"?",subtitle:"iMessage"});config.chats[id]=[];render()};
      panel.querySelectorAll("[data-remove-contact]").forEach(b=>b.onclick=()=>{const c=config.contacts.splice(+b.dataset.removeContact,1)[0];if(c)delete config.chats[c.id];render()});
      panel.querySelectorAll("[data-contact]").forEach(i=>i.oninput=()=>{config.contacts[+i.dataset.contact][i.dataset.key]=i.value});
    } else if(tab==="messages"){
      panel.innerHTML=card("자동 답장 규칙","방문자가 보낸 메시지에 키워드가 포함되면 해당 답장을 보냅니다. 위쪽 규칙부터 검사합니다.",`<div id="rule-items">${config.rules.map((r,i)=>`<div class="rule-row"><div><label class="hint">키워드 (쉼표로 구분)</label><input data-rule="${i}" data-key="keywords" value="${esc((r.keywords||[]).join(", "))}"></div><div><label class="hint">자동 답장</label><input data-rule="${i}" data-key="reply" value="${esc(r.reply)}"></div><button class="small-btn remove-btn" data-remove-rule="${i}">삭제</button></div>`).join("")}</div><button class="add-btn" id="add-rule">＋ 자동 답장 규칙 추가</button>`)+card("기본 답장","일치하는 키워드가 없을 때 보낼 답장입니다.",textarea("기본 답장 문구","fallbackReply",config.fallbackReply))+card("초기 대화 내용","연락처별로 미리 보일 대화는 기본 예시로 시작합니다. 이 영역의 대화 편집 기능은 다음 단계에서 추가할 수 있습니다.",`<p class="hint">현재 기본 대화는 시뮬레이터의 초기 예시이며, 자동 답장 규칙과 기본 답장 문구는 아래 저장 버튼으로 반영됩니다.</p>`);
      $("add-rule").onclick=()=>{config.rules.push({keywords:["새 키워드"],reply:"새 자동 답장"});render()};
      panel.querySelectorAll("[data-remove-rule]").forEach(b=>b.onclick=()=>{config.rules.splice(+b.dataset.removeRule,1);render()});
      panel.querySelectorAll("[data-rule]").forEach(i=>i.oninput=()=>{const r=config.rules[+i.dataset.rule];r[i.dataset.key]=i.dataset.key==="keywords"?i.value.split(",").map(s=>s.trim()).filter(Boolean):i.value});
    } else if(tab==="music"){
      panel.innerHTML=card("지금 재생 중","음악 앱에 표시할 곡 제목과 아티스트를 편집합니다.",field("곡 제목","music.title",config.music.title)+field("아티스트 / 플레이리스트","music.artist",config.music.artist)+field("설명","music.note",config.music.note)+`<p class="hint">실제 오디오 재생은 MP3 등 사용 권한이 있는 파일을 연결하도록 확장할 수 있습니다.</p>`);
    } else if(tab==="notes"){
      panel.innerHTML=card("메모 내용","메모 앱에 표시할 텍스트입니다.",textarea("메모","note",config.note));
    }
    panel.querySelectorAll("[data-field]").forEach(el=>el.addEventListener("input",()=>setDeep(config,el.dataset.field,el.value)));
  }
  function setDeep(obj,path,value){const parts=path.split(".");let cur=obj;for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]]||(cur[parts[i]]={});cur[parts.at(-1)]=value}
  document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{tab=b.dataset.tab;document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));render()}));
  $("save-btn").onclick=()=>{save();notify("변경 사항을 이 브라우저에 저장했어요.")};
  $("reset-btn").onclick=()=>{if(confirm("모든 콘텐츠 설정을 기본값으로 복원할까요?")){config=structuredClone(defaults);save();render();notify("기본값으로 복원했어요.")}};
  $("export-btn").onclick=()=>{const blob=new Blob([JSON.stringify(config,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ios-simulator-config.json";a.click();URL.revokeObjectURL(a.href);notify("설정 JSON을 내보냈어요.")};
  render();
})();