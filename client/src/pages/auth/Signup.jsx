import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/auth.api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, CreditCard } from 'lucide-react'

export default function Signup() {
  const navigate   = useNavigate()
  const { setUser } = useAuth()

  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.signup(form)
      setUser(res.data.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-canvas border border-hairline-strong rounded-md shadow-sm">
            <CreditCard className="h-6 w-6 text-ink" />
          </div>
          <h1 className="text-[32px] font-bold text-ink tracking-tight">PayDash</h1>
          <p className="text-slate text-sm font-medium">Payment Analytics Platform</p>
        </div>

        <Card className="bg-canvas border-hairline shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-[24px] text-ink tracking-tight font-bold">Create account</CardTitle>
            <CardDescription className="text-slate text-[15px]">
              Start tracking your payments
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="flex items-center gap-2 p-3 bg-cardTint-rose border border-semantic-error/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-semantic-error shrink-0" />
                  <p className="text-semantic-error text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-ink font-medium text-[14px]">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="bg-canvas border-hairline-strong text-ink placeholder:text-stone/60
                             focus-visible:border-primary focus-visible:ring-0 rounded-md h-[44px] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-ink font-medium text-[14px]">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="bg-canvas border-hairline-strong text-ink placeholder:text-stone/60
                             focus-visible:border-primary focus-visible:ring-0 rounded-md h-[44px] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-ink font-medium text-[14px]">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="bg-canvas border-hairline-strong text-ink placeholder:text-stone/60
                             focus-visible:border-primary focus-visible:ring-0 rounded-md h-[44px] transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-canvas hover:bg-surface border border-hairline-strong text-ink h-[44px] rounded-md font-bold text-[15px] shadow-sm transition-all"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</>
                  : 'Create account'
                }
              </Button>

            </form>

            <p className="mt-8 text-center text-[14px] text-charcoal font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-ink hover:underline font-bold">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
