document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("parseBtn");
  const statusEl = document.getElementById("status");

  btn.addEventListener("click", () => {
    statusEl.textContent = "현재 탭에 파싱 요청 전송 중...";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        statusEl.textContent = "활성 탭을 찾지 못했습니다.";
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: "TIMEBOX_PARSE_REQUEST" },
        (res) => {
          if (chrome.runtime.lastError) {
            console.warn("[TimeBox popup] sendMessage error:", chrome.runtime.lastError.message);
            statusEl.textContent = "컨텐츠 스크립트에 연결할 수 없습니다.";
            return;
          }

          if (res && res.ok) {
            statusEl.textContent = "파싱 준비 완료! 페이지에서 '조회' 버튼을 눌러주세요.";
          } else {
            statusEl.textContent = "파싱 준비 중 알 수 없는 오류가 발생했습니다.";
          }
        }
      );
    });
  });
});
