// src/components/TimetablePanel.tsx
import '../styles/timetable.css'

interface TimetablePanelProps {
  days: string[]
  periods: number[] // ← 숫자 배열로 변경
}

const TimetablePanel: React.FC<TimetablePanelProps> = ({ days, periods }) => {
  return (
    <section className="panel right-panel">
      <div className="panel-header">
        <h2>나의 시간표</h2>
      </div>

      <div className="panel-body timetable-wrapper">
        <div className="timetable">
          <div className="timetable-row header-row">
            <div className="time-cell" />
            {days.map((day) => (
              <div key={day} className="day-cell header-cell">
                {day}
              </div>
            ))}
          </div>

          {periods.map((hour) => (
            <div key={hour} className="timetable-row">
              {/* 출력은 09, 10, 11… 두 자리 숫자로 */}
              <div className="time-cell">{String(hour).padStart(2, '0')}</div>

              {days.map((day) => (
                <div key={day + hour} className="slot-cell">
                  {/* 나중에 과목 블록 들어가는 자리 */}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="timetable-hint">
          왼쪽에서 과목을 선택하면 이 시간표에 색깔 블록으로 표시될 예정입니다.
        </div>
      </div>
    </section>
  )
}

export default TimetablePanel