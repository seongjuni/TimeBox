import './styles/App.css'
import Header from './components/Header'
import TopControls from './components/TopControls'
import CourseListPanel from './components/CourseListPanel'
import TimetablePanel from './components/TimetablePanel'
import RecommendationPanel from './components/RecommendationPanel'

const days = ['월', '화', '수', '목', '금', '토', '일']
const periods = [1, 2, 3, 4, 5, 6, 7, 8]

function App() {
  return (
    <div className="app">
      {/* 상단 헤더 */}
      <Header />

      {/* 상단 컨트롤 영역 */}
      <TopControls />

      {/* 메인 좌우 레이아웃 */}
      <main className="main-layout">
        <CourseListPanel />
        <TimetablePanel days={days} periods={periods} />
      </main>

      {/* 하단: 추천 과목 */}
      <RecommendationPanel />
    </div>
  )
}

export default App
