import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Registration } from '@/lib/types'
import { format } from 'date-fns'
import { CheckCircle, XCircle } from 'lucide-react'

export const Route = createFileRoute('/admin/events/$eventId/registrations')({
  component: EventRegistrationsPage,
})

function EventRegistrationsPage() {
  const { eventId } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: registrations, isLoading } = useQuery<Registration[]>({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      const response = await api.get(`/admin/events/${eventId}/registrations`)
      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ registrationId, status }: { registrationId: string; status: string }) => {
      const response = await api.patch(`/admin/registrations/${registrationId}`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] })
    },
  })

  const handleStatusChange = (registrationId: string, status: 'accepted' | 'rejected') => {
    if (confirm(`Are you sure you want to ${status} this registration?`)) {
      updateMutation.mutate({ registrationId, status })
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Registrations</h1>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : registrations && registrations.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{registration.user_name}</div>
                        <div className="text-sm text-gray-500">
                          {Object.entries(registration.form_data).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          registration.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          registration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.payment_status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(registration.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {registration.status !== 'accepted' && (
                          <button
                            onClick={() => handleStatusChange(registration.id, 'accepted')}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            disabled={updateMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                        )}
                        {registration.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(registration.id, 'rejected')}
                            className="text-red-600 hover:text-red-800 flex items-center"
                            disabled={updateMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No registrations yet</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
