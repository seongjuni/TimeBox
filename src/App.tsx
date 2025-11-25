import { useMemo, useState } from 'react'

import './styles/global.css'
import Header from './components/Header'
import TopControls from './components/TopControls'
import CourseListPanel, { type Course, type DayKey } from './components/CourseListPanel'
import TimetablePanel from './components/TimetablePanel'
import RecommendationPanel from './components/RecommendationPanel'

const days = ['월', '화', '수', '목', '금', '토', '일']

const orderedDayKeys: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

type CourseHourRange = {
  startHour: number
  endHour: number
}

const DEFAULT_START_HOUR = 9
const DEFAULT_END_HOUR = 18

function timeStringToHour(time: string): number {
  const [h, m = '0'] = time.split(':')
  const hour = Number(h)
  const minute = Number(m)
  return hour + minute / 60
}

// JSON / 선택된 과목들에서 "전체 시간 범위" 계산 → periods 배열 생성용
function extractCourseHourRanges(courses: Course[]): CourseHourRange[] {
  const ranges: CourseHourRange[] = []

  courses.forEach((course) => {
    for (const day of orderedDayKeys) {
      const info = course.schedule[day]
      if (!info) continue

      const start = Math.floor(timeStringToHour(info.start))
      const end = Math.ceil(timeStringToHour(info.end))
      ranges.push({ startHour: start, endHour: end })
    }
  })

  return ranges
}

function getPeriodsFromCourses(courseHours: CourseHourRange[]): number[] {
  if (!courseHours.length) {
    return Array.from(
      { length: DEFAULT_END_HOUR - DEFAULT_START_HOUR + 1 },
      (_, i) => DEFAULT_START_HOUR + i
    )
  }

  const minHour = Math.min(
    DEFAULT_START_HOUR,
    ...courseHours.map((c) => c.startHour)
  )
  const maxHour = Math.max(
    DEFAULT_END_HOUR,
    ...courseHours.map((c) => c.endHour)
  )

  return Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i
  )
}

// 시간 충돌 체크 함수
function hasTimeConflict(selected: Course[], candidate: Course): boolean {
  for (const day of orderedDayKeys) {
    const candInfo = candidate.schedule[day]
    if (!candInfo) continue

    const candStart = timeStringToHour(candInfo.start)
    const candEnd = timeStringToHour(candInfo.end)

    for (const course of selected) {
      const existInfo = course.schedule[day]
      if (!existInfo) continue

      const existStart = timeStringToHour(existInfo.start)
      const existEnd = timeStringToHour(existInfo.end)

      // [start, end) 구간 겹침 여부
      if (candStart < existEnd && existStart < candEnd) {
        return true
      }
    }
  }
  return false
}

function App() {
  // JSON에서 불러온 전체 과목
  const [courses, setCourses] = useState<Course[]>([])

  // 사용자가 시간표에 추가한 과목
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])

  // 시간표 세로축 범위 계산용
  const [courseHours, setCourseHours] = useState<CourseHourRange[]>([])
  const periods = getPeriodsFromCourses(courseHours)

  const handleLoadJson = (jsonData: unknown) => {
  if (!Array.isArray(jsonData)) {
    alert('과목 목록 JSON 형식이 아닙니다.')
    return
  }

  const typed = jsonData as Course[]

  setCourses(typed)
  setSelectedCourses([])
  setCourseHours(extractCourseHourRanges(typed))
}


  const handleAddCourse = (course: Course) => {
    if (hasTimeConflict(selectedCourses, course)) {
      alert('이미 선택된 과목과 시간이 겹칩니다.')
      return
    }
    setSelectedCourses((prev) => [...prev, course])
  }

  const summary = useMemo(
    () => ({
      totalCourses: courses.length,
      selectedCount: selectedCourses.length,
      totalCredits: selectedCourses.reduce((sum, c) => sum + c.credit, 0),
    }),
    [courses, selectedCourses]
  )

  return (
    <div className="app">
      {/* 상단 헤더 */}
      <Header />

      {/* 상단 컨트롤 영역 */}
      <TopControls
        onLoadJson={handleLoadJson}
        totalCourses={summary.totalCourses}
        selectedCount={summary.selectedCount}
        totalCredits={summary.totalCredits}
      />

      {/* 메인 좌우 레이아웃 */}
      <main className="main-layout">
        <CourseListPanel
          courses={courses}
          onAddCourse={handleAddCourse}
        />
        <TimetablePanel
          days={days}
          periods={periods}
          selectedCourses={selectedCourses}
        />
      </main>

      {/* 하단: 추천 과목 */}
      <RecommendationPanel />
    </div>
  )
}

export default App
