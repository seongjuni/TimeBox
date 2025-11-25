// src/components/TimetablePanel.tsx
import '../styles/timetable.css'
import type { Course, DayKey } from './CourseListPanel'

interface TimetablePanelProps {
  days: string[]
  periods: number[]
  selectedCourses: Course[]
}

const labelToDayKey: Record<string, DayKey> = {
  '월': 'mon',
  '화': 'tue',
  '수': 'wed',
  '목': 'thu',
  '금': 'fri',
  '토': 'sat',
  '일': 'sun',
}

function timeStringToHour(time: string): number {
  const [h, m = '0'] = time.split(':')
  const hour = Number(h)
  const minute = Number(m)
  return hour + minute / 60
}

function getCoursesForCell(courses: Course[], dayLabel: string, hour: number): Course[] {
  const dayKey = labelToDayKey[dayLabel]
  if (!dayKey) return []

  return courses.filter((course) => {
    const info = course.schedule[dayKey]
    if (!info) return false

    const start = timeStringToHour(info.start)
    const end = timeStringToHour(info.end)

    return hour >= Math.floor(start) && hour < Math.ceil(end)
  })
}

const TimetablePanel: React.FC<TimetablePanelProps> = ({
  days,
  periods,
  selectedCourses,
}) => {
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
              <div className="time-cell">
                {String(hour).padStart(2, '0')}:00
              </div>

              {days.map((day) => {
                const cellCourses = getCoursesForCell(selectedCourses, day, hour)
                return (
                  <div key={day + hour} className="slot-cell">
                    {cellCourses.map((course) => (
                      <div
                        key={`${course.courseName}-${course.section}`}
                        className="course-block"
                      >
                        <div className="course-block-title">
                          {course.courseName}
                        </div>
                        <div className="course-block-meta">
                          {course.professor} · {course.credit}학점
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="timetable-hint">
          왼쪽에서 과목을 선택하면 이 격자에 색깔 블록으로 표시됩니다.
        </div>
      </div>
    </section>
  )
}

export default TimetablePanel