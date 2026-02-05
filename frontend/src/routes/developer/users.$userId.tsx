import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { User } from '@/lib/auth'
import { Registration, Payment } from '@/lib/types'
import { format } from 'date-fns'

export const Route = createFileRoute('/developer/users/$userId')({
  component: UserDetailsPage,
})

function UserDetailsPage() {
  const { userId } = Route.useParams()

  const { data: user } = useQuery<User>({
    queryKey: ['developer-user', userId],
    queryFn: async () => {
      const response = await api.get(`/developer/users/${userId}`)
      return response.data
    },
  })

  const { data: registrations } = useQuery<Registration[]>({
    queryKey: ['user-registrations', userId],
    queryFn: async () => {
      const response = await api.get(`/developer/users/${userId}/registrations`)
      return response.data
    },
  })

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ['user-payments', userId],
    queryFn: async () => {
      const response = await api.get(`/developer/users/${userId}/payments`)
      return response.data
    },
  })

  if (!user) {
    return (
      <ProtectedRoute requiredRole="developer">
        <Layout>
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="developer">
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">User Details</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{user.full_name}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Role:</span>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <p className="font-medium">{user.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Created:</span>
                <p className="font-medium">{format(new Date(user.created_at), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Registrations ({registrations?.length || 0})</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                {registrations && registrations.length > 0 ? (
                  <div className="space-y-4">
                    {registrations.map((reg) => (
                      <div key={reg.id} className="border-b pb-4 last:border-0">
                        <p className="font-medium">{reg.event_title}</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className="capitalize">{reg.status}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(reg.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No registrations</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Payments ({payments?.length || 0})</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                {payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border-b pb-4 last:border-0">
                        <p className="font-medium">₹{payment.amount}</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className="capitalize">{payment.status}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No payments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
