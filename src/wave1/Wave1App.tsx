import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Wave1Landing from './Wave1Landing'
import Wave1Room from './Wave1Room'
import Wave1Call from './Wave1Call'

const Wave1App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wave1Landing />} />
        <Route path="/room/:id" element={<Wave1Room />} />
        <Route path="/call" element={<Wave1Call />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Wave1App
