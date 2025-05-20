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
    document.getElementById("text-loading").style.display = "block";

    const statsResponse = await fetch("https://zeze440.github.io/vocab-viewer/stats_data.json");
    const textResponse = await fetch("https://zeze440.github.io/vocab-viewer/text_data.json");

    initApp(statsData, textData);
    document.getElementById("text-loading").style.display = "none";
  } catch (error) {
    console.error("데이터 로드 오류:", error);
    document.getElementById("text-loading").style.display = "none";
    document.getElementById("all-texts-container").innerHTML = `
      <div class="alert alert-danger m-5">
        <h4 class="alert-heading">데이터 로드 오류</h4>
        <p>데이터를 로드하는 중 문제가 발생했습니다. 다음 조치를 취해보세요:</p>
        <ol>
          <li>웹 서버를 사용하여 파일을 열어보세요. README.txt 파일의 안내를 참조하세요.</li>
          <li>모든 파일(HTML, CSS, JS, JSON)이 같은 폴더에 있는지 확인하세요.</li>
        </ol>
        <hr>
        <p class="mb-0">오류 내용: ${error.message}</p>
      </div>`;
  }
}

// 앱 초기화 함수
function initApp(statsData, textData) {
  // 차트 객체
  let wordTypeChart = null;
  let posChart = null;

  // 현재 활성화된 탭
  let activeSection = "text-section";

  // 필터 옵션 설정
  initializeFilters(textData);

  // 통계 업데이트
  updateStatistics(statsData);

  // 모든 지문 표시
  displayAllTexts(textData);

  // 전체 단어 목록 표시
  displayFullWordList(textData);

  // 차트 생성
  createCharts(statsData);

  // 다크 모드 토글
  document
    .getElementById("darkModeSwitch")
    .addEventListener("change", toggleDarkMode);

  // 탭 전환
  document
    .getElementById("text-tab-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showSection("text-section");
    });

  document
    .getElementById("word-tab-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showSection("word-section");
    });

  document
    .getElementById("stats-tab-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showSection("stats-section");
    });

  // 필터 이벤트
  document.getElementById("textFilter").addEventListener("change", function () {
    filters.textId = this.value;
    applyFilters(textData);
  });

  document.getElementById("typeFilter").addEventListener("change", function () {
    filters.wordType = this.value;
    applyFilters(textData);
  });

  document.getElementById("posFilter").addEventListener("change", function () {
    filters.pos = this.value;
    applyFilters(textData);
  });

  document.getElementById("wordSearch").addEventListener("input", function () {
    filters.search = this.value.toLowerCase();
    applyFilters(textData);
  });
  // 내보내기 버튼
  document
    .getElementById("exportPDF")
    .addEventListener("click", () => exportToPDF(textData, statsData));
  document
    .getElementById("exportExcel")
    .addEventListener("click", () => exportToExcel(textData, statsData));
  document
    .getElementById("exportCSV")
    .addEventListener("click", () => exportToCSV(textData));

  // 섹션 표시 함수
  function showSection(sectionId) {
    // 이전 섹션 숨기기
    document.getElementById(activeSection).style.display = "none";

    // 탭 버튼 비활성화
    document
      .getElementById(activeSection.replace("section", "tab-btn"))
      .classList.remove("active");

    // 새 섹션 표시
    document.getElementById(sectionId).style.display = "block";

    // 탭 버튼 활성화
    document
      .getElementById(sectionId.replace("section", "tab-btn"))
      .classList.add("active");

    // 활성 섹션 업데이트
    activeSection = sectionId;
  }
}

// 필터 초기화
function initializeFilters(textData) {
  const textFilter = document.getElementById("textFilter");
  const typeFilter = document.getElementById("typeFilter");
  const posFilter = document.getElementById("posFilter");

  // 지문 옵션 추가
  textData.forEach((text) => {
    const option = document.createElement("option");
    option.value = text.id;
    option.textContent = `지문 ${text.id}`;
    textFilter.appendChild(option);
  });

  // 단어 유형 옵션 추가
  const wordTypes = new Set();
  textData.forEach((text) => {
    text.words.forEach((word) => {
      wordTypes.add(word.type);
    });
  });

  Array.from(wordTypes)
    .sort()
    .forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });

  // 품사 옵션 추가
  const posTypes = new Set();
  textData.forEach((text) => {
    text.words.forEach((word) => {
      if (word.pos) posTypes.add(word.pos);
    });
  });

  Array.from(posTypes)
    .sort()
    .forEach((pos) => {
      const option = document.createElement("option");
      option.value = pos;
      option.textContent = pos;
      posFilter.appendChild(option);
    });
}

