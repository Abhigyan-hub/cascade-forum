import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Registration } from '@/lib/types'
import { format } from 'date-fns'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export const Route = createFileRoute('/my-registrations')({
  component: MyRegistrationsPage,
})

function MyRegistrationsPage() {
  const { data: registrations, isLoading } = useQuery<Registration[]>({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const response = await api.get('/registrations/my-registrations')
      return response.data
    },
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">My Registrations</h1>
          
          {isLoading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : registrations && registrations.length > 0 ? (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <div key={registration.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        {registration.event_title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-text-muted mb-4">
                        <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          registration.status === 'accepted' ? 'status-accepted' :
                          registration.status === 'rejected' ? 'status-rejected' :
                          'status-pending'
                        }`}>
                          {getStatusIcon(registration.status)}
                          <span className="capitalize">{registration.status}</span>
                        </span>
                        <span>Registered: {format(new Date(registration.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      {registration.payment_status === 'pending' && (
                        <a
                          href={`/payments/${registration.id}`}
                          className="inline-block mt-2 px-4 py-2 btn-accent"
                        >
                          Complete Payment
                        </a>
                      )}
                      
                      {registration.payment_status === 'completed' && (
                        <span className="inline-block mt-2 px-4 py-2 status-accepted rounded-md">
                          Payment Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">No registrations yet</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
