const items=[["absent","不在"],["intercom","インターホンNG"],["front","フロントNG"],["talk","トーク後NG"],["target","対象外"],["apo","アポ"]];
let data={staff:"",area:"",seconds:0,total:0,counts:Object.fromEntries(items.map(([id])=>[id,0]))};
let timer=null;

const $=id=>document.getElementById(id);

function today(){
  const d=new Date(), w=["日","月","火","水","木","金","土"];
  $("today").textContent=`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}（${w[d.getDay()]}）`;
}
function fmt(s){
  return `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}
function save(){
  data.staff=$("staff").value; data.area=$("area").value;
  localStorage.setItem("countData",JSON.stringify(data));
  $("status").textContent="自動保存済み";
}
function load(){
  const raw=localStorage.getItem("countData");
  if(raw) data={...data,...JSON.parse(raw),counts:{...data.counts,...JSON.parse(raw).counts}};
}
function render(){
  $("staff").value=data.staff; $("area").value=data.area;
  $("total").textContent=data.total; $("time").textContent=fmt(data.seconds);
  items.forEach(([id])=>$(id).textContent=data.counts[id]||0);
}
function renderCards(){
  $("grid").innerHTML=items.map(([id,name])=>`
    <div class="card">
      <h3>${name}</h3>
      <div class="num" id="${id}">0</div>
      <div class="btns">
        <button class="plus" data-plus="${id}">＋</button>
        <button class="minus" data-minus="${id}">－</button>
      </div>
    </div>`).join("");
}
function plus(id){data.counts[id]++;data.total++;render();save()}
function minus(id){if(data.counts[id]>0){data.counts[id]--;data.total--;render();save()}}
function start(){
  if(timer)return;
  timer=setInterval(()=>{data.seconds++;$("time").textContent=fmt(data.seconds);save()},1000);
}
function finish(){clearInterval(timer);timer=null;save()}
function resetAll(){
  if(!confirm("リセットしますか？"))return;
  clearInterval(timer); timer=null;
  data={staff:"",area:"",seconds:0,total:0,counts:Object.fromEntries(items.map(([id])=>[id,0]))};
  localStorage.removeItem("countData"); render(); $("status").textContent="未保存";
}
today(); renderCards(); load(); render();
$("staff").onchange=save; $("area").oninput=save;
$("start").onclick=start; $("finish").onclick=finish; $("reset").onclick=resetAll;
$("grid").onclick=e=>{if(e.target.dataset.plus)plus(e.target.dataset.plus); if(e.target.dataset.minus)minus(e.target.dataset.minus)};