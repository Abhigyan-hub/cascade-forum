# EC2 Troubleshooting Guide

Common issues and solutions when deploying to EC2.

## Python Package Installation Issues

### Error: "externally-managed-environment"

**Problem:**
```
error: externally-managed-environment
× This environment is externally managed
```

**Cause:** Ubuntu 22.04+ prevents system-wide pip installs to avoid conflicts with apt packages.

**Solutions:**

#### Option 1: Install via apt (System-wide)
```bash
sudo apt install -y gunicorn
```

#### Option 2: Use Virtual Environment (Recommended)
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Now install packages
pip install gunicorn
pip install -r requirements.txt
```

#### Option 3: Override the protection (Not Recommended)
```bash
# Only if absolutely necessary
sudo pip3 install --break-system-packages gunicorn
```

**Best Practice:** Always use a virtual environment for your application. This is already set up in the deployment guide.

## SSH Connection Issues

### "Permission denied (publickey)"

**Solutions:**
```bash
# Windows PowerShell - Set permissions
icacls your-key.pem /inheritance:r
icacls your-key.pem /grant:r "$($env:USERNAME):(R)"

# Linux/Mac - Set permissions
chmod 400 your-key.pem

# Make sure you're using the correct username
# Ubuntu: ubuntu@
# Amazon Linux: ec2-user@
```

### "Connection timed out"

**Check:**
1. Security group allows SSH (port 22) from your IP
2. Instance is running (not stopped/terminated)
3. Correct Public IP address
4. Try using Public DNS instead of IP

## Service Won't Start

### Check Service Status
```bash
sudo systemctl status cascade-forum
```

### View Logs
```bash
# Real-time logs
sudo journalctl -u cascade-forum -f

# Last 50 lines
sudo journalctl -u cascade-forum -n 50

# Logs with timestamps
sudo journalctl -u cascade-forum --since "1 hour ago"
```

### Common Issues:

**1. Port Already in Use**
```bash
# Check what's using port 8000
sudo netstat -tulpn | grep 8000

# Kill the process
sudo kill -9 <PID>
```

**2. Permission Denied**
```bash
# Check file permissions
ls -la /opt/cascade-forum/backend/

# Fix ownership
sudo chown -R ubuntu:ubuntu /opt/cascade-forum
```

**3. Environment Variables Not Loaded**
```bash
# Check if .env file exists
ls -la /opt/cascade-forum/backend/.env

# Test loading environment
sudo systemctl show cascade-forum --property=Environment
```

**4. Python/Module Not Found**
```bash
# Verify virtual environment path in service file
cat /etc/systemd/system/cascade-forum.service

# Test manually
cd /opt/cascade-forum/backend
source venv/bin/activate
python -c "import app; print('OK')"
```

## Database Connection Issues

### "Connection refused" or "Timeout"

**Check:**
1. RDS security group allows EC2 security group
2. Correct endpoint and port
3. Database is available (not in "modifying" state)
4. Correct username and password

**Test Connection:**
```bash
# From EC2, test RDS connection
psql -h YOUR_RDS_ENDPOINT -U YOUR_USER -d cascade_forum

# If psql not installed
sudo apt install -y postgresql-client
```

**Check Security Groups:**
1. Go to RDS → Your database → Connectivity & security
2. Click on security group
3. Edit inbound rules
4. Add rule: PostgreSQL, Port 5432, Source: EC2 security group

### "Authentication failed"

**Solutions:**
1. Verify username and password in `.env` file
2. Check if password has special characters (may need URL encoding)
3. Reset RDS master password if needed

## Nginx Issues

### 502 Bad Gateway

**Check:**
```bash
# Is the app running?
sudo systemctl status cascade-forum

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

**Common Causes:**
- App not running
- Wrong proxy_pass URL
- Port mismatch (should be 8000)

### 404 Not Found

**Check:**
```bash
# Verify Nginx config
sudo cat /etc/nginx/sites-available/cascade-forum

# Check if site is enabled
ls -la /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx
```

## SSL Certificate Issues

### Certbot Fails

**Error: "Failed to obtain certificate"**

**Solutions:**
1. Check DNS propagation:
   ```bash
   nslookup your-domain.com
   ```

2. Verify DNS points to EC2 IP:
   ```bash
   dig your-domain.com
   ```

3. Make sure port 80 is open in security group

4. Try again:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### Certificate Renewal Fails

**Test renewal:**
```bash
sudo certbot renew --dry-run
```

**If it fails, check:**
- Nginx is running
- Port 80 is accessible
- DNS still points to EC2

## Application Errors

### Import Errors

```bash
# Activate virtual environment
cd /opt/cascade-forum/backend
source venv/bin/activate

# Check installed packages
pip list

# Reinstall if needed
pip install -r requirements.txt
```

### Database Schema Errors

```bash
# Check if tables exist
psql -h YOUR_RDS_ENDPOINT -U YOUR_USER -d cascade_forum -c "\dt"

# Re-run schema if needed
psql -h YOUR_RDS_ENDPOINT -U YOUR_USER -d cascade_forum -f /opt/cascade-forum/database_schema.sql
```

### Environment Variable Issues

```bash
# Check .env file
cat /opt/cascade-forum/backend/.env

# Verify format (no spaces around =)
# Correct: DATABASE_URL=postgresql://...
# Wrong: DATABASE_URL = postgresql://...

# Test loading
source /opt/cascade-forum/backend/.env
echo $DATABASE_URL
```

## Performance Issues

### High CPU Usage

```bash
# Check CPU usage
top
htop  # if installed

# Check running processes
ps aux | grep python
```

### High Memory Usage

```bash
# Check memory
free -h

# Check disk space
df -h
```

### Slow Response Times

1. Check database connection pool settings
2. Verify RDS instance size is adequate
3. Check Nginx proxy timeouts
4. Monitor CloudWatch metrics

## File Permission Issues

### "Permission denied" when accessing files

```bash
# Fix ownership
sudo chown -R ubuntu:ubuntu /opt/cascade-forum

# Fix permissions
chmod -R 755 /opt/cascade-forum
chmod 600 /opt/cascade-forum/backend/.env
```

## Network Issues

### Can't Access Application

1. **Check Security Groups:**
   - Port 80 (HTTP) open to 0.0.0.0/0
   - Port 443 (HTTPS) open to 0.0.0.0/0
   - Port 22 (SSH) open to your IP only

2. **Check Firewall:**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Test Locally:**
   ```bash
   curl http://localhost:8000/health
   curl http://localhost/health
   ```

## Quick Diagnostic Commands

```bash
# System info
uname -a
python3 --version
nginx -v

# Service status
sudo systemctl status cascade-forum
sudo systemctl status nginx

# Network
sudo netstat -tulpn | grep -E '8000|80|443'

# Disk space
df -h

# Memory
free -h

# Recent logs
sudo journalctl -u cascade-forum --since "10 minutes ago"
sudo tail -n 50 /var/log/nginx/error.log
```

## Getting Help

1. Check application logs: `sudo journalctl -u cascade-forum -f`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Test endpoints manually: `curl http://localhost:8000/health`
4. Verify all services are running: `sudo systemctl status cascade-forum nginx`

---

**Still stuck?** Review the main deployment guide and ensure all steps were completed correctly.
