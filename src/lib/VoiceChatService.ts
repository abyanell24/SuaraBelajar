import { SignalingClient } from './signaling/SignalingClient'

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
  private client: SignalingClient | null = null
  private roomId: string = ''
  private participantId: string = ''
  private nickname: string = ''
  private muted: boolean = false
  private localStream: MediaStream | null = null
  
  private onConnectionStateCb?: Callback<ConnectionState>
  private onParticipantsCb?: Callback<RoomParticipant[]>
  private onChatMessageCb?: Callback<ChatMessage>
  private onErrorCb?: Callback<string>

  async joinRoom(roomId: string, nickname: string): Promise<void> {
    this.roomId = roomId
    this.nickname = nickname
    this.muted = false
    
    this.onConnectionStateCb?.('connecting')
    
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      console.log('Microphone access granted')
      
      this.client = new SignalingClient()
      
      this.client.onConnected(() => {
        console.log('Connected to signaling')
      })
      
      this.client.onRoomJoined((roomId: string, participantId: string) => {
        this.participantId = participantId
        this.onConnectionStateCb?.('connected')
      })
      
      this.client.onParticipantJoined((participant: { participantId: string; nickname: string }) => {
        console.log('Participant joined:', participant.nickname)
      })
      
      this.client.onChatMessage((message: { id: string; senderId: string; senderName: string; content: string; timestamp: Date }) => {
        this.onChatMessageCb?.(message)
      })
      
      this.client.onError((error: string) => {
        this.onErrorCb?.(error)
      })
      
      await this.client.connect()
      this.client.joinRoom(roomId, nickname)
      
    } catch (error) {
      console.error('Failed to join room:', error)
      this.onConnectionStateCb?.('disconnected')
      this.onErrorCb?.('Failed to join room')
    }
  }

  async leaveRoom(): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    if (this.client) {
      this.client.leaveRoom()
      this.client.disconnect()
      this.client = null
    }
    this.onConnectionStateCb?.('disconnected')
  }

  async toggleMute(): Promise<boolean> {
    this.muted = !this.muted
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.muted
      })
    }
    console.log('Muted:', this.muted)
    return this.muted
  }

  sendChatMessage(content: string): void {
    if (!this.client || !this.participantId) return
    
    this.client.sendChatMessage({
      id: Date.now().toString(),
      senderId: this.participantId,
      senderName: this.nickname,
      content,
      timestamp: Date.now()
    })
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