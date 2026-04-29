import { useState, type FormEvent } from 'react'
import { Search, Users, Plus, Globe, Mic, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇬🇧', count: 225 },
  { id: 'id', name: 'Indonesian', flag: '🇮🇩', count: 58 },
  { id: 'jp', name: 'Japanese', flag: '🇯🇵', count: 12 },
  { id: 'kr', name: 'Korean', flag: '🇰🇷', count: 8 },
  { id: 'cn', name: 'Chinese', flag: '🇨🇳', count: 15 },
  { id: 'es', name: 'Spanish', flag: '🇪🇸', count: 9 },
]

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

interface Room {
  id: string
  name: string
  language: string
  level: string
  participants: number
  topic: string
}

const ACTIVE_ROOMS: Room[] = [
  { id: '1', name: 'English Free Talk', language: 'en', level: 'All', participants: 5, topic: 'Free conversation' },
  { id: '2', name: 'Bahasa Indonesia', language: 'id', level: 'Beginner', participants: 3, topic: 'Latihan bahasa' },
  { id: '3', name: 'Japan Coffee Chat', language: 'jp', level: 'Intermediate', participants: 4, topic: 'Casual talk' },
  { id: '4', name: 'K-Drama Discussion', language: 'kr', level: 'All', participants: 2, topic: 'Korean dramas' },
  { id: '5', name: 'Chinese Learners', language: 'cn', level: 'Beginner', participants: 6, topic: 'Mandarin practice' },
]

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const navigate = useNavigate()

  const filteredRooms = ACTIVE_ROOMS.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       room.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = selectedLanguage === 'all' || room.language === selectedLanguage
    const matchesLevel = selectedLevel === 'All' || room.level === selectedLevel
    return matchesSearch && matchesLanguage && matchesLevel
  })

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 10)
    navigate(`/room/${roomId}`)
    toast.success('Room created!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SuaraBelajar</h1>
              <p className="text-xs text-slate-400">Language Practice Community</p>
            </div>
          </div>
          <Button 
            onClick={createRoom}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {}
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all ${
                selectedLanguage === lang.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
              <span className="text-xs opacity-70">({lang.count})</span>
            </button>
          ))}
        </div>

        {}
        <div className="flex gap-2">
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedLevel === level
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Rooms</h2>
            <span className="text-sm text-slate-400">{filteredRooms.length} rooms</span>
          </div>

          {filteredRooms.length === 0 ? (
            <Card className="p-8 bg-white/5 border-white/10 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No active rooms found</p>
              <p className="text-sm text-slate-500 mt-1">Be the first to create one!</p>
            </Card>
          ) : (
            filteredRooms.map(room => (
              <button
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {room.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        room.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        room.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {room.level}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{room.topic}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.participants}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      {}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            🎤 Practice speaking. Make friends. Learn together.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            No signup required • Free forever • Browser-based
          </p>
        </div>
      </footer>
    </div>
  )
}