# Cascade Forum - Architecture Documentation

## System Overview

Cascade Forum is a production-ready web platform for managing college forum committee events with strict role-based access control, dynamic event registration forms, and integrated payment processing.

## Architecture Decisions

### Backend Architecture

**Framework Choice: FastAPI**
- High performance async/await support
- Automatic OpenAPI documentation
- Type hints and Pydantic validation
- Production-ready with Gunicorn + Uvicorn

**Database: PostgreSQL**
- ACID compliance for financial transactions
- JSONB support for dynamic form schemas
- Robust indexing for performance
- RDS-ready for AWS deployment

**Authentication: JWT**
- Stateless authentication
- Role embedded in token
- Backend-validated (frontend is not trusted)
- Secure token storage in localStorage (acceptable for this use case)

**RBAC Implementation**
- Three-tier role hierarchy: client < admin < developer
- Backend-enforced permissions at every endpoint
- Frontend route guards for UX (not security)
- Audit logging for all admin actions

### Frontend Architecture

**Framework: React + TypeScript**
- Type safety across the application
- Component-based architecture
- Modern React patterns (hooks, context)

**Routing: TanStack Router**
- Type-safe routing
- File-based route generation
- Built-in route guards
- Excellent developer experience

**State Management: TanStack Query**
- Server state management
- Automatic caching and refetching
- Optimistic updates support
- Built-in loading/error states

**UI: Tailwind CSS**
- Utility-first CSS framework
- Responsive design out of the box
- Easy to customize
- Ready for Shadcn UI components if needed

## Database Schema Design

### Core Tables

1. **users**
   - Stores all user accounts
   - Role-based access (client, admin, developer)
   - Soft delete via is_active flag

2. **events**
   - Event information
   - Dynamic form schema stored as JSONB
   - Creator tracking for admin isolation

3. **registrations**
   - User event registrations
   - Form data stored as JSONB
   - Payment status tracking
   - Unique constraint: one registration per user per event

4. **payments**
   - Razorpay payment records
   - Webhook verification tracking
   - Linked to registrations

5. **audit_logs**
   - Admin action tracking
   - IP address and user agent logging
   - JSONB details field for flexibility

### Relationships

- Events → Users (creator)
- Registrations → Events (many-to-one)
- Registrations → Users (many-to-one)
- Payments → Registrations (one-to-many)
- Audit Logs → Users (admin)

## Security Architecture

### Authentication Flow

1. User submits credentials
2. Backend validates and returns JWT
3. Frontend stores token in localStorage
4. All API requests include token in Authorization header
5. Backend validates token on every request

### RBAC Enforcement

**Backend (Primary Security)**
- Every endpoint checks user role
- RoleChecker dependencies enforce permissions
- Database queries filtered by role
- Admin can only see their own events/registrations

**Frontend (UX Only)**
- Route guards redirect unauthorized users
- UI elements hidden based on role
- NOT trusted for security

### Payment Security

1. **Order Creation**: Backend creates Razorpay order
2. **Payment Initiation**: Frontend uses Razorpay SDK
3. **Signature Verification**: Backend verifies payment signature
4. **Webhook Verification**: Server-side webhook signature verification
5. **Double Verification**: Both client-side and webhook verification

## API Design

### RESTful Endpoints

**Authentication**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

**Events (Client)**
- `GET /api/v1/events` - List published events
- `GET /api/v1/events/{id}` - Get event details

**Registrations (Client)**
- `POST /api/v1/registrations` - Register for event
- `GET /api/v1/registrations/my-registrations` - Get user's registrations

**Payments (Client)**
- `POST /api/v1/payments/create-order` - Create payment order
- `POST /api/v1/payments/verify` - Verify payment
- `GET /api/v1/payments/my-payments` - Get payment history
- `POST /api/v1/payments/webhook` - Razorpay webhook

**Admin**
- `POST /api/v1/admin/events` - Create event
- `PUT /api/v1/admin/events/{id}` - Update event
- `GET /api/v1/admin/events/my-events` - Get admin's events
- `GET /api/v1/admin/events/{id}/registrations` - Get event registrations
- `PATCH /api/v1/admin/registrations/{id}` - Update registration status

**Developer**
- `GET /api/v1/developer/users` - Get all users
- `GET /api/v1/developer/users/{id}` - Get user details
- `GET /api/v1/developer/users/{id}/registrations` - Get user registrations
- `GET /api/v1/developer/users/{id}/payments` - Get user payments
- `GET /api/v1/developer/events` - Get all events
- `GET /api/v1/developer/registrations` - Get all registrations
- `GET /api/v1/developer/payments` - Get all payments
- `GET /api/v1/developer/audit-logs` - Get audit logs
- `PATCH /api/v1/developer/registrations/{id}/override` - Override registration

## Deployment Architecture

### Frontend (Vercel)

**Advantages:**
- Automatic HTTPS
- Global CDN
- Preview deployments
- Environment variable management
- Zero-config deployment

**Configuration:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

### Backend (AWS EC2)

**Stack:**
- Gunicorn (WSGI server)
- Uvicorn workers (ASGI)
- Nginx (reverse proxy)
- Systemd (process management)

**SSL:**
- Let's Encrypt via Certbot
- Automatic renewal

**Security:**
- Firewall rules (only 80, 443 open)
- SSH key authentication
- Regular security updates

### Database (AWS RDS)

**Configuration:**
- PostgreSQL 14+
- Automated backups
- Multi-AZ for high availability (optional)
- Security groups for network isolation

## Scalability Considerations

### Current Design
- Stateless backend (horizontal scaling ready)
- Database connection pooling
- Efficient indexing
- JSONB for flexible schemas

### Future Enhancements
- Redis for caching
- CDN for static assets
- Database read replicas
- Message queue for async tasks
- Microservices if needed

## Monitoring & Logging

### Current Implementation
- Audit logs for admin actions
- Application logs via Gunicorn
- Nginx access logs

### Recommended Additions
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Database query monitoring
- Payment transaction monitoring

## Development Workflow

1. **Local Development**
   - Backend: `uvicorn app.main:app --reload`
   - Frontend: `npm run dev`
   - Database: Local PostgreSQL

2. **Testing**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - E2E tests for critical flows

3. **Deployment**
   - Git push triggers Vercel build
   - Backend deployed via CI/CD or manual
   - Database migrations run separately

## Environment Configuration

### Development
- Local database
- Test Razorpay keys
- CORS enabled for localhost

### Production
- RDS database
- Production Razorpay keys
- Restricted CORS
- HTTPS enforced
- Rate limiting enabled

## Known Limitations & Future Work

1. **File Uploads**: Not implemented (can be added)
2. **Email Notifications**: Not implemented (can be added)
3. **Rate Limiting**: Basic implementation (can be enhanced)
4. **Caching**: Not implemented (Redis recommended)
5. **Search**: Basic filtering (full-text search can be added)
6. **Analytics**: Not implemented (can be added)

## Best Practices Followed

✅ Separation of concerns
✅ DRY principle
✅ Type safety (TypeScript + Pydantic)
✅ Security-first design
✅ Scalable architecture
✅ Production-ready configuration
✅ Comprehensive error handling
✅ Audit logging
✅ Database indexing
✅ Connection pooling
