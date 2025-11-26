const btn = document.getElementById("extractBtn");
const statusEl = document.getElementById("status");

btn.addEventListener("click", async () => {
  statusEl.textContent = "전체 과목 수집 중... (자동 스크롤)";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.id) {
      statusEl.textContent = "활성 탭을 찾을 수 없습니다.";
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractCoursesWithScroll,
    });

    statusEl.textContent =
      "완료! 전체 과목을 수집했고 JSON 파일이 다운로드되었습니다.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "에러 발생: " + err.message;
  }
});

// 이 함수는 "수강신청 페이지 안"에서 실행된다.
function extractCoursesWithScroll() {
  (async () => {
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const tbody = document.querySelector(
      "#mf_tac_layout_contents_2020603_body_gdM0_F0_body_tbody"
    );
    const scrollArea = document.querySelector(
      "#mf_tac_layout_contents_2020603_body_gdM0_F0_scrollY_div"
    );

    if (!tbody) {
      alert("과목 테이블(tbody)을 찾을 수 없습니다.");
      return;
    }
    if (!scrollArea) {
      alert("스크롤 영역을 찾을 수 없습니다.");
      return;
    }

    const dayMap = {
      "월": "mon",
      "화": "tue",
      "수": "wed",
      "목": "thu",
      "금": "fri",
      "토": "sat",
      "일": "sun",
    };

    // key → course 객체
    const courseMap = {};

    function collectVisibleRows() {
      const rows = Array.from(tbody.querySelectorAll("tr.grid_body_row"));

      rows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length < 11) return;

        const department = tds[1].innerText.trim();
        const grade = tds[2].innerText.trim();
        const courseName = tds[3].innerText.trim();
        const section = tds[4].innerText.trim();
        const category = tds[5].innerText.trim();
        const credit = Number(tds[6].innerText.trim());
        const classType = tds[7].innerText.trim();

        const timeDiv =
          tds[8].querySelector(".w2grid_textarea") || tds[8];
        const timeText = timeDiv.innerText.trim();

        const professor = tds[10].innerText.trim();

        if (!courseName) return;

        // 같은 과목/분반/교수/시간 조합이면 하나로 취급
        const key = [
          department,
          grade,
          courseName,
          section,
          category,
          credit,
          classType,
          timeText,
          professor,
        ].join("|");

        if (courseMap[key]) {
          return; // 이미 수집된 과목
        }

        // 시간표 파싱
        const schedule = {};
        if (timeText && timeText.includes("~")) {
          const parts = timeText.split(",");
          parts.forEach((part) => {
            const p = part.trim();
            if (!p) return;

            const dayChar = p[0]; // '월'
            const rest = p.slice(1).trim(); // "13:00~15:00"
            if (!rest.includes("~")) return;

            const [start, end] = rest.split("~").map((s) => s.trim());
            const dayKey = dayMap[dayChar];
            if (!dayKey) return;

            schedule[dayKey] = { start, end };
          });
        }

        courseMap[key] = {
          department,
          grade,
          courseName,
          section,
          category,
          credit,
          classType,
          schedule,
          professor,
        };
      });
    }

    // 처음 화면에 보이는 것 한 번 수집
    collectVisibleRows();

    let prevScrollTop = -1;
    let prevCount = Object.keys(courseMap).length;
    let stable = 0;

    // 최대 200번 정도 스크롤 (안전장치)
    for (let i = 0; i < 200; i++) {
      // 한 페이지 아래로 스크롤
      scrollArea.scrollTop += scrollArea.clientHeight - 20;

      await sleep(250); // 그리드가 row 바꾸도록 약간 대기

      collectVisibleRows();

      const currScrollTop = scrollArea.scrollTop;
      const currCount = Object.keys(courseMap).length;

      if (currScrollTop === prevScrollTop && currCount === prevCount) {
        stable++;
      } else {
        stable = 0;
      }

      prevScrollTop = currScrollTop;
      prevCount = currCount;

      // 스크롤 더 내려도 위치랑 과목 수가 안 바뀌면 끝난 걸로 판단
      if (stable >= 3) break;
    }

    const result = Object.values(courseMap);

    if (result.length === 0) {
      alert("추출된 과목이 없습니다.");
      return;
    }

    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `timebox_courses_${today}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert(`총 ${result.length}개의 과목을 JSON 파일로 저장했습니다.`);
  })();
}
