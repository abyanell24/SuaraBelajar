import { useState, useEffect, useRef } from 'react'
import { User, Camera, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { authService, profileService } from '@/lib/supabaseService'
import { supabase } from '@/lib/supabase'

export default function ProfileEdit() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        window.location.href = '/login'
        return
      }
      setUser(currentUser)
      
      const userProfile = await profileService.getProfile(currentUser.id)
      setProfile(userProfile)
      setNickname(userProfile?.nickname || '')
      setBio(userProfile?.bio || '')
      setAvatarUrl(userProfile?.avatar_url || '')
    } catch (err) {
      console.error(err)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    
    try {
      await profileService.updateProfile(user.id, {
        nickname: nickname.trim(),
        bio: bio.trim() || null
      })
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    setUploading(true)
    try {
      const filePath = `avatars/${user.id}/${Date.now()}_${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      await profileService.updateProfile(user.id, { avatar_url: publicUrl })
      
      setAvatarUrl(publicUrl)
      toast.success('Photo updated!')
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadAvatar}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Nickname</label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Email</label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-white/5 border-white/10 text-slate-400"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !nickname.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  )
}