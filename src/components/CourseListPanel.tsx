import '../styles/courseList.css'

const CourseListPanel: React.FC = () => {
  return (
    <section className="panel left-panel">
      <div className="panel-header">
        <h2>과목 목록</h2>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="과목명 / 교수명 검색" />
        <select className="select">
          <option>요일 전체</option>
          <option>월</option>
          <option>화</option>
          <option>수</option>
          <option>목</option>
          <option>금</option>
          <option>토</option>
          <option>일</option>
        </select>
        <select className="select">
          <option>구분 전체</option>
          <option>전공</option>
          <option>교양</option>
        </select>
        <label className="checkbox-label">
          <input type="checkbox" />
          <span>시간표와 안 겹치는 과목만</span>
        </label>
      </div>

      <div className="panel-body course-list">
        {/* 더미 카드들 */}
        <div className="course-item placeholder">
          <div className="course-main">
            <div className="course-title">예시) 자료구조</div>
            <div className="course-meta">CSE101 · 홍길동 교수 · 3학점</div>
            <div className="course-time">월 3–4교시 · 수 3–4교시</div>
          </div>
          <button className="primary-button small">시간표에 추가</button>
        </div>

        <div className="course-item placeholder">
          <div className="course-main">
            <div className="course-title">예시) 공학수학</div>
            <div className="course-meta">MAT201 · 김철수 교수 · 3학점</div>
            <div className="course-time">화 1–3교시</div>
          </div>
          <button className="primary-button small">시간표에 추가</button>
        </div>

        <div className="empty-hint">
          실제 데이터가 들어오면 이 영역에 과목 리스트가 표시됩니다.
        </div>
      </div>
    </section>
  )
}

export default CourseListPanel
