import { createFileRoute, Navigate } from '@tanstack/react-router'
import { authService } from '@/lib/auth'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const user = authService.getStoredUser()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (user.role === 'developer') {
    return <Navigate to="/developer/dashboard" />
  }
  
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" />
  }
  
  return <Navigate to="/events" />
}
