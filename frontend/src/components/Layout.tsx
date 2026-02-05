import { Link, useNavigate } from '@tanstack/react-router'
import { authService } from '@/lib/auth'
import { LogOut, User } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const user = authService.getStoredUser()

  const handleLogout = () => {
    authService.logout()
    navigate({ to: '/login' })
  }

  const getNavLinks = () => {
    if (!user) return []
    
    if (user.role === 'developer') {
      return [
        { to: '/developer/dashboard', label: 'Dashboard' },
        { to: '/developer/users', label: 'Users' },
        { to: '/developer/events', label: 'Events' },
        { to: '/developer/registrations', label: 'Registrations' },
        { to: '/developer/payments', label: 'Payments' },
        { to: '/developer/audit-logs', label: 'Audit Logs' },
      ]
    }
    
    if (user.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/events', label: 'My Events' },
      ]
    }
    
    return [
      { to: '/events', label: 'Events' },
      { to: '/my-registrations', label: 'My Registrations' },
      { to: '/my-payments', label: 'My Payments' },
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-[#1A1A1E] border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                Cascade Forum
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                    activeProps={{ className: 'text-primary border-b-2 border-primary' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <User className="w-4 h-4" />
                <span>{user?.full_name}</span>
                <span className="text-text-muted/70">({user?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-text-muted hover:text-accent-error transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
