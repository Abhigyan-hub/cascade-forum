/**
 * Shared TypeScript types
 */

export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  registration_deadline: string
  is_paid: boolean
  price: number
  max_participants: number | null
  current_participants: number
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  created_by: string
  creator_name: string | null
  form_schema: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  event_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'rejected'
  form_data: Record<string, any>
  payment_status: 'not_required' | 'pending' | 'completed' | 'failed' | 'refunded'
  payment_order_id: string | null
  payment_id: string | null
  event_title: string | null
  user_name: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  registration_id: string
  razorpay_order_id: string
  razorpay_payment_id: string | null
  amount: number
  currency: string
  status: 'created' | 'paid' | 'failed' | 'refunded'
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  admin_name: string | null
  action_type: string
  target_type: string
  target_id: string
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
