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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Registrations</h1>
          
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : registrations && registrations.length > 0 ? (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {registration.event_title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(registration.status)}
                          <span className="capitalize">{registration.status}</span>
                        </span>
                        <span>Registered: {format(new Date(registration.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      {registration.payment_status === 'pending' && (
                        <a
                          href={`/payments/${registration.id}`}
                          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Complete Payment
                        </a>
                      )}
                      
                      {registration.payment_status === 'completed' && (
                        <span className="inline-block mt-2 px-4 py-2 bg-green-100 text-green-800 rounded-md">
                          Payment Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No registrations yet</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
