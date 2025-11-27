import { useMemo, useState, useEffect } from 'react'

import './styles/global.css'
import Header from './components/Header'
import TopControls from './components/TopControls'
import CourseListPanel, {
  type Course,
  type DayKey,
} from './components/CourseListPanel'

import RecommendationPanel from './components/RecommendationPanel';

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

// 과목 동일성 비교 (과목명 + 분반 기준)
function isSameCourse(a: Course, b: Course): boolean {
  return a.courseName === b.courseName && a.section === b.section
}

function App() {
  // JSON에서 불러온 전체 과목
  const [courses, setCourses] = useState<Course[]>([])

  // 사용자가 시간표에 추가한 과목
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])

  // ⬇ selectedCourses 기준으로 시간 범위 계산
  const courseHours = useMemo(
    () => extractCourseHourRanges(selectedCourses),
    [selectedCourses]
  )

  const periods = useMemo(
    () => getPeriodsFromCourses(courseHours),
    [courseHours]
  )

  const handleLoadJson = (jsonData: unknown) => {
    if (!Array.isArray(jsonData)) {
      alert('과목 목록 JSON 형식이 아닙니다.')
      return
    }

    const typed = jsonData as Course[]

    setCourses(typed)
    setSelectedCourses([]) // 새로 불러왔으니 선택 초기화
  }

  // ★ URL 해시(#data=...)에서 JSON 자동 읽기
  useEffect(() => {
    const hash = window.location.hash
    const prefix = '#data='

    if (!hash.startsWith(prefix)) return

    try {
      const encoded = hash.slice(prefix.length)
      const jsonStr = decodeURIComponent(encoded)
      const data = JSON.parse(jsonStr)

      handleLoadJson(data)
    } catch (err) {
      console.error(err)
      alert('URL에서 과목 데이터를 읽는 중 오류가 발생했습니다.')
    }
  }, [])

  const handleAddCourse = (course: Course) => {
    if (hasTimeConflict(selectedCourses, course)) {
      alert('이미 선택된 과목과 시간이 겹칩니다.')
      return
    }

    setSelectedCourses((prev) => {
      // 중복 추가 방지
      if (prev.some((c) => isSameCourse(c, course))) return prev
      return [...prev, course]
    })
  }

  const handleRemoveCourse = (course: Course) => {
    setSelectedCourses((prev) =>
      prev.filter((c) => !isSameCourse(c, course))
    )
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
      <Header />

      <TopControls
        onLoadJson={handleLoadJson}
        totalCourses={summary.totalCourses}
        selectedCount={summary.selectedCount}
        totalCredits={summary.totalCredits}
      />

      <main className="main-layout">
        <CourseListPanel
          courses={courses}
          selectedCourses={selectedCourses}
          onAddCourse={handleAddCourse}
          onRemoveCourse={handleRemoveCourse}
        />
        <TimetablePanel
          days={days}
          periods={periods}
          selectedCourses={selectedCourses}
        />
      </main>

      {/* <RecommendationPanel /> */}
    </div>
  )
}

export default App