// 모든 지문과 단어 리스트 표시
function displayAllTexts(textData) {
  const container = document.getElementById("all-texts-container");
  container.innerHTML = ""; // 컨테이너 초기화

  if (textData.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>표시할 지문이 없습니다.</p>
            </div>
        `;
    return;
  }

  // 각 지문과 단어 목록을 순차적으로 표시
  textData.forEach((text) => {
    const textBlock = document.createElement("div");
    textBlock.className = "text-block";
    textBlock.dataset.textId = text.id;

    // 지문 카드 생성
    const textCard = document.createElement("div");
    textCard.className = "card mb-4";

    // 지문 컨텐츠 생성
    textCard.innerHTML = `
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-file-alt me-2"></i>지문 ${text.id}</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">원문 텍스트</h5>
                            </div>
                            <div class="card-body">
                                <div class="text-content" id="text-content-${text.id}">
                                    <!-- 텍스트 내용이 여기 표시됨 -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">단어 목록</h5>
                                <div>
                                    <span class="badge bg-secondary me-2">${text.words.length} 단어</span>
                                </div>
                            </div>
                            <div class="card-body">
                                <div style="max-height: 400px; overflow-y: auto;">
                                    <table class="table table-hover word-table">
                                        <thead class="table-light">
                                            <tr>
                                                <th>단어</th>
                                                <th>품사</th>
                                                <th>뜻(한글)</th>
                                                <th>빈도</th>
                                                <th>유형</th>
                                            </tr>
                                        </thead>
                                        <tbody id="word-table-${text.id}">
                                            <!-- 단어 행이 여기 표시됨 -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    textBlock.appendChild(textCard);
    container.appendChild(textBlock);

    // 지문 내용 하이라이팅 및 단어 테이블 채우기
    displayText(text);
  });
}

// 지문 표시 및 단어 하이라이팅
function displayText(text) {
  const textContent = document.getElementById(`text-content-${text.id}`);
  const wordTableBody = document.getElementById(`word-table-${text.id}`);

  // 원본 텍스트 가져오기
  let displayContent = text.content;

  // 단어 하이라이팅
  const words = text.words.slice(); // 복사본 생성

  // 단어를 길이순으로 정렬 (긴 단어부터 처리)
  words.sort((a, b) => b.original.length - a.original.length);

  // 각 단어에 하이라이팅 적용
  words.forEach((word) => {
    const original = word.original;
    const baseForm = word.base_form;
    const wordType = word.type.toLowerCase();

    // 단어 유형에 따른 CSS 클래스 결정
    let highlightClass = "highlight-normal";
    if (word.is_separated) {
      highlightClass = "highlight-separated";
    } else if (wordType.includes("숙어") || wordType.includes("idiom")) {
      highlightClass = "highlight-separated"; // 숙어도 분리형과 같은 스타일 사용
    } else if (wordType.includes("가변") || wordType.includes("pattern")) {
      highlightClass = "highlight-pattern";
    } else if (wordType.includes("사용자")) {
      highlightClass = "highlight-user";
    }

    // 단어 정보 JSON 문자열 생성
    const wordInfo = encodeURIComponent(JSON.stringify(word));

    // 단어 대체 HTML
    const replacement = `<span class="highlight-word ${highlightClass}" data-word='${wordInfo}'>${original}</span>`;

    // 텍스트에서 해당 단어 하이라이팅
    try {
      // 대소문자 무시하고 정확한 단어 경계로 매칭
      const regex = new RegExp("\\b" + escapeRegExp(original) + "\\b", "gi");
      displayContent = displayContent.replace(regex, replacement);
    } catch (e) {
      // 정규식 오류 발생 시 단순 문자열 치환
      displayContent = displayContent.replace(original, replacement);
    }
  });

  // 하이라이팅된 텍스트 표시
  textContent.innerHTML = displayContent;

  // 단어 테이블 초기화
  wordTableBody.innerHTML = "";

  // 단어 정보 표시
  words.forEach((word, index) => {
    const row = document.createElement("tr");
    row.className = "word-row";
    row.className = "word-row";
    row.dataset.index = index;
    row.dataset.word = word.base_form;

    // 빈도수에 따른 별표 생성
    const stars = "★".repeat(Math.min(word.frequency, 5));

    // 신뢰도에 따른 스타일 적용
    if (word.confidence >= 0.8) {
      row.classList.add("confidence-high");
    } else if (word.confidence >= 0.5) {
      row.classList.add("confidence-medium");
    } else {
      row.classList.add("confidence-low");
    }

    // 클릭 이벤트 추가
    row.addEventListener("click", function () {
      showWordDetail(word);
    });

    row.innerHTML = `
            <td>${word.base_form}</td>
            <td>${word.pos}</td>
            <td>${word.meaning_ko}</td>
            <td><span class="frequency-stars">${stars}</span></td>
            <td>${getTypeWithTag(word.type, word.is_separated)}</td>
        `;

    wordTableBody.appendChild(row);
  });

  // 단어 하이라이팅에 이벤트 리스너 추가
  addHighlightListeners(text.id);
}

