// 이 파일은 페이지 컨텍스트에서 실행됩니다
console.log('[TimeBox Injected] 페이지 컨텍스트에서 실행 시작');

const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  this._tbUrl = url;
  this._tbMethod = method;
  console.log('[TimeBox Injected] XHR open:', method, url);
  return originalOpen.call(this, method, url, ...rest);
};

XMLHttpRequest.prototype.send = function(body) {
  const xhr = this;
  
  const loadHandler = function() {
    console.log('[TimeBox Injected] XHR load:', xhr._tbUrl);
    
    if (xhr._tbUrl && xhr._tbUrl.includes('select_rqM0_F0')) {
      console.log('[TimeBox Injected] ✅✅✅ F0 API 감지!');
      
      try {
        const json = JSON.parse(xhr.responseText);
        const courses = json.dlt_rsM0_F0;
        
        if (courses && Array.isArray(courses)) {
          console.log('[TimeBox Injected] ✅ ' + courses.length + '개 강의 추출');
          
          // CustomEvent로 Content Script에 전달
          window.dispatchEvent(new CustomEvent('timeboxDataCaptured', {
            detail: {
              courses: courses,
              rawData: json,
              timestamp: new Date().toISOString()
            }
          }));
        }
      } catch (e) {
        console.error('[TimeBox Injected] 파싱 실패:', e);
      }
    }
  };
  
  xhr.addEventListener('load', loadHandler);
  return originalSend.call(this, body);
};

// Fetch도 후킹
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
  console.log('[TimeBox Injected] Fetch:', url);
  
  return originalFetch.apply(this, args).then(response => {
    if (url && url.includes('select_rqM0_F0')) {
      console.log('[TimeBox Injected] ✅✅✅ F0 API 감지 (Fetch)!');
      
      response.clone().text().then(text => {
        try {
          const json = JSON.parse(text);
          const courses = json.dlt_rsM0_F0;
          
          if (courses && Array.isArray(courses)) {
            console.log('[TimeBox Injected] ✅ ' + courses.length + '개 강의 추출');
            
            window.dispatchEvent(new CustomEvent('timeboxDataCaptured', {
              detail: {
                courses: courses,
                rawData: json,
                timestamp: new Date().toISOString()
              }
            }));
          }
        } catch (e) {
          console.error('[TimeBox Injected] 파싱 실패:', e);
        }
      });
    }
    
    return response;
  });
};

console.log('[TimeBox Injected] 🔥 Hook 설치 완료!');