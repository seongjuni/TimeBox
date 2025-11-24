import '../styles/topControls.css'

const TopControls: React.FC = () => {
  return (
    <section className="top-controls">
      <div className="upload-area">
        <label className="upload-label">
          수강 목록 JSON 불러오기
          <input type="file" className="upload-input" />
        </label>
        <span className="upload-hint">
          크롬 확장프로그램에서 받은 JSON 파일을 업로드하세요.
        </span>
      </div>
      <div className="summary-box">
        <div>
          불러온 과목: <strong>0개</strong>
        </div>
        <div>
          선택된 과목: <strong>0개</strong>
        </div>
        <div>
          총 학점: <strong>0 학점</strong>
        </div>
      </div>
    </section>
  )
}

export default TopControls