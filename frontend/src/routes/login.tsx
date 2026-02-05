import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authService } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login(email, password)
      const user = authService.getStoredUser()
      
      if (user?.role === 'developer') {
        navigate({ to: '/developer/dashboard' })
      } else if (user?.role === 'admin') {
        navigate({ to: '/admin/dashboard' })
      } else {
        navigate({ to: '/events' })
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 card">
        <div>
          <h2 className="text-3xl font-bold text-center bg-gradient-purple bg-clip-text text-transparent">Cascade Forum</h2>
          <p className="mt-2 text-center text-text-muted">Sign in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-accent-error/20 border border-accent-error/30 text-accent-error px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1 block w-full"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 btn-primary disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <a href="/register" className="text-primary hover:text-primary-light transition-colors">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
