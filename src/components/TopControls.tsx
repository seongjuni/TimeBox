import type { ChangeEvent } from 'react'
import '../styles/topControls.css'

interface Props {
  onLoadJson: (data: any) => void
}

const TopControls: React.FC<Props> = ({ onLoadJson }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result
        if (typeof text !== 'string') {
          alert('파일을 읽는 중 오류가 발생했습니다.')
          return
        }

        const json = JSON.parse(text)
        onLoadJson(json)
      } catch (err) {
        console.error(err)
        alert('JSON 파일 형식이 잘못되었습니다.')
      }
    }

    reader.readAsText(file)
  }

  return (
    <section className="top-controls">
      <div className="upload-area">
        <label className="upload-label">
          수강 목록 JSON 불러오기
          <input
            type="file"
            className="upload-input"
            accept=".json,application/json"
            onChange={handleFileChange}
          />
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