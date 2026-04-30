import { Room, LocalAudioTrack, createLocalAudioTrack } from 'livekit-client'

export interface RoomParticipant {
  id: string
  nickname: string
  isMuted: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected'

type Callback<T> = (data: T) => void

class VoiceChatService {
  private room: Room | null = null
  private localTrack: LocalAudioTrack | null = null
  private roomId: string = ''
  private nickname: string = ''
  private muted: boolean = false
  
  private onConnectionStateCb?: Callback<ConnectionState>
  private onParticipantsCb?: Callback<RoomParticipant[]>
  private onChatMessageCb?: Callback<ChatMessage>
  private onErrorCb?: Callback<string>

  async joinRoom(roomId: string, nickname: string): Promise<void> {
    this.roomId = roomId
    this.nickname = nickname
    
    this.onConnectionStateCb?.('connecting')
    
    try {
      const token = await this.getTokenFromServer(roomId, nickname)
      if (!token) throw new Error('Failed to get token')
      
      const room = new Room()
      const url = import.meta.env.VITE_LIVEKIT_URL
      
      await room.connect(url, token)
      
      this.room = room
      
      const track = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
      })
      this.localTrack = track
      
      await room.localParticipant.publishTrack(track)
      
      this.onConnectionStateCb?.('connected')
      console.log('Connected to LiveKit')
      
    } catch (error) {
      console.error('Failed to join:', error)
      this.onConnectionStateCb?.('disconnected')
      this.onErrorCb?.('Failed to join voice room')
    }
  }

  private async getTokenFromServer(roomId: string, nickname: string): Promise<string> {
    const apiKey = import.meta.env.VITE_LIVEKIT_API_KEY
    const apiSecret = import.meta.env.VITE_LIVEKIT_SECRET
    
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 3600
    
    const payload = {
      sub: `${nickname}_${now}`,
      name: nickname,
      iss: apiKey,
      room: roomId,
      exp: exp,
      aagg: { canPublish: true, canSubscribe: true }
    }
    
    const enc = new TextEncoder() 
    const header = { alg: 'HS256', typ: 'JWT' }
    
    const headerStr = btoa(JSON.stringify(header))
    const payloadStr = btoa(JSON.stringify(payload))
    const signInput = `${headerStr}.${payloadStr}`
    
    const keyData = enc.encode(apiSecret)
    const messageData = enc.encode(signInput)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const sigStr = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    
    return `${headerStr}.${payloadStr}.${sigStr}`
  }

  sendChatMessage(content: string): void {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: this.nickname,
      content,
      timestamp: new Date()
    }
    this.onChatMessageCb?.(msg)
  }

  async toggleMute(): Promise<boolean> {
    this.muted = !this.muted
    
    if (this.localTrack) {
      if (this.muted) {
        this.localTrack.stop()
      } else {
        this.localTrack = await createLocalAudioTrack()
        if (this.room) {
          await this.room.localParticipant.publishTrack(this.localTrack)
        }
      }
    }
    
    return this.muted
  }

  async leaveRoom(): Promise<void> {
    if (this.localTrack) {
      this.localTrack.stop()
      this.localTrack = null
    }
    
    if (this.room) {
      await this.room.disconnect()
      this.room = null
    }
    
    this.onConnectionStateCb?.('disconnected')
  }

  onConnectionState(callback: Callback<ConnectionState>): void {
    this.onConnectionStateCb = callback
  }

  onParticipants(callback: Callback<RoomParticipant[]>): void {
    this.onParticipantsCb = callback
  }

  onChatMessage(callback: Callback<ChatMessage>): void {
    this.onChatMessageCb = callback
  }

  onError(callback: Callback<string>): void {
    this.onErrorCb = callback
  }
}

export const voiceChatService = new VoiceChatService()