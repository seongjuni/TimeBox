import { type FC, useState } from 'react'
import '../styles/courseList.css'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DaySchedule {
  start: string
  end: string
}

export interface Schedule {
  mon?: DaySchedule
  tue?: DaySchedule
  wed?: DaySchedule
  thu?: DaySchedule
  fri?: DaySchedule
  sat?: DaySchedule
  sun?: DaySchedule
}

export interface Course {
  department: string
  grade: string
  courseName: string
  section: string
  category: string       // 여기 안에 "전공", "교양" 같은 값이 들어온다고 가정
  credit: number
  classType: string
  schedule: Schedule
  professor: string
}

interface CourseListPanelProps {
  courses?: Course[]
  selectedCourses?: Course[]
  onAddCourse?: (course: Course) => void
  onRemoveCourse?: (course: Course) => void
}

const dayLabelMap: Record<DayKey, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
}

const orderedDayKeys: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function formatSchedule(schedule: Schedule): string {
  const parts: string[] = []

  for (const key of orderedDayKeys) {
    const info = schedule[key]
    if (!info) continue
    parts.push(`${dayLabelMap[key]} ${info.start}~${info.end}`)
  }

  if (parts.length === 0) return '시간 정보 없음'
  return parts.join(' · ')
}

function isSameCourse(a: Course, b: Course): boolean {
  return a.courseName === b.courseName && a.section === b.section
}

const CourseListPanel: FC<CourseListPanelProps> = ({
  courses,
  selectedCourses,
  onAddCourse,
  onRemoveCourse,
}) => {
  const list = courses ?? []
  const selected = selectedCourses ?? []

  // 🔹 요일 멀티 선택
  const [selectedDays, setSelectedDays] = useState<DayKey[]>([])
  // 🔹 전공/교양 필터
  const [categoryFilter, setCategoryFilter] =
    useState<'all' | 'major' | 'liberal'>('all')

  const toggleDay = (dayKey: DayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    )
  }

  const resetDays = () => setSelectedDays([])

  // 🔹 실제 필터 적용
  const filteredList = list.filter((course) => {
    // 1) 요일 필터
    if (selectedDays.length > 0) {
      const hasSelectedDay = selectedDays.some((dayKey) => !!course.schedule[dayKey])
      if (!hasSelectedDay) return false
    }

    // 2) 전공 / 교양 필터
    if (categoryFilter === 'major') {
      // category 값에 '전공' 이 포함된 경우만
      if (!course.category.includes('전공')) return false
    } else if (categoryFilter === 'liberal') {
      // category 값에 '교양' 이 포함된 경우만
      if (!course.category.includes('교양')) return false
    }

    return true
  })

  return (
    <section className="panel left-panel">
      <div className="panel-header">
        <h2>과목 목록</h2>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="과목명 / 교수명 검색" />

        {/* 요일 멀티 선택 */}
        <div className="day-filter-group">
          <button
            type="button"
            className={selectedDays.length === 0 ? 'day-pill active' : 'day-pill'}
            onClick={resetDays}
          >
            요일 전체
          </button>
          {orderedDayKeys.map((key) => (
            <button
              key={key}
              type="button"
              className={
                selectedDays.includes(key) ? 'day-pill active' : 'day-pill'
              }
              onClick={() => toggleDay(key)}
            >
              {dayLabelMap[key]}
            </button>
          ))}
        </div>

        {/* 🔹 전공 / 교양 셀렉트 (실제 필터랑 연결) */}
        <select
          className="select"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as 'all' | 'major' | 'liberal')
          }
        >
          <option value="all">구분 전체</option>
          <option value="major">전공</option>
          <option value="liberal">교양</option>
        </select>

        <label className="checkbox-label">
          <input type="checkbox" />
          <span>시간표와 안 겹치는 과목만</span>
        </label>
      </div>

      <div className="panel-body course-list">
        {filteredList.length === 0 ? (
          <div className="empty-hint">
            선택한 조건에 해당하는 과목이 없습니다.
          </div>
        ) : (
          <>
            {filteredList.map((course, idx) => {
              const alreadySelected = selected.some((c) => isSameCourse(c, course))

              return (
                <div
                  key={idx}
                  className={alreadySelected ? 'course-item selected' : 'course-item'}
                >
                  <div className="course-main">
                    <div className="course-title">{course.courseName}</div>
                    <div className="course-meta">
                      {course.department} · {course.professor} · {course.credit}학점
                    </div>
                    <div className="course-time">
                      {formatSchedule(course.schedule)}
                    </div>
                  </div>

                  {alreadySelected ? (
                    <button
                      className="primary-button small"
                      onClick={() => onRemoveCourse?.(course)}
                    >
                      빼기
                    </button>
                  ) : (
                    <button
                      className="primary-button small"
                      onClick={() => onAddCourse?.(course)}
                    >
                      시간표에 추가
                    </button>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </section>
  )
}

export default CourseListPanel
