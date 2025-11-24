import '../styles/recommendation.css'

const RecommendationPanel: React.FC = () => {
  return (
    <section className="bottom-panel">
      <div className="panel bottom-panel-inner">
        <div className="panel-header">
          <h2>빈 시간에 들을 수 있는 과목 추천</h2>
          <div className="bottom-filters">
            <select className="select small">
              <option>전체 요일</option>
              <option>월/수/금 위주</option>
              <option>화/목 위주</option>
            </select>
            <select className="select small">
              <option>시간대 전체</option>
              <option>아침 (1–3교시)</option>
              <option>오후 (4–7교시)</option>
            </select>
          </div>
        </div>
        <div className="panel-body recommendation-list">
          <div className="course-item placeholder">
            <div className="course-main">
              <div className="course-title">예시) 영어 회화</div>
              <div className="course-meta">
                ENG105 · 이영희 교수 · 2학점
              </div>
              <div className="course-time">
                금 2–3교시 · 현재 시간표와 충돌 없음
              </div>
            </div>
            <button className="secondary-button small">추가</button>
          </div>
          <div className="empty-hint">
            선택된 시간표를 기준으로, 겹치지 않는 과목이 여기 추천 리스트에 표시됩니다.
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecommendationPanel