import { Navigate } from '@tanstack/react-router'
import { authService } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'client' | 'admin' | 'developer'
}

export function ProtectedRoute({ children, requiredRole = 'client' }: ProtectedRouteProps) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />
  }

  const user = authService.getStoredUser()
  
  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
