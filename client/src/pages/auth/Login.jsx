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
          <div className="p-2 bg-primary rounded-[8px] shadow-sm">
            <CreditCard className="h-6 w-6 text-onPrimary" />
          </div>
          <h1 className="text-[28px] font-semibold text-ink tracking-tight">PayDash</h1>
          <p className="text-slate text-sm">Payment Analytics Platform</p>
        </div>

        <Card className="bg-canvas border-hairline shadow-sm rounded-[12px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-ink tracking-tight font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-slate">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-cardTint-rose border border-semantic-error/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-semantic-error shrink-0" />
                  <p className="text-semantic-error text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-charcoal font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="bg-canvas border-hairline-strong text-ink placeholder:text-stone
                             focus-visible:border-primary focus-visible:ring-primary rounded-md h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-charcoal font-medium">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="bg-canvas border-hairline-strong text-ink placeholder:text-stone
                             focus-visible:border-primary focus-visible:ring-primary rounded-md h-[44px]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-pressed text-onPrimary h-[44px] rounded-[8px] font-medium"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</>
                  : 'Sign in'
                }
              </Button>

            </form>

            {/* Quick login hints for demo */}
            <div className="mt-4 p-3 bg-surface border border-hairline rounded-[8px] space-y-1">
              <p className="text-stone text-[11px] font-semibold uppercase tracking-widest mb-2">Demo accounts</p>
              <p className="text-slate text-xs font-medium">Admin: admin@example.com / 123456</p>
              <p className="text-slate text-xs font-medium">User: arjun@example.com / 123456</p>
            </div>

            <p className="mt-6 text-center text-sm text-slate">
              No account?{' '}
              <Link to="/signup" className="text-link hover:text-link-pressed font-medium">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
