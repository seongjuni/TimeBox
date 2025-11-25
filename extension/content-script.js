const frameType = window === window.top ? "TOP" : "IFRAME";
console.log(`[TimeBox ${frameType}] content-script loaded`);

// 파싱 활성화 플래그
let parsingEnabled = false;

// 외부 스크립트 파일로 주입
injectExternalScript();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "TIMEBOX_PARSE_REQUEST") {
    console.log(`[TimeBox ${frameType}] 📌 파싱 요청 수신`);
    
    // 파싱 활성화
    parsingEnabled = true;
    
    showToast("파싱 준비 완료! '조회' 버튼을 눌러주세요.");
    sendResponse({ ok: true });
    
    // 10초 후 자동으로 비활성화 (혹시 놓칠 경우 대비)
    setTimeout(() => {
      if (parsingEnabled) {
        console.log(`[TimeBox ${frameType}] ⏰ 10초 타임아웃 - 파싱 비활성화`);
        parsingEnabled = false;
      }
    }, 10000);
  }
  return true;
});

// 외부 스크립트 주입
function injectExternalScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    console.log(`[TimeBox ${frameType}] ✅ 외부 스크립트 로드 완료`);
    this.remove();
  };
  script.onerror = function(e) {
    console.error(`[TimeBox ${frameType}] ❌ 외부 스크립트 로드 실패:`, e);
  };
  
  (document.head || document.documentElement).appendChild(script);
  console.log(`[TimeBox ${frameType}] 📤 외부 스크립트 주입 시도`);
}

// CustomEvent 리스너
window.addEventListener('timeboxDataCaptured', function(e) {
  console.log(`[TimeBox ${frameType}] 📥 데이터 수신:`, e.detail.courses.length, '개');
  
  // 파싱이 활성화되지 않았으면 무시
  if (!parsingEnabled) {
    console.log(`[TimeBox ${frameType}] ⏭️ 파싱 비활성화 상태 - 무시`);
    return;
  }
  
  // 파싱 비활성화 (한 번만 실행)
  parsingEnabled = false;
  console.log(`[TimeBox ${frameType}] 🔒 파싱 실행 후 비활성화`);
  
  try {
    const data = e.detail;
    
    // 데이터 검증
    if (!data.courses || !Array.isArray(data.courses) || data.courses.length === 0) {
      console.error(`[TimeBox ${frameType}] ❌ 잘못된 데이터:`, data);
      showToast("데이터 형식이 올바르지 않습니다");
      return;
    }
    
    console.log(`[TimeBox ${frameType}] ✅ 데이터 검증 완료`);
    console.log(`[TimeBox ${frameType}] 첫 번째 강의:`, data.courses[0]);
    
    // 백그라운드로 전송
    console.log(`[TimeBox ${frameType}] 📤 백그라운드로 전송 시작...`);
    
    chrome.runtime.sendMessage(
      { 
        type: "TIMEBOX_COURSES_PARSED", 
        courses: data.courses,
        rawData: data.rawData,
        timestamp: data.timestamp
      },
      (response) => {
        console.log(`[TimeBox ${frameType}] 📬 백그라운드 응답:`, response);
        
        if (chrome.runtime.lastError) {
          console.error(`[TimeBox ${frameType}] ❌ 전송 실패:`, chrome.runtime.lastError);
          showToast("데이터 전송 실패: " + chrome.runtime.lastError.message);
        } else if (response && response.success) {
          console.log(`[TimeBox ${frameType}] ✅ 다운로드 성공:`, response.filename);
          showToast(`✅ ${data.courses.length}개 강의 다운로드 완료!`);
        } else {
          console.error(`[TimeBox ${frameType}] ❌ 다운로드 실패:`, response);
          showToast("다운로드 실패: " + (response?.error || "알 수 없는 오류"));
        }
      }
    );
    
  } catch (error) {
    console.error(`[TimeBox ${frameType}] ❌ 처리 중 오류:`, error);
    console.error(`[TimeBox ${frameType}] 오류 스택:`, error.stack);
    showToast("처리 중 오류 발생");
  }
});

// Toast 메시지
function showToast(msg) {
  try {
    const targetDoc = (window !== window.top) ? window.top.document : document;
    
    if (!targetDoc.body) {
      setTimeout(() => showToast(msg), 100);
      return;
    }
    
    const div = targetDoc.createElement("div");
    div.innerText = msg;
    div.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 999999;
      font-size: 15px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: opacity 0.5s;
    `;
    
    targetDoc.body.appendChild(div);
    
    setTimeout(() => {
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 500);
    }, 2500);
  } catch (e) {
    console.error(`[TimeBox ${frameType}] Toast 실패:`, e);
  }
}

console.log(`[TimeBox ${frameType}] 초기화 완료`);