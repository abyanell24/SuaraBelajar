import { useState, useEffect, type FormEvent } from 'react'
import { Search, Users, Plus, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService, roomService, profileService } from '@/lib/supabaseService'

const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { id: 'jp', name: 'Japanese', flag: '🇯🇵' },
  { id: 'kr', name: 'Korean', flag: '🇰🇷' },
  { id: 'cn', name: 'Chinese', flag: '🇨🇳' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
]

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

interface Room {
  id: string
  name: string
  language: string
  level: string
  description: string
  created_by: string
  nickname?: string
  participant_count?: number
}

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    fetchRooms()
  }, [selectedLanguage, selectedLevel])

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      if (currentUser) {
        const userProfile = await profileService.getProfile(currentUser.id)
        setProfile(userProfile)
      }
    } catch (err) {
      setUser(null)
    }
  }

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const language = selectedLanguage === 'en' ? undefined : selectedLanguage
      const data = await roomService.getRooms(language)
      setRooms(data || [])
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       room.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = selectedLanguage === 'en' || room.language === selectedLanguage
    const matchesLevel = selectedLevel === 'All' || room.level === selectedLevel
    return matchesSearch && matchesLanguage && matchesLevel
  })

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error('Please login to create a room')
      navigate('/login')
      return
    }

    const roomName = `${selectedLanguage.toUpperCase()} Free Talk`
    const roomDescription = 'Join us to practice speaking!'

    try {
      const newRoom = await roomService.createRoom(
        roomName,
        roomDescription,
        selectedLanguage,
        selectedLevel === 'All' ? 'Beginner' : selectedLevel,
        user.id
      )
      toast.success('Room created!')
      navigate(`/room/${newRoom.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room')
    }
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setProfile(null)
      toast.success('Signed out')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SuaraBelajar</h1>
              <p className="text-xs text-slate-400">Language Practice Community</p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/profile')} 
                className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white"
              >
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{profile?.nickname || user.email?.split('@')[0]}</span>
              </button>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Daftar
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Button onClick={handleCreateRoom} className="bg-blue-500 hover:bg-blue-600 w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create Room
        </Button>

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
            </button>
          ))}
        </div>

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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Rooms</h2>
            <span className="text-sm text-slate-400">{filteredRooms.length} rooms</span>
          </div>

          {loading ? (
            <Card className="p-8 bg-white/5 border-white/10 text-center">
              <p className="text-slate-400">Loading...</p>
            </Card>
          ) : filteredRooms.length === 0 ? (
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
                    <p className="text-sm text-slate-400">{room.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.participant_count || 0}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            Practice speaking. Make friends. Learn together.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Free forever • Browser-based
          </p>
        </div>
      </footer>
    </div>
  )
}