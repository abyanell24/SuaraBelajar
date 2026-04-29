import { supabase } from './supabase'

export interface Profile {
  id: string
  nickname: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

class AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

class ProfileService {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async uploadAvatar(userId: string, file: File) {
    const filePath = `avatars/${userId}/${file.name}`
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    await this.updateProfile(userId, { avatar_url: publicUrl })
    
    return publicUrl
  }
}

class RoomService {
  async createRoom(name: string, description: string, language: string, level: string, createdBy: string) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name,
        description,
        language,
        level,
        created_by: createdBy
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getRooms(language?: string) {
    let query = supabase.from('rooms').select('*').order('created_at', { ascending: false })
    
    if (language) {
      query = query.eq('language', language)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getRoom(roomId: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    
    if (error) throw error
    return data
  }

  async getRoomCreatorName(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single()
    
    if (error) return null
    return data?.nickname
  }

  async updateRoom(roomId: string, updates: { name?: string; description?: string }) {
    const { data, error } = await supabase
      .from('rooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', roomId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateRoomLastActive(roomId: string) {
    const { error } = await supabase
      .from('rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId)
    
    if (error) throw error
  }

  async deleteRoom(roomId: string) {
    await supabase.from('messages').delete().eq('room_id', roomId)
    await supabase.from('room_participants').delete().eq('room_id', roomId)
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)
    if (error) throw error
  }

  async deleteInactiveRooms(hoursInactive: number = 30) {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hoursInactive)
    
    const { data, error } = await supabase
      .from('rooms')
      .select('id')
      .lt('updated_at', cutoff.toISOString())
    
    if (error) throw error
    
    for (const room of data || []) {
      await this.deleteRoom(room.id)
    }
  }
}

class MessageService {
  async sendMessage(roomId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: senderId,
        content
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getMessages(roomId: string, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  async cleanOldMessages(daysOld: number = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
    
    if (error) throw error
  }

  subscribeToMessages(roomId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => callback(payload.new))
      .subscribe()
  }
}

export const authService = new AuthService()
export const profileService = new ProfileService()
export const roomService = new RoomService()
export const messageService = new MessageService()