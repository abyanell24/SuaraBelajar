import { useEffect, useState, type FormEvent } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/lib/supabaseService'
import { toast } from 'sonner'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  // Redirect to Landing if already logged in
  useEffect(() => {
    let mounted = true
    authService.getCurrentUser()
      .then((user) => {
        if (user && mounted) {
          navigate('/')
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await authService.signUp(email, password)
      toast.success('Signup successful! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error('Signup failed. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="pt-6 pb-0 px-6">
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-2">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full">Sign up</Button>
          </form>
        </CardContent>
        <CardFooter className="items-center justify-between px-6 pb-6">
          <span className="text-sm text-muted-foreground">Have an account?</span>
          <Link to="/login" className="text-sm text-primary hover:underline">Log in</Link>
        </CardFooter>
      </Card>
    </div>
  )
}
