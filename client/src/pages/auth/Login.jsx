import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, CreditCard } from 'lucide-react'

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-canvas border border-hairline-strong rounded-md shadow-sm">
            <CreditCard className="h-6 w-6 text-ink" />
          </div>
          <h1 className="text-[32px] font-bold text-ink tracking-tight">PayDash</h1>
          <p className="text-slate text-sm font-medium">Payment Analytics Platform</p>
        </div>

        <Card className="bg-canvas border-hairline shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-[24px] text-ink tracking-tight font-bold">Welcome back</CardTitle>
            <CardDescription className="text-slate text-[15px]">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-cardTint-rose border border-semantic-error/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-semantic-error shrink-0" />
                  <p className="text-semantic-error text-sm font-medium">{error}</p>
                </div>
              )}

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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
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
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</>
                  : 'Sign in'
                }
              </Button>

            </form>

            {/* Quick login hints for demo */}
            <div className="mt-6 p-4 bg-surface-soft border border-hairline rounded-md space-y-2">
              <p className="text-stone text-[11px] font-bold uppercase tracking-[0.1em]">Demo accounts</p>
              <div className="space-y-1">
                <p className="text-charcoal text-[13px] font-medium">Admin: <span className="text-ink font-semibold">admin@example.com / 123456</span></p>
                <p className="text-charcoal text-[13px] font-medium">User: <span className="text-ink font-semibold">arjun@example.com / 123456</span></p>
              </div>
            </div>

            <p className="mt-8 text-center text-[14px] text-charcoal font-medium">
              No account?{' '}
              <Link to="/signup" className="text-ink hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
