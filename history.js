const HISTORY_KEY = "countHistory";

const COUNTERS = [
  ["absent", "不在"],
  ["intercom", "インターホンNG"],
  ["front", "フロントNG"],
  ["talk", "トーク後NG"],
  ["target", "対象外"],
  ["apo", "アポ"]
];

function render(){

  const list = document.getElementById("historyList");

  const history = JSON.parse(
    localStorage.getItem(HISTORY_KEY) || "[]"
  );

  if(history.length === 0){

    list.innerHTML =
      `<div class="empty">まだ履歴がありません</div>`;

    return;
  }

  list.innerHTML = history.map(item => `

    <article class="history-card">

      <div class="history-head">

        <div>
          <div class="history-date">
            ${item.date}（${item.weekday}）
          </div>

          <div class="history-meta">
            ${item.staff || "担当者なし"} / ${item.area || "エリアなし"}
          </div>

          <div class="history-meta">
            ${item.startAt || "--:--"} - ${item.endAt || "--:--"} / ${item.workTime}
          </div>
        </div>

        <div class="history-total">
          合計
          <strong>${item.total}</strong>
        </div>

      </div>

      <div class="history-detail">
        ${COUNTERS.map(([id,label]) => `
          <span>${label}<b>${item.counts?.[id] ?? 0}</b></span>
        `).join("")}
      </div>

    </article>

  `).join("");
}

document
  .getElementById("clearHistoryBtn")
  .addEventListener("click", () => {

    if(confirm("履歴をすべて削除しますか？")){

      localStorage.removeItem(HISTORY_KEY);

      render();
    }
  });

render();