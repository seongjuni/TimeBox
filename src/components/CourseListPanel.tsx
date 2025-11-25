import type { FC } from 'react'
import '../styles/courseList.css'

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

interface DaySchedule {
  start: string // "13:00"
  end: string   // "15:00"
}

interface Schedule {
  mon?: DaySchedule
  tue?: DaySchedule
  wed?: DaySchedule
  thu?: DaySchedule
  fri?: DaySchedule
  sat?: DaySchedule
  sun?: DaySchedule
}

interface Course {
  department: string
  grade: string
  courseName: string
  section: string
  category: string
  credit: number
  classType: string
  schedule: Schedule
  professor: string
}

interface CourseListPanelProps {
  courses?: Course[] // props 안 넘겨도 일단 안 터지게 optional
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

// schedule 객체 → "월 13:00~15:00, 화 13:00~15:00, ..." 문자열로 변환
function formatSchedule(schedule: Schedule): string {
  const parts: string[] = []

  for (const key of orderedDayKeys) {
    const info = schedule[key]
    if (!info) continue
    parts.push(`${dayLabelMap[key]} ${info.start}~${info.end}`)
  }

  if (parts.length === 0) return '시간 정보 없음'
  return parts.join(', ')
}

const CourseListPanel: FC<CourseListPanelProps> = ({ courses }) => {
  const list = courses ?? []

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
        {list.length === 0 ? (
          <>
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
          </>
        ) : (
          <>
            {list.map((course, idx) => (
              <div key={idx} className="course-item">
                <div className="course-main">
                  <div className="course-title">{course.courseName}</div>
                  <div className="course-meta">
                    {course.department} · {course.professor} · {course.credit}학점
                  </div>
                  <div className="course-time">
                    {formatSchedule(course.schedule)}
                  </div>
                </div>
                <button className="primary-button small">
                  시간표에 추가
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}

export default CourseListPanel