console.log("[TimeBox Background] Service worker started");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[TimeBox Background] Message received:", message.type);

  if (message.type === "TIMEBOX_COURSES_PARSED") {
    console.log(`[TimeBox Background] Processing ${message.courses.length} courses`);
    
    try {
      // 깔끔한 JSON 구조로 정리
      const exportData = {
        metadata: {
          timestamp: message.timestamp,
          courseCount: message.courses.length,
          exportedBy: "TimeBox Course Parser v1.0"
        },
        courses: message.courses.map(course => ({
          // 기본 정보
          과목명: course.SBJT_NM,
          과목번호: course.SBJT_NO_DCLSS,
          학점: course.PNT,
          분반: course.OPEN_DCLSS,
          
          // 교수 정보
          교수: course.PROFESSOR,
          교수번호: course.PROFESSOR_NO,
          
          // 시간 정보
          시간: course.TIME,
          주차: course.WEEK,
          
          // 수강 정보
          수강인원: course.SUGANG_CNT,
          타전공수강인원: course.OTH_SUGANG_CNT,
          수강제한학년: course.OBJ_SHYR_NM,
          
          // 분류 정보
          이수구분: course.MY_CPTN,
          이수구분코드: course.MY_CPTN_CD,
          과목영역: course.SBJT_AREA_CD,
          
          // 기타
          평가방법: course.MRKEV_MTHD_CD,
          온라인타입: course.ONLINE_TYPE_NM,
          학과코드: course.OPEN_SUST_MJ_CD,
          
          // 원본 데이터 (모든 필드 보존)
          _raw: course
        }))
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const filename = `수강신청목록_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:.]/g, "-")}.json`;
      
      console.log("[TimeBox Background] Starting download:", filename);
      
      chrome.downloads.download(
        {
          url: url,
          filename: filename,
          saveAs: true
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("[TimeBox Background] Download failed:", chrome.runtime.lastError);
            sendResponse({ 
              success: false, 
              error: chrome.runtime.lastError.message 
            });
          } else {
            console.log("[TimeBox Background] Download started:", downloadId);
            sendResponse({ 
              success: true, 
              downloadId: downloadId,
              filename: filename
            });
          }
        }
      );
      
      // 비동기 응답을 위해 true 반환
      return true;
      
    } catch (e) {
      console.error("[TimeBox Background] Export error:", e);
      console.error("[TimeBox Background] Error stack:", e.stack);
      sendResponse({ 
        success: false, 
        error: e.message 
      });
      return true;
    }
  }
  
  // 다른 메시지 타입은 무시
  return false;
});

console.log("[TimeBox Background] Message listener registered");