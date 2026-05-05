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
          <div className="p-2 bg-primary rounded-[8px] shadow-sm">
            <CreditCard className="h-6 w-6 text-onPrimary" />
          </div>
          <h1 className="text-[28px] font-semibold text-ink tracking-tight">PayDash</h1>
          <p className="text-slate text-sm">Payment Analytics Platform</p>
        </div>

        <Card className="bg-canvas border-hairline shadow-sm rounded-[12px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-ink tracking-tight font-semibold">Create account</CardTitle>
            <CardDescription className="text-slate">
              Start tracking your payments
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="flex items-center gap-2 p-3 bg-cardTint-rose border border-semantic-error/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-semantic-error shrink-0" />
                  <p className="text-semantic-error text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-charcoal font-medium">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="bg-canvas border-hairline-strong text-ink placeholder:text-stone
                             focus-visible:border-primary focus-visible:ring-primary rounded-md h-[44px]"
                />
              </div>

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
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</>
                  : 'Create account'
                }
              </Button>

            </form>

            <p className="mt-6 text-center text-sm text-slate">
              Already have an account?{' '}
              <Link to="/login" className="text-link hover:text-link-pressed font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
