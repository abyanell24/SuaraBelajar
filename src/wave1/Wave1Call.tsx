import React from 'react'

const Wave1Call: React.FC = () => {
  return (
    <div style={{padding: 20}}>
      <h2 data-testid="call-page-title">Wave1 Call</h2>
      <button data-testid="btn-mute">Mute</button>
      <button data-testid="btn-end-call">End Call</button>
    </div>
  )
}

export default Wave1Call
