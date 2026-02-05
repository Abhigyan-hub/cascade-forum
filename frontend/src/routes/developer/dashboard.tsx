import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/developer/dashboard')({
  component: DeveloperDashboard,
})

function DeveloperDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['developer-stats'],
    queryFn: async () => {
      const [users, events, registrations, payments] = await Promise.all([
        api.get('/developer/users?limit=1').then(r => ({ total: r.data.length })),
        api.get('/developer/events?limit=1').then(r => ({ total: r.data.length })),
        api.get('/developer/registrations?limit=1').then(r => ({ total: r.data.length })),
        api.get('/developer/payments?limit=1').then(r => ({ total: r.data.length })),
      ])
      return { users, events, registrations, payments }
    },
  })

  return (
    <ProtectedRoute requiredRole="developer">
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Developer Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.users?.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.events?.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Registrations</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.registrations?.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.payments?.total || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer Dashboard</h3>
              <p className="text-sm text-gray-600">System overview and statistics</p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
