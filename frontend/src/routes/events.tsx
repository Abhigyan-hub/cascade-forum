import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { Calendar, DollarSign, Users } from 'lucide-react'

export const Route = createFileRoute('/events')({
  component: EventsPage,
})

function EventsPage() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events?status=published')
      return response.data
    },
  })

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Events</h1>
          
          {isLoading ? (
            <div className="text-center py-12 text-text-muted">Loading events...</div>
          ) : events && events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">No events available</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

function EventCard({ event }: { event: Event }) {
  return (
    <div className="card p-6 hover:border-primary/50 transition-colors">
      <h2 className="text-xl font-semibold text-text-primary mb-2">{event.title}</h2>
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
      
      <a
        href={`/events/${event.id}`}
        className="block w-full text-center py-2 px-4 btn-primary"
      >
        View Details
      </a>
    </div>
  )
}
