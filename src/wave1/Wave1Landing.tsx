import React from 'react'
import { useNavigate } from 'react-router-dom'

const Wave1Landing: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div style={{padding: 20}}>
      <header aria-label="Wave1 Header">
        <h1>SuaraBelajar Wave1 Skeleton</h1>
      </header>
      <main>
        <h2 data-testid="landing-title">SuaraBelajar Wave1</h2>
        <button data-testid="landing-enter" onClick={() => navigate('/room/1')}>Enter</button>
      </main>
    </div>
  )
}

export default Wave1Landing
