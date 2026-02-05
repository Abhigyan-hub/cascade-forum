import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { User } from '@/lib/auth'
import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/developer/users')({
  component: DeveloperUsersPage,
})

function DeveloperUsersPage() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['developer-users'],
    queryFn: async () => {
      const response = await api.get('/developer/users')
      return response.data
    },
  })

  return (
    <ProtectedRoute requiredRole="developer">
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">All Users</h1>

          {isLoading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : users && users.length > 0 ? (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-[#1A1A1E]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#1A1A1E]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'developer' ? 'bg-primary/20 text-primary border border-primary/30' :
                          user.role === 'admin' ? 'bg-primary-light/20 text-primary-light border border-primary-light/30' :
                          'bg-[#2A2A2E] text-text-muted'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'status-accepted' : 'status-rejected'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to="/developer/users/$userId"
                          params={{ userId: user.id }}
                          className="text-primary hover:text-primary-light transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">No users found</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
