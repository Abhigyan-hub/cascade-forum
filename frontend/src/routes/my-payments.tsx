import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Payment } from '@/lib/types'
import { format } from 'date-fns'

export const Route = createFileRoute('/my-payments')({
  component: MyPaymentsPage,
})

function MyPaymentsPage() {
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ['my-payments'],
    queryFn: async () => {
      const response = await api.get('/payments/my-payments')
      return response.data
    },
  })

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">My Payments</h1>
          
          {isLoading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : payments && payments.length > 0 ? (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-[#1A1A1E]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#1A1A1E]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {payment.razorpay_order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'paid' ? 'status-accepted' :
                          payment.status === 'failed' ? 'status-rejected' :
                          'status-pending'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                        {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">No payments yet</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
