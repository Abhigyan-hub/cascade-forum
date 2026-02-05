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
          <h1 className="text-3xl font-bold text-text-primary mb-6">Developer Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-sm font-medium text-text-muted">Total Users</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">{stats?.users?.total || 0}</p>
            </div>
            <div className="card p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-sm font-medium text-text-muted">Total Events</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">{stats?.events?.total || 0}</p>
            </div>
            <div className="card p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-sm font-medium text-text-muted">Total Registrations</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">{stats?.registrations?.total || 0}</p>
            </div>
            <div className="card p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-sm font-medium text-text-muted">Total Payments</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">{stats?.payments?.total || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Developer Dashboard</h3>
              <p className="text-sm text-text-muted">System overview and statistics</p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