// 전체 단어 목록 표시
function displayFullWordList(textData) {
  const tableBody = document.getElementById("fullWordTableBody");
  tableBody.innerHTML = "";

  // 모든 지문의 모든 단어 추가
  textData.forEach((text) => {
    text.words.forEach((word) => {
      const row = document.createElement("tr");
      row.className = "word-row";
      row.className = "word-row";

      // 단어 정보 저장
      row.dataset.textId = text.id;
      row.dataset.word = word.base_form;
      row.dataset.type = word.type;
      row.dataset.pos = word.pos;

      // 빈도수에 따른 별표 생성
      const stars = "★".repeat(Math.min(word.frequency, 5));

      // 단어 유형에 따른 스타일 적용
      if (word.is_separated) {
        row.classList.add("separated-word");
      }

      // 신뢰도에 따른 스타일 적용
      if (word.confidence >= 0.8) {
        row.classList.add("confidence-high");
      } else if (word.confidence >= 0.5) {
        row.classList.add("confidence-medium");
      } else {
        row.classList.add("confidence-low");
      }

      // 클릭 이벤트 추가
      row.addEventListener("click", function () {
        showWordDetail(word);
      });

      row.innerHTML = `
                <td>지문 ${text.id}</td>
                <td>${word.original}</td>
                <td>${word.base_form}</td>
                <td>${word.pos}</td>
                <td>${word.meaning_ko}</td>
                <td>${word.meaning_en || "-"}</td>
                <td>${getTypeWithTag(word.type, word.is_separated)}</td>
                <td><span class="frequency-stars">${stars}</span></td>
                <td>${formatSynonymsAntonyms(word.synonyms)}</td>
                <td>${formatSynonymsAntonyms(word.antonyms)}</td>
            `;

      tableBody.appendChild(row);
    });
  });
}

// 단어 유형에 태그 추가
function getTypeWithTag(type, isSeparated) {
  let badgeClass = "tag-normal";

  if (isSeparated) {
    badgeClass = "tag-separated";
  } else if (
    type.toLowerCase().includes("숙어") ||
    type.toLowerCase().includes("idiom")
  ) {
    badgeClass = "tag-separated"; // 숙어도 분리형과 같은 스타일 사용
  } else if (
    type.toLowerCase().includes("가변") ||
    type.toLowerCase().includes("pattern")
  ) {
    badgeClass = "tag-pattern";
  } else if (type.toLowerCase().includes("사용자")) {
    badgeClass = "tag-user";
  }

  return `<span class="word-tag ${badgeClass}">${type}</span>`;
}

// 동의어/반의어 형식화
function formatSynonymsAntonyms(text) {
  if (!text || text === "-") return "-";

  // 슬래시(/)로 구분된 단어를 배열로 분할
  const words = text.split(/[\/,;]/);

  // 각 단어를 배지로 변환
  return words
    .filter((word) => word.trim())
    .map(
      (word) =>
        `<span class="badge badge-custom synonym-badge">${word.trim()}</span>`
    )
    .join(" ");
}

// 단어 하이라이팅에 리스너 추가
function addHighlightListeners(textId) {
  const textContent = document.getElementById(`text-content-${textId}`);
  if (!textContent) return;

  const highlightedWords = textContent.querySelectorAll(".highlight-word");

  highlightedWords.forEach((span) => {
    // 마우스 오버 시 툴팁 표시
    span.addEventListener("mouseenter", function (e) {
      try {
        const wordData = JSON.parse(decodeURIComponent(this.dataset.word));
        showWordTooltip(this, wordData);
      } catch (error) {
        console.error("단어 데이터 파싱 오류:", error);
      }
    });

    // 마우스 벗어날 때 툴팁 숨기기
    span.addEventListener("mouseleave", function () {
      hideWordTooltip();
    });

    // 클릭 시 단어 상세 정보 표시
    span.addEventListener("click", function () {
      try {
        const wordData = JSON.parse(decodeURIComponent(this.dataset.word));
        showWordDetail(wordData);
      } catch (error) {
        console.error("단어 데이터 파싱 오류:", error);
      }
    });
  });
}

