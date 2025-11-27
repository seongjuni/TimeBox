// src/components/TimetablePanel.tsx
import React, { useState } from 'react'
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

type TimetableBlock = {
  id: string
  course: Course
  startHourCell: number
  endHourCell: number // 예: 9~12면 12
}

/**
 * 특정 요일(dayLabel)에 대해 연속된 수업을 하나의 블록으로 만든다.
 */
function buildDayBlocks(
  courses: Course[],
  dayLabel: string,
  periods: number[]
): TimetableBlock[] {
  const dayKey = labelToDayKey[dayLabel]
  if (!dayKey || periods.length === 0) return []

  const minPeriod = periods[0]
  const maxPeriod = periods[periods.length - 1]

  const blocks: TimetableBlock[] = []

  courses.forEach((course) => {
    const info = course.schedule[dayKey]
    if (!info) return

    const startFloat = timeStringToHour(info.start)
    const endFloat = timeStringToHour(info.end)

    const rawStart = Math.floor(startFloat)
    const rawEnd = Math.ceil(endFloat)

    // periods 범위로 클램핑
    const startCell = Math.max(rawStart, minPeriod)
    const endCell = Math.min(rawEnd, maxPeriod)

    if (startCell >= endCell) return

    blocks.push({
      id: `${course.courseName}-${course.section}-${dayLabel}`,
      course,
      startHourCell: startCell,
      endHourCell: endCell,
    })
  })

  return blocks
}

const TimetablePanel: React.FC<TimetablePanelProps> = ({
  days,
  periods,
  selectedCourses,
}) => {
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)

  return (
    <section className="panel right-panel">
      <div className="panel-header">
        <h2>나의 시간표</h2>
      </div>

      <div className="panel-body timetable-wrapper">
        <div className="timetable">
          {/* ───── 1. 헤더 줄 (요일) ───── */}
          <div
            className="time-cell day-cell header-cell timetable-header-empty"
            style={{ gridRow: 1, gridColumn: 1 }}
          />

          {days.map((day, dayIndex) => (
            <div
              key={day}
              className="day-cell header-cell"
              style={{ gridRow: 1, gridColumn: dayIndex + 2 }}
            >
              {day}
            </div>
          ))}

          {/* ───── 2. 왼쪽 시간 라벨 ───── */}
          {periods.map((hour, rowIndex) => (
            <div
              key={`time-${hour}`}
              className="time-cell"
              style={{ gridRow: rowIndex + 2, gridColumn: 1 }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}

          {/* ───── 3. 배경 격자 셀 ───── */}
          {periods.map((hour, rowIndex) =>
            days.map((day, dayIndex) => (
              <div
                key={`cell-${day}-${hour}`}
                className="slot-cell"
                style={{
                  gridRow: rowIndex + 2,
                  gridColumn: dayIndex + 2,
                  borderRight:
                    dayIndex === days.length - 1
                      ? 'none'
                      : '1px solid #e5e7eb',
                }}
              />
            ))
          )}

          {/* ───── 4. 실제 수업 블록 (클릭 가능한 버튼) ───── */}
          {days.map((day, dayIndex) => {
            const blocks = buildDayBlocks(selectedCourses, day, periods)

            return blocks.map((block) => {
              const startIndex = periods.indexOf(block.startHourCell)
              const endIndex = periods.indexOf(block.endHourCell)

              if (startIndex === -1 || endIndex === -1) return null

              const rowStart = startIndex + 2 // 1은 헤더, 2부터 시간
              const rowEnd = endIndex + 2

              return (
                <button
                  type="button"
                  key={block.id}
                  className="course-block"
                  style={{
                    gridColumn: dayIndex + 2,
                    gridRowStart: rowStart,
                    gridRowEnd: rowEnd,
                  }}
                  onClick={() => setActiveCourse(block.course)}
                >
                  <div className="course-block-title">
                    {block.course.courseName}
                  </div>
                  <div className="course-block-meta">
                    {block.course.professor} · {block.course.credit}학점
                  </div>
                </button>
              )
            })
          })}
        </div>

        {/* ───── 5. 아래쪽 정보창 ───── */}
        {activeCourse && (
          <div className="course-info-panel">
            <div className="course-info-header">
              <div>
                <div className="course-info-title">
                  {activeCourse.courseName}
                </div>
                <div className="course-info-meta">
                  {activeCourse.professor} · {activeCourse.credit}학점 · 분반{' '}
                  {activeCourse.section}
                </div>
              </div>
              <button
                type="button"
                className="course-info-close-button"
                onClick={() => setActiveCourse(null)}
              >
                닫기
              </button>
            </div>

            <div className="course-info-schedule">
              {days.map((label) => {
                const dayKey = labelToDayKey[label]
                const info = activeCourse.schedule[dayKey]
                if (!info) return null
                return (
                  <div key={label}>
                    {label} {info.start} ~ {info.end}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="timetable-hint">
          왼쪽에서 과목을 선택하면 이 격자에 색깔 블록으로 표시됩니다.
        </div>
      </div>
    </section>
  )
}

export default TimetablePanel
