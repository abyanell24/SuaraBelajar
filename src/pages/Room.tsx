import { useState, useEffect, useRef, type KeyboardEvent, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Phone, 
  Copy,
  Send,
  MessageSquare,
  X,
  Settings,
  ArrowLeft,
  UserPlus,
  Loader2
} from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'

interface Participant {
  id: string
  nickname: string
  isMuted: boolean
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
}

const DEMO_PARTICIPANTS: Participant[] = [
  { id: 'demo1', nickname: 'John 🇺🇸', isMuted: false },
  { id: 'demo2', nickname: 'Mas印尼', isMuted: false },
]

const DEMO_MESSAGES: ChatMessage[] = [
  { id: '1', senderId: 'demo1', senderName: 'John 🇺🇸', content: 'Hello! 👋' },
  { id: '2', senderId: 'demo2', senderName: 'Mas印尼', content: 'Hi all! Ready to practice?' },
]

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  
  const [isMuted, setIsMuted] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>(DEMO_PARTICIPANTS)
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [isInCall, setIsInCall] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }
  
  const joinCall = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsInCall(true)
      setIsLoading(false)
      toast.success('Joined voice chat!')
    }, 1500)
  }
  
  const leaveCall = () => {
    setIsInCall(false)
    toast.info('Left voice chat')
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    setMessages([...messages, {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage,
    }])
    setNewMessage('')
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`)
    toast.success('Link copied!')
  }

  return (
    <div className="h-screen flex bg-slate-900">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col hidden xl:flex">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Participants</h2>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {participants.length + (isInCall ? 1 : 0)}
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isInCall && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white">You</p>
                </div>
              </div>
              {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
            </div>
          )}
          
          {participants.filter(p => p.id !== 'me').map(p => (
            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {p.nickname.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-white">{p.nickname}</p>
                </div>
              </div>
              {p.isMuted && <MicOff className="w-4 h-4 text-slate-500" />}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700">
          <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white hover:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            Room Settings
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <Link to="/" className="p-2 hover:bg-slate-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-white font-semibold">English Free Talk</h1>
              <p className="text-xs text-slate-400">Room: {roomId?.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${isInCall ? 'bg-green-500' : 'bg-slate-600'} text-white`}>
              {isInCall ? 'In Call' : 'Not in call'}
            </Badge>
            <Button variant="outline" size="sm" onClick={copyRoomLink} className="border-slate-600 text-slate-300">
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowChat(!showChat)}
              className={`${showChat ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
              <p className="text-white">Connecting to voice chat...</p>
            </div>
          ) : !isInCall ? (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-700 rounded-full flex items-center justify-center">
                <Mic className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Ready to talk?</h2>
              <p className="text-slate-400 mb-6">Join voice chat to practice speaking</p>
              <Button onClick={joinCall} size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8">
                <Phone className="w-5 h-5 mr-2" />
                Join Voice Chat
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-16 h-16 text-white" />
              </div>
              <p className="text-white mb-6">You're in the call</p>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={toggleMute}
                  size="lg"
                  className={`w-16 h-16 rounded-full ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  } text-white`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                
                <Button
                  onClick={leaveCall}
                  size="lg"
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>
              
              <p className="text-slate-500 text-sm mt-4">
                {isMuted ? 'You are muted' : 'Microphone on'}
              </p>
            </div>
          )}
        </div>
      </main>

      {showChat && (
        <aside className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4">
            <h2 className="font-semibold text-white">Chat</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`text-sm ${msg.senderId === 'me' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[85%] p-2 rounded-lg ${
                  msg.senderId === 'me' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-700 text-white'
                }`}>
                  <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-slate-700">
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              <Button onClick={sendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}