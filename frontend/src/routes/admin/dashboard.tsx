import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Event } from '@/lib/types'
import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const response = await api.get('/admin/events/my-events')
      return response.data
    },
  })

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Link
              to="/admin/events/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{events?.length || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Published Events</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {events?.filter(e => e.status === 'published').length || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Registrations</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {events?.reduce((sum, e) => sum + e.current_participants, 0) || 0}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Events</h2>
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : events && events.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to="/admin/events/$eventId/registrations"
                            params={{ eventId: event.id as string }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {event.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === 'published' ? 'bg-green-100 text-green-800' :
                            event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.current_participants} / {event.max_participants || '∞'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to="/admin/events/$eventId/registrations"
                            params={{ eventId: event.id as string }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Registrations
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No events created yet</div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