// 단어 툴팁 표시
function showWordTooltip(element, wordData) {
  // 기존 툴팁 제거
  hideWordTooltip();

  // 새 툴팁 생성
  const tooltip = document.createElement("div");
  tooltip.className = "word-tooltip";
  tooltip.id = "currentTooltip";

  // 빈도수에 따른 별표 생성
  const stars = "★".repeat(Math.min(wordData.frequency, 5));

  // 툴팁 내용 생성
  tooltip.innerHTML = `
        <strong>${wordData.base_form}</strong>
        <table class="tooltip-table">
            <tr>
                <td>품사:</td>
                <td>${wordData.pos || "-"}</td>
            </tr>
            <tr>
                <td>의미:</td>
                <td>${wordData.meaning_ko || "-"}</td>
            </tr>
            <tr>
                <td>유형:</td>
                <td>${wordData.type || "-"}</td>
            </tr>
            <tr>
                <td>빈도:</td>
                <td><span class="frequency-stars">${stars}</span></td>
            </tr>
        </table>
    `;

  // 툴팁 위치 설정 및 표시
  element.appendChild(tooltip);
  tooltip.style.display = "block";

  // 툴팁이 화면 밖으로 나가지 않도록 위치 조정
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;

  if (tooltipRect.right > viewportWidth) {
    tooltip.style.left = "auto";
    tooltip.style.right = "0";
  }
}
// 단어 툴팁 숨기기
function hideWordTooltip() {
  const tooltip = document.getElementById("currentTooltip");
  if (tooltip) {
    tooltip.remove();
  }
}

// 단어 상세 정보 모달 표시
function showWordDetail(wordData) {
  // 모달 요소 참조
  const modalEl = document.getElementById("wordDetailModal");
  const modal = new bootstrap.Modal(modalEl);

  // 빈도수에 따른 별표 생성
  const stars = "★".repeat(Math.min(wordData.frequency, 5));

  // 모달 내용 업데이트
  document.getElementById("wordDetailTitle").textContent = wordData.original;
  document.getElementById("wordOriginal").textContent = wordData.original;
  document.getElementById("wordBaseForm").textContent = wordData.base_form;
  document.getElementById("wordPos").textContent = wordData.pos || "-";
  document.getElementById("wordMeaningKo").textContent =
    wordData.meaning_ko || "-";
  document.getElementById("wordMeaningEn").textContent =
    wordData.meaning_en || "-";
  document.getElementById("wordType").textContent = wordData.type || "-";
  document.getElementById("wordContext").textContent =
    wordData.context || wordData.original;
  document.getElementById(
    "wordFrequency"
  ).innerHTML = `<span class="frequency-stars">${stars}</span>`;

  // 동의어 표시
  const synonymsContainer = document.getElementById("synonymsContainer");
  const wordSynonyms = document.getElementById("wordSynonyms");

  if (wordData.synonyms && wordData.synonyms.trim()) {
    synonymsContainer.style.display = "block";
    wordSynonyms.innerHTML = formatSynonymsAntonyms(wordData.synonyms);
  } else {
    synonymsContainer.style.display = "none";
  }

  // 반의어 표시
  const antonymsContainer = document.getElementById("antonymsContainer");
  const wordAntonyms = document.getElementById("wordAntonyms");

  if (wordData.antonyms && wordData.antonyms.trim()) {
    antonymsContainer.style.display = "block";
    wordAntonyms.innerHTML = formatSynonymsAntonyms(wordData.antonyms);
  } else {
    antonymsContainer.style.display = "none";
  }

  // 모달 표시
  modal.show();
}

// 필터 적용
function applyFilters(textData) {
  console.log("필터 적용:", filters);

  // 현재 보고 있는 텍스트 섹션 업데이트
  if (activeSection === "text-section") {
    // 지문 필터링 - 효과적인 방식 적용
    const blocks = document.querySelectorAll(".text-block");
    console.log(`총 ${blocks.length}개의 지문 블록 발견`);

    blocks.forEach((block) => {
      const blockId = block.dataset.textId;

      // 명시적으로 스타일 설정
      if (filters.textId === "all" || blockId === filters.textId) {
        block.style.display = "block";
        block.style.visibility = "visible";
      } else {
        block.style.display = "none";
        block.style.visibility = "hidden";
        return; // 다음 필터링 작업 건너뛰기
      }

      // 단어 필터링 (표시된 지문에 대해서만)
      filterTextWords(blockId);
    });
  }

  // 단어 목록 섹션 필터링
  if (
    activeSection === "word-section" ||
    document.getElementById("word-section").style.display !== "none"
  ) {
    filterFullWordList();
  }

  // 활성 필터 태그 업데이트
  updateActiveTags();
}

