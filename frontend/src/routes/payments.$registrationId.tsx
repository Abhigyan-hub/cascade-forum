import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/payments/$registrationId')({
  component: PaymentPage,
})

declare global {
  interface Window {
    Razorpay: any
  }
}

function PaymentPage() {
  const { registrationId } = Route.useParams()
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const { data: orderData } = useQuery({
    queryKey: ['payment-order', registrationId],
    queryFn: async () => {
      const response = await api.post('/payments/create-order', {
        registration_id: registrationId,
      })
      return response.data
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async (data: { order_id: string; payment_id: string; signature: string }) => {
      const response = await api.post('/payments/verify', data)
      return response.data
    },
  })

  const handlePayment = () => {
    if (!razorpayLoaded || !window.Razorpay || !orderData) return

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100, // Convert to paise
      currency: orderData.currency,
      name: 'Cascade Forum',
      description: 'Event Registration Payment',
      order_id: orderData.order_id,
      handler: async function (response: any) {
        await verifyMutation.mutateAsync({
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        })
        window.location.href = '/my-registrations'
      },
      prefill: {
        name: 'User',
        email: 'user@example.com',
      },
      theme: {
        color: '#7B2CBF',
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary mb-6">Complete Payment</h1>

            <div className="card p-6">
              {orderData ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-text-muted">Amount:</span>
                    <p className="text-2xl font-bold text-text-primary">₹{orderData.amount}</p>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={!razorpayLoaded || verifyMutation.isPending}
                    className="w-full py-3 px-4 btn-accent disabled:opacity-50"
                  >
                    {!razorpayLoaded ? 'Loading payment gateway...' : 'Pay with Razorpay'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">Loading payment details...</div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
