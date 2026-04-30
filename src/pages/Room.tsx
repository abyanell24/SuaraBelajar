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
  Loader2,
  Edit2,
  Users
} from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { voiceChatService, type ChatMessage, type ConnectionState, type RoomParticipant } from '@/lib/VoiceChatService'
import { roomService, messageService, authService, profileService } from '@/lib/supabaseService'

interface RoomDetails {
  id: string
  name: string
  description: string
  language: string
  level: string
  created_by: string
  nickname?: string
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showParticipants, setShowParticipants] = useState(false)
  const [participants, setParticipants] = useState<RoomParticipant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isInCall, setIsInCall] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [savingRoom, setSavingRoom] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    authService.getCurrentUser()
      .then(setCurrentUser)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!roomId) return
    
    messageService.getMessages(roomId)
      .then(async (msgs) => {
        if (msgs && msgs.length > 0) {
          const senderIds = [...new Set(msgs.map((m: any) => m.sender_id))]
          const senderNames: Record<string, string> = {}
          
          for (const id of senderIds) {
            try {
              const profile = await profileService.getProfile(id)
              senderNames[id] = profile?.nickname || 'User'
            } catch {
              senderNames[id] = 'User'
            }
          }
          
          const formatted = msgs.map((m: any) => ({
            id: m.id,
            senderId: m.sender_id,
            senderName: senderNames[m.sender_id] || 'User',
            content: m.content,
            timestamp: new Date(m.created_at)
          }))
          setMessages(formatted)
        }
      })
      .catch(err => console.error('Failed to load messages:', err))
    
    const channel = messageService.subscribeToMessages(roomId, (msg: any) => {
      console.log('New message received:', msg)
      if (msg.sender_id === currentUser?.id) return
      
      const newMsg = {
        id: msg.id,
        senderId: msg.sender_id,
        senderName: 'User',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }
      console.log('Adding new message:', newMsg)
      
      // Force update
      const currentMessages = [...messages, newMsg]
      setMessages(currentMessages)
      
      // Force scroll to bottom
      setTimeout(() => {
        const container = document.querySelector('.overflow-y-auto')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }, 100)
    })
    
    return () => {
      channel.unsubscribe()
    }
  }, [roomId, currentUser])

  useEffect(() => {
    if (roomId) {
      roomService.getRoom(roomId)
        .then((room) => {
          console.log('Room data:', room)
          if (room) {
            roomService.getRoomCreatorName(room.created_by).then((nickname) => {
              setRoomDetails({ ...room, nickname: nickname || 'Anonymous' })
            })
          }
        })
        .catch(err => {
          console.error('Failed to load room:', err)
        })
    }
  }, [roomId])

  useEffect(() => {
    voiceChatService.onConnectionState((state) => {
      setConnectionState(state)
      setIsInCall(state === 'connected')
      setIsLoading(false)
    })

    voiceChatService.onChatMessage((message) => {
      setMessages(prev => [...prev, message])
    })

    voiceChatService.onParticipants((parts) => {
      setParticipants(parts)
    })

    voiceChatService.onError((error) => {
      toast.error(error)
      setIsLoading(false)
    })
  }, [])

  const toggleMute = async () => {
    const newMuted = await voiceChatService.toggleMute()
    setIsMuted(newMuted)
  }
  
  const joinCall = async () => {
    setIsLoading(true)
    try {
      const nickname = `User${Math.floor(Math.random() * 1000)}`
      await voiceChatService.joinRoom(roomId || 'default', nickname)
      toast.success('Joined room!')
    } catch (error) {
      toast.error('Failed to join')
      setIsLoading(false)
    }
  }
  
  const leaveCall = async () => {
    await voiceChatService.leaveRoom()
    setIsInCall(false)
    toast.info('Left room')
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    if (!currentUser) {
      toast.error('Please login to send message')
      navigate('/login')
      return
    }
    
    const content = newMessage
    voiceChatService.sendChatMessage(content)
    
    const localMsg = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: content,
      timestamp: new Date()
    }
    setMessages([...messages, localMsg])
    setNewMessage('')
    
    try {
      const userId = currentUser?.id
      if (!userId) {
        throw new Error('Not logged in')
      }
      await messageService.sendMessage(roomId || '', userId, content)
      console.log('Message saved, userId:', userId)
    } catch (err: any) {
      console.error('Failed to save message:', err?.message || err)
      toast.error('Failed to save message')
    }
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
      <aside className={`${showParticipants ? 'flex' : 'hidden'} xl:flex w-64 bg-slate-800 border-r border-slate-700 flex-col fixed xl:relative inset-y-0 left-0 z-20`}>
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

        <div className="p-4 border-t border-slate-700 space-y-2">
          {currentUser?.id === roomDetails?.created_by && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={async () => {
                try {
                  await roomService.updateRoomLastActive(roomId || '')
                  await messageService.cleanOldMessages(24)
                  await roomService.deleteInactiveRooms(30)
                  toast.success(`Room activity updated!`)
                } catch (err) {
                  toast.error('Failed')
                }
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clean & Delete Inactive
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white hover:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            Room Settings
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-2 sm:px-4">
          <div className="flex items-center space-x-3">
            <Link to="/" className="p-2 hover:bg-slate-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 bg-white/10 border-white/20 text-white text-sm"
                    placeholder="Room name"
                  />
                  <Input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="h-7 bg-white/10 border-white/20 text-white text-sm mt-1"
                    placeholder="Description"
                  />
<Button 
                    size="sm" 
                    onClick={async () => {
                      if (!editName.trim()) return
                      setSavingRoom(true)
                      try {
                        const newDesc = editDesc.trim()
                        await roomService.updateRoom(roomId || '', { 
                          name: editName.trim(), 
                          description: newDesc 
                        })
                        setRoomDetails({ ...roomDetails!, name: editName.trim(), description: newDesc })
                        setIsEditing(false)
                        toast.success('Room updated!')
                      } catch (err) {
                        toast.error('Failed to update')
                      } finally {
                        setSavingRoom(false)
                      }
                    }}
                    disabled={savingRoom}
                    className="h-7"
                  >
                    {savingRoom ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    className="h-7 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-white font-semibold">{roomDetails?.name || 'Loading...'}</h1>
                  {roomDetails?.description && (
                    <p className="text-xs text-slate-400">{roomDetails.description}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {roomDetails?.language?.toUpperCase()} • {roomDetails?.level} • {roomDetails?.nickname || 'Unknown'}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${
              connectionState === 'connected' ? 'bg-green-500' : 
              connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-slate-600'
            } text-white`}>
              {connectionState === 'connected' ? 'Connected' : 
               connectionState === 'connecting' ? 'Connecting...' : 'Not in call'}
            </Badge>
            {!isEditing && currentUser?.id === roomDetails?.created_by && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setEditName(roomDetails?.name || '')
                  setEditDesc(roomDetails?.description || '')
                  setIsEditing(true)
                }}
                className="text-slate-400"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={copyRoomLink} className="border-slate-600 text-slate-300">
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 md:hidden"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="w-5 h-5" />
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

        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
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
              <Button onClick={() => toast.info('Voice coming soon!')} size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8">
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
        <aside className="fixed xl:relative right-0 top-0 h-full w-full sm:w-80 bg-slate-800 border-l border-slate-700 flex flex-col z-30">
          <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4">
            <h2 className="font-semibold text-white">Chat</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="xl:hidden">
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