// 특정 지문의 단어 필터링
function filterTextWords(textId) {
  const rows = document.querySelectorAll(`#word-table-${textId} .word-row`);

  rows.forEach((row) => {
    const wordText = row
      .querySelector("td:first-child")
      .textContent.toLowerCase();
    const wordType = row
      .querySelector("td:nth-child(5)")
      .textContent.toLowerCase();
    const wordPos = row
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase();

    // 필터 조건 검사
    const typeMatch =
      filters.wordType === "all" ||
      wordType.includes(filters.wordType.toLowerCase());
    const posMatch =
      filters.pos === "all" || wordPos === filters.pos.toLowerCase();
    const searchMatch = !filters.search || wordText.includes(filters.search);

    // 모든 조건을 만족하면 표시, 아니면 숨김
    row.style.display = typeMatch && posMatch && searchMatch ? "" : "none";
  });

  // 단어 하이라이팅 필터링
  const textContent = document.getElementById(`text-content-${textId}`);
  if (!textContent) return;

  const highlightedWords = textContent.querySelectorAll(".highlight-word");

  highlightedWords.forEach((span) => {
    try {
      const wordData = JSON.parse(decodeURIComponent(span.dataset.word));
      const wordText = wordData.base_form.toLowerCase();
      const wordType = wordData.type.toLowerCase();
      const wordPos = (wordData.pos || "").toLowerCase();

      // 필터 조건 검사
      const typeMatch =
        filters.wordType === "all" ||
        wordType.includes(filters.wordType.toLowerCase());
      const posMatch =
        filters.pos === "all" || wordPos === filters.pos.toLowerCase();
      const searchMatch = !filters.search || wordText.includes(filters.search);

      // 모든 조건을 만족하면 강조, 아니면 희미하게 표시
      if (typeMatch && posMatch && searchMatch) {
        span.style.opacity = "1";
      } else {
        span.style.opacity = "0.3";
      }
    } catch (e) {
      // JSON 파싱 오류 시 처리
      console.error("단어 데이터 파싱 오류:", e);
    }
  });
}

// 전체 단어 목록 필터링
function filterFullWordList() {
  const rows = document.querySelectorAll("#fullWordTableBody .word-row");
  let visibleCount = 0;

  rows.forEach((row) => {
    const textId = row
      .querySelector("td:first-child")
      .textContent.replace("지문 ", "");
    const wordText = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase(); // 원형
    const wordType = row
      .querySelector("td:nth-child(7)")
      .textContent.toLowerCase(); // 유형
    const wordPos = row
      .querySelector("td:nth-child(4)")
      .textContent.toLowerCase(); // 품사

    // 필터 조건 검사
    const textMatch = filters.textId === "all" || textId === filters.textId;
    const typeMatch =
      filters.wordType === "all" ||
      wordType.includes(filters.wordType.toLowerCase());
    const posMatch =
      filters.pos === "all" || wordPos === filters.pos.toLowerCase();
    const searchMatch =
      !filters.search ||
      wordText.includes(filters.search) ||
      row
        .querySelector("td:nth-child(2)")
        .textContent.toLowerCase()
        .includes(filters.search); // 원본 단어도 검색

    // 모든 조건을 만족하면 표시, 아니면 숨김
    const isVisible = textMatch && typeMatch && posMatch && searchMatch;
    row.style.display = isVisible ? "" : "none";

    if (isVisible) {
      visibleCount++;
    }
  });

  // 빈 상태 처리
  if (visibleCount === 0) {
    // 메시지가 없으면 추가
    if (!document.getElementById("emptyWordListMessage")) {
      const tbody = document.getElementById("fullWordTableBody");
      const tr = document.createElement("tr");
      tr.id = "emptyWordListMessage";
      tr.innerHTML = `<td colspan="10" class="text-center py-4">
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>검색 결과가 없습니다.</p>
                </div>
            </td>`;
      tbody.appendChild(tr);
    }
  } else {
    // 메시지가 있으면 제거
    const emptyMessage = document.getElementById("emptyWordListMessage");
    if (emptyMessage) {
      emptyMessage.remove();
    }
  }
}

// 활성 필터 태그 업데이트
function updateActiveTags() {
  const tagsContainer = document.getElementById("activeTags");
  tagsContainer.innerHTML = "";

  // 텍스트 필터 태그
  if (filters.textId !== "all") {
    addFilterTag(tagsContainer, "지문", filters.textId, "textId", "all");
  }

  // 단어 유형 필터 태그
  if (filters.wordType !== "all") {
    addFilterTag(tagsContainer, "유형", filters.wordType, "wordType", "all");
  }

  // 품사 필터 태그
  if (filters.pos !== "all") {
    addFilterTag(tagsContainer, "품사", filters.pos, "pos", "all");
  }

  // 검색어 필터 태그
  if (filters.search) {
    addFilterTag(tagsContainer, "검색", filters.search, "search", "");
  }
}

// 필터 태그 추가
function addFilterTag(container, label, value, filterKey, resetValue) {
  const tag = document.createElement("div");
  tag.className = "badge bg-primary me-2 mb-2 py-2 px-3";
  tag.innerHTML = `${label}: ${value} <i class="fas fa-times-circle ms-1"></i>`;

  // 태그 클릭 시 필터 제거
  tag.addEventListener("click", function () {
    filters[filterKey] = resetValue;

    // 필터 컨트롤 업데이트
    document.getElementById(filterKey + "Filter").value = resetValue;

    // 검색 입력 필드 업데이트
    if (filterKey === "search") {
      document.getElementById("wordSearch").value = "";
    }

    // 필터 적용
    applyFilters(textData);
  });

  container.appendChild(tag);
}

