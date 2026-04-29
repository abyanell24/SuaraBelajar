import React from 'react'
import { useParams } from 'react-router-dom'

const Wave1Room: React.FC = () => {
  const { id } = useParams()
  return (
    <div style={{padding: 20}}>
      <h2 data-testid="room-title">Wave1 Room {id}</h2>
      <button data-testid="start-call-btn" onClick={() => window.location.href = '/wave1/call'}>Start Call</button>
    </div>
  )
}

export default Wave1Room
