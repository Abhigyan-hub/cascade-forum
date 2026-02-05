import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authService } from '@/lib/auth'

export const Route = createFileRoute('/register')({
  component: Register,
})

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.register(formData.email, formData.password, formData.fullName)
      navigate({ to: '/login' })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 card">
        <div>
          <h2 className="text-3xl font-bold text-center bg-gradient-purple bg-clip-text text-transparent">Cascade Forum</h2>
          <p className="mt-2 text-center text-text-muted">Create your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-accent-error/20 border border-accent-error/30 text-accent-error px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-text-primary">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input mt-1 block w-full"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 btn-accent disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:text-primary-light transition-colors">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
