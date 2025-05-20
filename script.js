
let activeSection = "text-section";
let textData = [];
let statsData = [];

let filters = {
  textId: "all",
  wordType: "all",
  pos: "all",
  search: "",
};

async function loadData() {
  try {
    const statsResponse = await fetch("https://zeze440.github.io/vocab-viewer/stats_data.json");
    statsData = await statsResponse.json();

    const textResponse = await fetch("https://zeze440.github.io/vocab-viewer/text_data.json");
    textData = await textResponse.json();

    initApp(statsData, textData);
  } catch (error) {
    console.error("데이터 로드 오류:", error);
    document.getElementById("all-texts-container").innerHTML = "<p style='color:red;'>데이터 로드 실패</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadData);

function initApp(statsData, textData) {
  const container = document.getElementById("all-texts-container");
  const select = document.getElementById("textFilter");

  // 옵션 추가
  textData.forEach((text) => {
    const option = document.createElement("option");
    option.value = text.id;
    option.textContent = `지문 ${text.id}`;
    select.appendChild(option);
  });

  render(textData);

  select.addEventListener("change", () => {
    filters.textId = select.value;
    render(textData);
  });
}

function render(data) {
  const container = document.getElementById("all-texts-container");
  container.innerHTML = "";

  data.forEach((text) => {
    const block = document.createElement("div");
    block.className = "text-block";
    block.dataset.textId = text.id;
    block.style.display = (filters.textId === "all" || filters.textId === text.id) ? "block" : "none";

    const title = document.createElement("h3");
    title.textContent = `지문 ${text.id}`;

    const content = document.createElement("p");
    content.textContent = text.content;

    block.appendChild(title);
    block.appendChild(content);
    container.appendChild(block);
  });
}