// 통계 업데이트
function updateStatistics(statsData) {
  // 대시보드 카드 업데이트
  document.getElementById("totalTextCount").textContent = statsData.total_texts;
  document.getElementById("totalWordCount").textContent = statsData.total_words;

  // 숙어 수 계산
  let idiomCount = 0;
  Object.entries(statsData.word_types).forEach(([type, count]) => {
    if (
      type.toLowerCase().includes("숙어") ||
      type.toLowerCase().includes("idiom")
    ) {
      idiomCount += count;
    }
  });
  document.getElementById("totalIdiomCount").textContent = idiomCount;

  // 분리형 표현 수
  document.getElementById("totalSeparatedCount").textContent =
    statsData.separated_count;

  // 통계 테이블 업데이트
  const statsTable = document.getElementById("statsTable");
  statsTable.innerHTML = "";

  // 기본 통계 정보
  addStatRow(statsTable, "총 지문 수", statsData.total_texts);
  addStatRow(statsTable, "총 단어 수", statsData.total_words);
  addStatRow(
    statsTable,
    "평균 지문당 단어 수",
    (statsData.total_words / Math.max(statsData.total_texts, 1)).toFixed(1)
  );

  // 단어 유형별 통계
  Object.entries(statsData.word_types).forEach(([type, count]) => {
    addStatRow(statsTable, `${type} 수`, count);
  });

  // 분리형 표현 통계
  addStatRow(statsTable, "분리형 표현 수", statsData.separated_count);

  // 빈도 통계 추가
  if (statsData.word_frequency) {
    addStatRow(statsTable, "고빈도 단어(★★★★★)", statsData.word_frequency.high);
    addStatRow(
      statsTable,
      "중빈도 단어(★★-★★★★)",
      statsData.word_frequency.medium
    );
    addStatRow(statsTable, "저빈도 단어(★)", statsData.word_frequency.low);
  }

  // 생성 시간
  addStatRow(statsTable, "생성 시간", new Date().toLocaleString());
}

