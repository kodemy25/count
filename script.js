const COUNTERS = [
  ["absent", "不在"],
  ["intercom", "インターホンNG"],
  ["front", "フロントNG"],
  ["talk", "トーク後NG"],
  ["target", "対象外"],
  ["apo", "アポ"]
];

const STORAGE_KEY = "countCurrent";
const HISTORY_KEY = "countHistory";

let state = {
  staff: "",
  area: "",
  seconds: 0,
  total: 0,
  startAt: "",
  counts: Object.fromEntries(
    COUNTERS.map(([id]) => [id, 0])
  )
};

let timer = null;
let locked = false;

const $ = (id) => document.getElementById(id);

function todayInfo() {
  const d = new Date();
  const week = ["日","月","火","水","木","金","土"];

  return {
    date:
      `${d.getFullYear()}/` +
      `${String(d.getMonth()+1).padStart(2,"0")}/` +
      `${String(d.getDate()).padStart(2,"0")}`,
    weekday: week[d.getDay()]
  };
}

function clockText(date = new Date()) {
  return (
    String(date.getHours()).padStart(2,"0") +
    ":" +
    String(date.getMinutes()).padStart(2,"0")
  );
}

function formatTime(sec) {

  const h = String(Math.floor(sec / 3600)).padStart(2,"0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2,"0");
  const s = String(sec % 60).padStart(2,"0");

  return `${h}:${m}:${s}`;
}

function renderCounters(){

  $("counterGrid").innerHTML =
  COUNTERS.map(([id,label])=>`

  <article class="counter-card">

    <p class="counter-title">${label}</p>

    <div
      class="counter-num"
      id="${id}">
      0
    </div>

    <div class="counter-actions">

      <button
        class="count-plus"
        data-plus="${id}">
        ＋
      </button>

      <button
        class="count-minus"
        data-minus="${id}">
        －
      </button>

    </div>

  </article>

  `).join("");

}
function render(){

  $("staff").value = state.staff;
  $("area").value = state.area;
  const info = todayInfo();
$("todayText").textContent = `${info.date} (${info.weekday})`;
  $("total").textContent = state.total;
  $("time").textContent = formatTime(state.seconds);

  COUNTERS.forEach(([id]) => {
    const el = $(id);
    if(el){
      el.textContent = state.counts[id] || 0;
    }
  });

  document.body.classList.toggle("locked", locked);
}

function save(){

  state.staff = $("staff").value;
  state.area = $("area").value;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

  $("statusText").textContent = "自動保存済み";
}

function load(){

  const raw = localStorage.getItem(STORAGE_KEY);

  if(!raw) return;

  try{
    const data = JSON.parse(raw);

    state = {
      ...state,
      ...data,
      counts: {
        ...state.counts,
        ...(data.counts || {})
      }
    };

  }catch(e){}
}

function recalcTotal(){

  state.total = Object.values(state.counts)
    .reduce((a,b) => a + Number(b || 0), 0);

}
function startWork(){

  if(locked || timer) return;

  if(!state.startAt){
    state.startAt = clockText();
  }

  timer = setInterval(() => {

    state.seconds++;

    $("time").textContent =
      formatTime(state.seconds);

    save();

  }, 1000);

  save();
}

function finishWork(){

  if(timer){
    clearInterval(timer);
    timer = null;
  }

  const info = todayInfo();

  const finished = {
    id: Date.now(),
    date: info.date,
    weekday: info.weekday,
    staff: $("staff").value,
    area: $("area").value,
    startAt: state.startAt || "",
    endAt: clockText(),
    workTime: formatTime(state.seconds),
    total: state.total,
    counts: {...state.counts}
  };

  const history = JSON.parse(
    localStorage.getItem(HISTORY_KEY) || "[]"
  );

  history.unshift(finished);

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  );

  locked = true;

  $("statusText").textContent =
    "履歴に保存しました";

  render();
}
function plus(id){

  if(locked) return;

  state.counts[id]++;

  recalcTotal();

  render();

  save();
}

function minus(id){

  if(locked) return;

  if(state.counts[id] > 0){

    state.counts[id]--;

    recalcTotal();

    render();

    save();

  }

}

function resetAll(){

  if(!confirm("現在のカウントをリセットしますか？")){
    return;
  }

  if(timer){
    clearInterval(timer);
    timer = null;
  }

  locked = false;

  state = {
    staff:"",
    area:"",
    seconds:0,
    total:0,
    startAt:"",
    counts:Object.fromEntries(
      COUNTERS.map(([id])=>[id,0])
    )
  };

  localStorage.removeItem(STORAGE_KEY);

  $("statusText").textContent = "未保存";

  render();

}

function init(){

  const info = todayInfo();

  $("todayText").textContent =
    `${info.date}（${info.weekday}）`;

  renderCounters();

  load();

  recalcTotal();

  render();

  $("staff").addEventListener("change",save);

  $("area").addEventListener("input",save);

  $("startBtn").addEventListener("click",startWork);

  $("finishBtn").addEventListener("click",finishWork);

  $("resetBtn").addEventListener("click",resetAll);

  $("counterGrid").addEventListener("click",(e)=>{

    const plusId = e.target.dataset.plus;
    const minusId = e.target.dataset.minus;

    if(plusId) plus(plusId);

    if(minusId) minus(minusId);

  });

}

init();