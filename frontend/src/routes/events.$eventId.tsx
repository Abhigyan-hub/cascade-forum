import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
      const response = await api.get(`/events/${eventId}`)
      return response.data
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <p className="text-gray-700 mb-4">{event.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Event Date:</span>
                  <p className="font-medium">{format(new Date(event.event_date), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Registration Deadline:</span>
                  <p className="font-medium">{format(new Date(event.registration_deadline), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {event.is_paid && (
                  <div>
                    <span className="text-sm text-gray-600">Price:</span>
                    <p className="font-medium">₹{event.price}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Participants:</span>
                  <p className="font-medium">{event.current_participants} / {event.max_participants || '∞'}</p>
                </div>
              </div>

              {existingRegistration && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <p className="text-blue-800">
                    <strong>Registration Status:</strong> {existingRegistration.status}
                  </p>
                  {existingRegistration.payment_status === 'pending' && event.is_paid && (
                    <a
                      href={`/payments/${existingRegistration.id}`}
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800"
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
                      <h3 className="text-lg font-semibold">Registration Form</h3>
                      {Object.entries(event.form_schema).map(([key, field]: [string, any]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label || key}
                            {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              required={field.required}
                              value={formData[key] || ''}
                              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              rows={4}
                            />
                          ) : (
                            <input
                              type={field.type || 'text'}
                              required={field.required}
                              value={formData[key] || ''}
                              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