// 통계 행 추가
function addStatRow(table, label, value) {
  const row = document.createElement("tr");
  row.className = "word-row";
  row.innerHTML = `
        <td style="width: 50%;"><strong>${label}</strong></td>
        <td>${value}</td>
    `;
  table.appendChild(row);
}
// 차트 생성
function createCharts(statsData) {
  // 단어 유형 분포 차트
  const wordTypeData = {
    labels: Object.keys(statsData.word_types),
    datasets: [
      {
        label: "단어 수",
        data: Object.values(statsData.word_types),
        backgroundColor: [
          "rgba(52, 152, 219, 0.7)",
          "rgba(46, 204, 113, 0.7)",
          "rgba(155, 89, 182, 0.7)",
          "rgba(241, 196, 15, 0.7)",
          "rgba(231, 76, 60, 0.7)",
          "rgba(52, 73, 94, 0.7)",
        ],
        borderColor: [
          "rgba(52, 152, 219, 1)",
          "rgba(46, 204, 113, 1)",
          "rgba(155, 89, 182, 1)",
          "rgba(241, 196, 15, 1)",
          "rgba(231, 76, 60, 1)",
          "rgba(52, 73, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const wordTypeCtx = document.getElementById("wordTypeChart").getContext("2d");
  wordTypeChart = new Chart(wordTypeCtx, {
    type: "pie",
    data: wordTypeData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  // 품사별 분포 차트
  const posData = {
    labels: Object.keys(statsData.pos_distribution),
    datasets: [
      {
        label: "단어 수",
        data: Object.values(statsData.pos_distribution),
        backgroundColor: "rgba(52, 152, 219, 0.5)",
        borderColor: "rgba(52, 152, 219, 1)",
        borderWidth: 1,
      },
    ],
  };

  const posCtx = document.getElementById("posChart").getContext("2d");
  posChart = new Chart(posCtx, {
    type: "bar",
    data: posData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// 다크 모드 토글
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");

  // 차트 색상 업데이트
  if (wordTypeChart && posChart) {
    const isDarkMode = document.body.classList.contains("dark-mode");

    // 차트 텍스트 색상 변경
    wordTypeChart.options.plugins.legend.labels.color = isDarkMode
      ? "#e0e0e0"
      : "#666";
    posChart.options.plugins.legend.labels.color = isDarkMode
      ? "#e0e0e0"
      : "#666";

    // 차트 축 색상 변경
    if (posChart.options.scales.y) {
      posChart.options.scales.y.ticks.color = isDarkMode ? "#e0e0e0" : "#666";
      posChart.options.scales.x.ticks.color = isDarkMode ? "#e0e0e0" : "#666";
      posChart.options.scales.y.grid.color = isDarkMode
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)";
      posChart.options.scales.x.grid.color = isDarkMode
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)";
    }

    // 차트 업데이트
    wordTypeChart.update();
    posChart.update();
  }
}

// PDF로 내보내기
function exportToPDF(textData, statsData) {
  const { jsPDF } = window.jspdf;

  // 로딩 표시
  showLoading("PDF를 생성 중입니다...");

  setTimeout(() => {
    try {
      // PDF 문서 생성
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let yPos = 10;

      // 제목 추가
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("단어장 시각화 보고서", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 10;

      // 생성 시간 추가
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `생성 시간: ${new Date().toLocaleString()}`,
        pageWidth / 2,
        yPos,
        { align: "center" }
      );
      yPos += 15;

      // 기본 통계 추가
      doc.setFontSize(14);
      doc.text("기본 통계", margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.text(`총 지문 수: ${statsData.total_texts}`, margin, yPos);
      yPos += 5;
      doc.text(`총 단어 수: ${statsData.total_words}`, margin, yPos);
      yPos += 5;
      doc.text(
        `평균 지문당 단어 수: ${(
          statsData.total_words / Math.max(statsData.total_texts, 1)
        ).toFixed(1)}`,
        margin,
        yPos
      );
      yPos += 10;

      // 단어 유형별 통계
      doc.setFontSize(14);
      doc.text("단어 유형별 통계", margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      Object.entries(statsData.word_types).forEach(([type, count]) => {
        doc.text(`${type}: ${count}`, margin, yPos);
        yPos += 5;
      });
      yPos += 5;

      // 차트 캡쳐 및 추가
      html2canvas(document.getElementById("wordTypeChart")).then((canvas) => {
        // 차트 이미지 추가
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 페이지 넘침 확인 후 필요시 새 페이지 추가
        if (yPos + imgHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }

        doc.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;

        // 단어 목록 추가
        doc.addPage();
        yPos = margin;

        doc.setFontSize(14);
        doc.text("단어 목록", margin, yPos);
        yPos += 10;

        // 테이블 헤더
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const col1Width = 40;
        const col2Width = 30;
        const col3Width = 80;

        doc.text("단어", margin, yPos);
        doc.text("품사", margin + col1Width, yPos);
        doc.text("의미", margin + col1Width + col2Width, yPos);
        yPos += 5;

        // 구분선
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        // 테이블 내용
        doc.setFont("helvetica", "normal");

        let wordCount = 0;
        textData.forEach((text) => {
          text.words.forEach((word) => {
            // 페이지 넘침 확인
            if (yPos > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              yPos = margin;

              // 새 페이지에 헤더 다시 추가
              doc.setFont("helvetica", "bold");
              doc.text("단어", margin, yPos);
              doc.text("품사", margin + col1Width, yPos);
              doc.text("의미", margin + col1Width + col2Width, yPos);
              yPos += 5;

              doc.line(margin, yPos, pageWidth - margin, yPos);
              yPos += 5;

              doc.setFont("helvetica", "normal");
            }

            // 단어 정보 추가
            doc.text(word.base_form.substring(0, 20), margin, yPos);
            doc.text(word.pos.substring(0, 15), margin + col1Width, yPos);

            // 긴 텍스트 처리
            const meaning = word.meaning_ko || "-";
            if (meaning.length > 40) {
              doc.text(
                meaning.substring(0, 37) + "...",
                margin + col1Width + col2Width,
                yPos
              );
            } else {
              doc.text(meaning, margin + col1Width + col2Width, yPos);
            }

            yPos += 5;
            wordCount++;

            // 너무 많은 단어는 제한
            if (wordCount >= 100) {
              return;
            }
          });

          if (wordCount >= 100) {
            return;
          }
        });

        // 너무 많은 단어인 경우 메시지 추가
        if (statsData.total_words > 100) {
          yPos += 5;
          doc.setFont("helvetica", "italic");
          doc.text(
            `(전체 ${statsData.total_words}개 단어 중 100개만 표시됨)`,
            margin,
            yPos
          );
        }

        // PDF 저장
        doc.save("단어장_보고서.pdf");
        hideLoading();
      });
    } catch (e) {
      console.error("PDF 내보내기 오류:", e);
      hideLoading();
      alert("PDF 생성 중 오류가 발생했습니다.");
    }
  }, 100);
}

// Excel로 내보내기
function exportToExcel(textData, statsData) {
  showLoading("Excel 파일을 생성 중입니다...");

  setTimeout(() => {
    try {
      // 워크북 생성
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "단어장",
        Subject: "단어장 시각화",
        Author: "단어장 시각화 도구",
        CreatedDate: new Date(),
      };

      // 단어 목록 시트 생성
      const wsData = [
        [
          "지문",
          "단어",
          "원형",
          "품사",
          "뜻(한글)",
          "뜻(영어)",
          "유형",
          "빈도",
          "동의어",
          "반의어",
        ],
      ];

      textData.forEach((text) => {
        text.words.forEach((word) => {
          wsData.push([
            `지문 ${text.id}`,
            word.original,
            word.base_form,
            word.pos || "",
            word.meaning_ko || "",
            word.meaning_en || "",
            word.type || "",
            word.frequency || 0,
            word.synonyms || "",
            word.antonyms || "",
          ]);
        });
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "단어 목록");

      // 통계 시트 생성
      const statsSheetData = [["항목", "값"]];

      statsSheetData.push(["총 지문 수", statsData.total_texts]);
      statsSheetData.push(["총 단어 수", statsData.total_words]);
      statsSheetData.push([
        "평균 지문당 단어 수",
        (statsData.total_words / Math.max(statsData.total_texts, 1)).toFixed(1),
      ]);

      Object.entries(statsData.word_types).forEach(([type, count]) => {
        statsSheetData.push([`${type} 수`, count]);
      });

      statsSheetData.push(["분리형 표현 수", statsData.separated_count]);

      if (statsData.word_frequency) {
        statsSheetData.push([
          "고빈도 단어(★★★★★)",
          statsData.word_frequency.high,
        ]);
        statsSheetData.push([
          "중빈도 단어(★★-★★★★)",
          statsData.word_frequency.medium,
        ]);
        statsSheetData.push(["저빈도 단어(★)", statsData.word_frequency.low]);
      }

      statsSheetData.push(["생성 시간", new Date().toLocaleString()]);

      const statsWs = XLSX.utils.aoa_to_sheet(statsSheetData);
      XLSX.utils.book_append_sheet(wb, statsWs, "통계");

      // 파일 저장
      XLSX.writeFile(wb, "단어장.xlsx");
      hideLoading();
    } catch (e) {
      console.error("Excel 내보내기 오류:", e);
      hideLoading();
      alert("Excel 파일 생성 중 오류가 발생했습니다.");
    }
  }, 100);
}

// CSV로 내보내기
function exportToCSV(textData) {
  showLoading("CSV 파일을 생성 중입니다...");

  setTimeout(() => {
    try {
      // CSV 데이터 생성
      const headers = [
        "지문",
        "단어",
        "원형",
        "품사",
        "뜻(한글)",
        "뜻(영어)",
        "유형",
        "빈도",
        "동의어",
        "반의어",
      ];
      const csvRows = [headers.join(",")];

      textData.forEach((text) => {
        text.words.forEach((word) => {
          // CSV 셀 값에 쉼표가 있을 경우 따옴표로 감싸기
          const row = [
            `지문 ${text.id}`,
            escapeCsvValue(word.original),
            escapeCsvValue(word.base_form),
            escapeCsvValue(word.pos || ""),
            escapeCsvValue(word.meaning_ko || ""),
            escapeCsvValue(word.meaning_en || ""),
            escapeCsvValue(word.type || ""),
            word.frequency || 0,
            escapeCsvValue(word.synonyms || ""),
            escapeCsvValue(word.antonyms || ""),
          ];

          csvRows.push(row.join(","));
        });
      });

      // CSV 파일 생성 및 다운로드
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "단어장.csv");
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      hideLoading();
    } catch (e) {
      console.error("CSV 내보내기 오류:", e);
      hideLoading();
      alert("CSV 파일 생성 중 오류가 발생했습니다.");
    }
  }, 100);
}

// CSV 값 이스케이프 처리
function escapeCsvValue(val) {
  if (typeof val !== "string") return val;

  // 쉼표, 따옴표, 줄바꿈이 포함된 경우 처리
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    // 따옴표 이스케이프 (따옴표를 두 개로)
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

// 로딩 표시
function showLoading(message) {
  // 기존 로딩 제거
  hideLoading();

  // 새 로딩 생성
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loadingIndicator";
  loadingDiv.style.position = "fixed";
  loadingDiv.style.top = "0";
  loadingDiv.style.left = "0";
  loadingDiv.style.width = "100%";
  loadingDiv.style.height = "100%";
  loadingDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  loadingDiv.style.zIndex = "9999";
  loadingDiv.style.display = "flex";
  loadingDiv.style.flexDirection = "column";
  loadingDiv.style.justifyContent = "center";
  loadingDiv.style.alignItems = "center";
  loadingDiv.style.color = "white";

  loadingDiv.innerHTML = `
        <div class="loader"></div>
        <p style="margin-top: 15px;">${message || "처리 중..."}</p>
    `;

  document.body.appendChild(loadingDiv);
}

// 로딩 숨기기
function hideLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

// 정규식 이스케이프 함수
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 페이지 로드 시 데이터 로드 시작
document.addEventListener("DOMContentLoaded", loadData);
