
let activeSection = "text-section";
let textData = [];
let statsData = {};

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

// initApp는 기존 그대로 유지된다고 가정
