import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Landing from './pages/Landing'
import Room from './pages/Room'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileEdit from './pages/ProfileEdit'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProfileEdit />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  )
}

export default App
