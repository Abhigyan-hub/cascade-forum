import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { Calendar, DollarSign, Users, LogIn, UserPlus } from 'lucide-react'
import { authService } from '@/lib/auth'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const user = authService.getStoredUser()
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['public-events'],
    queryFn: async () => {
      try {
        // Use public endpoint that doesn't require authentication
        const response = await api.get('/events/public')
        return response.data
      } catch (error) {
        // If it fails, return empty array
        console.error('Failed to fetch events:', error)
        return []
      }
    },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-[#1A1A1E] border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                Cascade Forum
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-text-muted">{user.full_name}</span>
                  {user.role === 'developer' && (
                    <Link
                      to="/developer/dashboard"
                      className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'client' && (
                    <>
                      <Link
                        to="/events"
                        className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                      >
                        Events
                      </Link>
                      <Link
                        to="/my-registrations"
                        className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                      >
                        My Registrations
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      authService.logout()
                      window.location.href = '/'
                    }}
                    className="px-4 py-2 text-sm font-medium text-text-muted hover:text-accent-error transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 btn-accent"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4 text-white">Welcome to Cascade Forum</h1>
          <p className="text-xl mb-8 text-white/90">Discover and register for exciting events</p>
          {!user && (
            <div className="flex space-x-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-accent text-background rounded-md font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 border-2 border-white text-white rounded-md font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Active Events</h2>
          {user && (
            <Link
              to="/events"
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              View All Events →
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-muted">Loading events...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card p-8">
            <p className="text-text-muted text-lg">No active events at the moment</p>
            <p className="text-text-muted/70 text-sm mt-2">Check back later for new events!</p>
          </div>
        )}

        {!user && (
          <div className="mt-12 text-center card p-8 border-primary/20">
            <h3 className="text-2xl font-semibold text-text-primary mb-4">
              Want to register for events?
            </h3>
            <p className="text-text-muted mb-6">
              Create an account to register for events and manage your registrations
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 btn-accent"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1E] border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-text-muted">
            <p>&copy; 2024 Cascade Forum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const user = authService.getStoredUser()
  const canViewDetails = user || true // Everyone can view details

  return (
    <div className="card p-6 hover:border-primary/50 transition-colors">
      <h3 className="text-xl font-semibold text-text-primary mb-2">{event.title}</h3>
      <p className="text-text-muted text-sm mb-4 line-clamp-3">{event.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-text-muted">
          <Calendar className="w-4 h-4 mr-2" />
          {format(new Date(event.event_date), 'MMM dd, yyyy HH:mm')}
        </div>
        {event.is_paid && (
          <div className="flex items-center text-sm text-text-muted">
            <DollarSign className="w-4 h-4 mr-2" />
            ₹{event.price}
          </div>
        )}
        <div className="flex items-center text-sm text-text-muted">
          <Users className="w-4 h-4 mr-2" />
          {event.current_participants} / {event.max_participants || '∞'} participants
        </div>
      </div>
      
      {canViewDetails ? (
        <Link
          to="/events/$eventId"
          params={{ eventId: event.id as string }}
          className="block w-full text-center py-2 px-4 btn-primary"
        >
          View Details
        </Link>
      ) : (
        <Link
          to="/login"
          className="block w-full text-center py-2 px-4 bg-[#2A2A2E] text-text-primary rounded-md hover:bg-[#3A3A3E] transition-colors"
        >
          Login to View
        </Link>
      )}
    </div>
  )
}
