import '../styles/header.css'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h1>TimeBox for 수강신청</h1>
        <p className="subtitle">
          수강신청 목록을 불러와 내 시간표와 안 겹치는 과목을 추천해주는 도구
        </p>
      </div>
      <div className="header-right">
        <button className="ghost-button">도움말</button>
      </div>
    </header>
  )
}

export default Header