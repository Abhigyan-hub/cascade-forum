# AWS Deployment Checklist

Use this checklist to track your AWS deployment progress.

## Pre-Deployment

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] Domain name purchased (optional but recommended)
- [ ] Razorpay account set up with API keys
- [ ] SSH key pair created for EC2

## Database Setup (RDS)

- [ ] RDS PostgreSQL instance created
- [ ] Database credentials saved securely
- [ ] Security group configured (allows EC2 access)
- [ ] Database endpoint noted
- [ ] Database schema applied (`database_schema.sql`)
- [ ] Database connection tested

## EC2 Instance Setup

- [ ] EC2 instance launched (Ubuntu 22.04)
- [ ] Security group configured (ports 22, 80, 443)
- [ ] SSH access tested
- [ ] System packages updated
- [ ] Python, Nginx, PostgreSQL client installed
- [ ] Application code deployed to `/opt/cascade-forum`
- [ ] Virtual environment created and activated
- [ ] Python dependencies installed

## Application Configuration

- [ ] `.env` file created with production values
- [ ] Database URL configured (RDS endpoint)
- [ ] JWT secret key generated (secure random string)
- [ ] Razorpay credentials configured
- [ ] CORS origins set (frontend URL)
- [ ] Environment set to `production`

## System Service

- [ ] Systemd service file created (`/etc/systemd/system/cascade-forum.service`)
- [ ] Service enabled (starts on boot)
- [ ] Service started and running
- [ ] Service logs checked (no errors)

## Nginx Configuration

- [ ] Nginx configuration file created
- [ ] Domain name configured in Nginx
- [ ] Site enabled (symbolic link created)
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx restarted

## SSL Certificate

- [ ] DNS records configured (A records pointing to EC2)
- [ ] DNS propagation verified
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Auto-renewal tested

## Security

- [ ] Security group rules tightened (remove port 8000)
- [ ] SSH access restricted to your IP
- [ ] UFW firewall enabled
- [ ] Automatic security updates configured
- [ ] Strong passwords set for all services

## Testing

- [ ] API health check works (`/health`)
- [ ] API documentation accessible (`/docs`)
- [ ] Database connection working
- [ ] Authentication endpoints working
- [ ] Frontend can connect to backend
- [ ] Payment webhook endpoint accessible

## Monitoring

- [ ] CloudWatch logs configured (optional)
- [ ] Application logs accessible
- [ ] Nginx logs accessible
- [ ] Monitoring alerts set up (optional)

## Post-Deployment

- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured
- [ ] End-to-end testing completed
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team notified of deployment

## Rollback Plan

- [ ] Previous version backup available
- [ ] Database backup created
- [ ] Rollback procedure documented

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Environment**: Production / Staging
**Version**: _______________
