import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Event, Registration } from '@/lib/types'
import { format } from 'date-fns'
import { useState } from 'react'
import { authService } from '@/lib/auth'

export const Route = createFileRoute('/events/$eventId')({
  component: EventDetailsPage,
})

function EventDetailsPage() {
  const { eventId } = Route.useParams()
  const navigate = useNavigate()
  const user = authService.getStoredUser()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [error, setError] = useState('')

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      // Try public endpoint first, fallback to authenticated endpoint
      try {
        const response = await api.get(`/events/public/${eventId}`)
        return response.data
      } catch (error: any) {
        // If public endpoint fails (404 or other), try authenticated endpoint
        if (user) {
          try {
            const response = await api.get(`/events/${eventId}`)
            return response.data
          } catch (authError) {
            throw error // Throw original error if auth also fails
          }
        }
        throw error
      }
    },
  })

  const { data: existingRegistration } = useQuery<Registration>({
    queryKey: ['registration', eventId],
    queryFn: async () => {
      const response = await api.get('/registrations/my-registrations')
      return response.data.find((r: Registration) => r.event_id === eventId)
    },
    enabled: !!user && user.role === 'client',
  })

  const registerMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await api.post('/registrations', {
        event_id: eventId,
        form_data: data,
      })
      return response.data
    },
    onSuccess: () => {
      navigate({ to: '/my-registrations' })
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Registration failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!event?.form_schema) {
      registerMutation.mutate({})
      return
    }
    registerMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!event) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">Event not found</div>
        </Layout>
      </ProtectedRoute>
    )
  }

  const canRegister = user?.role === 'client' && 
    event.status === 'published' && 
    !existingRegistration &&
    new Date(event.registration_deadline) > new Date()

  // For public viewing, show a simpler layout
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <Link to="/" className="flex items-center text-xl font-bold text-blue-600">
                Cascade Forum
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : event ? (
            <>
              <h1 className="text-3xl font-bold text-text-primary mb-4">{event.title}</h1>
              <div className="card p-6 mb-6">
                <p className="text-text-primary mb-4">{event.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-text-muted">Event Date:</span>
                    <p className="font-medium text-text-primary">{format(new Date(event.event_date), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-muted">Registration Deadline:</span>
                    <p className="font-medium text-text-primary">{format(new Date(event.registration_deadline), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  {event.is_paid && (
                    <div>
                      <span className="text-sm text-text-muted">Price:</span>
                      <p className="font-medium text-text-primary">₹{event.price}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-text-muted">Participants:</span>
                    <p className="font-medium text-text-primary">{event.current_participants} / {event.max_participants || '∞'}</p>
                  </div>
                </div>
                <div className="bg-accent/20 border border-accent/30 rounded-md p-4">
                  <p className="text-accent mb-2">
                    <strong>Login required to register</strong>
                  </p>
                  <button
                    onClick={() => navigate({ to: '/login' })}
                    className="px-4 py-2 btn-primary"
                  >
                    Login to Register
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-text-muted">Event not found</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary mb-4">{event.title}</h1>
            
            <div className="card p-6 mb-6">
              <p className="text-text-primary mb-4">{event.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-text-muted">Event Date:</span>
                  <p className="font-medium text-text-primary">{format(new Date(event.event_date), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <span className="text-sm text-text-muted">Registration Deadline:</span>
                  <p className="font-medium text-text-primary">{format(new Date(event.registration_deadline), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {event.is_paid && (
                  <div>
                    <span className="text-sm text-text-muted">Price:</span>
                    <p className="font-medium text-text-primary">₹{event.price}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-text-muted">Participants:</span>
                  <p className="font-medium text-text-primary">{event.current_participants} / {event.max_participants || '∞'}</p>
                </div>
              </div>

              {existingRegistration && (
                <div className={`rounded-md p-4 mb-4 ${
                  existingRegistration.status === 'accepted' ? 'status-accepted' :
                  existingRegistration.status === 'rejected' ? 'status-rejected' :
                  'status-pending'
                }`}>
                  <p className="text-text-primary">
                    <strong>Registration Status:</strong> <span className="capitalize">{existingRegistration.status}</span>
                  </p>
                  {existingRegistration.payment_status === 'pending' && event.is_paid && (
                    <a
                      href={`/payments/${existingRegistration.id}`}
                      className="mt-2 inline-block text-accent hover:text-accent/80 transition-colors"
                    >
                      Complete Payment →
                    </a>
                  )}
                </div>
              )}

              {canRegister && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {event.form_schema && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-text-primary">Registration Form</h3>
                      {Object.entries(event.form_schema).map(([key, field]: [string, any]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-text-primary mb-1">
                            {field.label || key}
                            {field.required && <span className="text-accent-error">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              required={field.required}
                              value={formData[key] || ''}
                              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                              className="input w-full"
                              rows={4}
                            />
                          ) : (
                            <input
                              type={field.type || 'text'}
                              required={field.required}
                              value={formData[key] || ''}
                              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                              className="input w-full"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-accent-error/20 border border-accent-error/30 text-accent-error px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full btn-accent disabled:opacity-50"
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register for Event'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
