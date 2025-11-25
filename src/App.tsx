import { useState } from 'react'

import './styles/global.css'
import Header from './components/Header'
import TopControls from './components/TopControls'
import CourseListPanel from './components/CourseListPanel'
import TimetablePanel from './components/TimetablePanel'
import RecommendationPanel from './components/RecommendationPanel'

const days = ['월', '화', '수', '목', '금', '토', '일']

type CourseHourRange = {
  startHour: number
  endHour: number
}

const DEFAULT_START_HOUR = 9
const DEFAULT_END_HOUR = 18

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

function App() {
  const [courseHours, setCourseHours] = useState<CourseHourRange[]>([])
  const periods = getPeriodsFromCourses(courseHours)

  const [courses, setCourses] = useState([])
  const handleLoadJson = (jsonData: any) => {
    setCourses(jsonData)
  }
  
  return (
    <div className="app">
      {/* 상단 헤더 */}
      <Header />

      {/* 상단 컨트롤 영역 */}
      <TopControls onLoadJson={handleLoadJson} />

      {/* 메인 좌우 레이아웃 */}
      <main className="main-layout">
        <CourseListPanel courses={courses} />
        <TimetablePanel days={days} periods={periods} />
      </main>

      {/* 하단: 추천 과목 */}
      <RecommendationPanel />
    </div>
  )
}

export default App
