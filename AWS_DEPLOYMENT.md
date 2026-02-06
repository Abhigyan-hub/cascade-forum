# AWS Deployment Guide - Cascade Forum

This guide covers deploying the Cascade Forum backend to AWS EC2 and database to AWS RDS.

## 📋 Prerequisites

- AWS Account
- AWS CLI installed and configured
- Domain name (optional, but recommended)
- SSH key pair for EC2
- Basic knowledge of Linux commands

## 🗄️ Step 1: Set Up RDS PostgreSQL Database

### 1.1 Create RDS Instance

1. **Go to AWS Console → RDS → Databases → Create database**

2. **Choose configuration:**
   - **Engine**: PostgreSQL
   - **Version**: 14.x or higher
   - **Template**: 
     - Development: Free tier
     - Production: Production (Multi-AZ for high availability)

3. **Settings:**
   - **DB instance identifier**: `cascade-forum-db`
   - **Master username**: `cascade_admin` (or your choice)
   - **Master password**: Varmasirpops4 (save it!)
   - **DB instance class**: 
     - Development: `db.t3.micro` (free tier)
     - Production: `db.t3.small` or larger
     end point: cascade-forum-db.cpmg4iky8jgg.eu-north-1.rds.amazonaws.com

4. **Storage:**
   - **Storage type**: General Purpose SSD (gp3)
   - **Allocated storage**: 20 GB (minimum)
   - **Storage autoscaling**: Enable (recommended)

5. **Connectivity:**
   - **VPC**: Default VPC (or your custom VPC)
   - **Public access**: **No** (for security)
   - **VPC security group**: Create new or use existing
   - **Availability Zone**: No preference

6. **Database authentication**: Password authentication

7. **Additional configuration:**
   - **Initial database name**: `cascade_forum`
   - **Backup retention**: 7 days (production)
   - **Enable encryption**: Yes (recommended)

8. **Click "Create database"** (takes 5-10 minutes)

### 1.2 Configure Security Group

1. **Go to RDS → Databases → Select your database → Connectivity & security**

2. **Click on the VPC security group**

3. **Edit inbound rules:**
   - **Type**: PostgreSQL
   - **Protocol**: TCP
   - **Port**: 5432
   - **Source**: Select the security group of your EC2 instance (or create one and use it)

### 1.3 Get Database Endpoint

1. **Note the endpoint** from RDS console (e.g., `cascade-forum-db.xxxxx.us-east-1.rds.amazonaws.com`)
2. **Note the port** (usually 5432)

## 🖥️ Step 2: Set Up EC2 Instance

> **📘 For detailed step-by-step instructions with screenshots, see [EC2_LAUNCH_GUIDE.md](./EC2_LAUNCH_GUIDE.md)**

### 2.1 Launch EC2 Instance

1. **Go to AWS Console → EC2 → Instances → Launch instance**

2. **Name**: `cascade-forum-backend`

3. **AMI**: 
   - **Ubuntu Server 22.04 LTS** (recommended)
   - Or Amazon Linux 2023

4. **Instance type:**
   - **Development**: `t2.micro` (free tier)
   - **Production**: `t3.small` or larger

5. **Key pair**: 
   - Create new or select existing
   - **Download the .pem file** (you'll need it for SSH)
   - ⚠️ **Save this file! You cannot download it again!**

6. **Network settings:**
   - **VPC**: Same as RDS
   - **Subnet**: Public subnet
   - **Auto-assign public IP**: Enable
   - **Security group**: Create new security group
     - **Name**: `cascade-forum-sg`
     - **Inbound rules**:
       - SSH (22) from My IP
       - HTTP (80) from Anywhere (0.0.0.0/0)
       - HTTPS (443) from Anywhere (0.0.0.0/0)
       - Custom TCP (8000) from Anywhere (for testing, remove later)

7. **Storage**: 20 GB gp3 (minimum)

8. **Launch instance**

9. **Note your Public IPv4 address** from the instance details (you'll need it for SSH)

### 2.2 Connect to EC2 Instance

**Windows (PowerShell):**
```powershell
# Navigate to folder with your .pem file
cd C:\path\to\your\key

# Set permissions (if needed)
icacls cascade-forum-key.pem /inheritance:r
icacls cascade-forum-key.pem /grant:r "$($env:USERNAME):(R)"

# Connect
ssh -i cascade-forum-key.pem ubuntu@16.171.149.246
```

**Linux/Mac:**
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Replace `YOUR_EC2_PUBLIC_IP` with your instance's public IP from EC2 console.

## 🔧 Step 3: Install Dependencies on EC2

Once connected via SSH, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install -y python3 python3-pip python3-venv python3-dev
sudo apt install -y postgresql-client
sudo apt install -y nginx
sudo apt install -y certbot python3-certbot-nginx
sudo apt install -y git

# Install Node.js (if needed for any scripts)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Note: Gunicorn will be installed in the virtual environment later
# If you need it system-wide, use: sudo apt install -y gunicorn
```

## 📦 Step 4: Deploy Application Code

### 4.1 Clone Repository

```bash
# Create app directory
sudo mkdir -p /opt/cascade-forum
sudo chown ubuntu:ubuntu /opt/cascade-forum
cd /opt/cascade-forum

# Clone your repository
git clone https://github.com/Abhigyan-hub/cascade-forum.git .

# Or upload files using SCP from your local machine:
# scp -i your-key.pem -r backend/ ubuntu@YOUR_EC2_IP:/opt/cascade-forum/
```

### 4.2 Set Up Python Environment

```bash
cd /opt/cascade-forum/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4.3 Configure Environment Variables

```bash
# Create .env file
nano .env
```

**Add the following (replace with your actual values):**

```env
# Database (use RDS endpoint)
DATABASE_URL=postgresql://cascade-forum-db.cpmg4iky8jgg.eu-north-1.rds.amazonaws.com

# JWT (generate a secure random string)
SECRET_KEY=JTotFYrpLrn2G40dcddxesbOGUVf0VzsnJ2dDm86FEI
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Razorpay
RAZORPAY_KEY_ID=rzp_live_SBii1mLJMvEUzM
RAZORPAY_KEY_SECRET=riGDIb77zsf6FLwcuNAhcKu1
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# CORS (your frontend URL)
CORS_ORIGINS=https://cascade-forum.vercel.app/

# Environment
ENVIRONMENT=production
```

**Generate a secure SECRET_KEY:**

**Method 1: Using Python (Recommended)**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Method 2: Using Python (Alternative)**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Method 3: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Method 4: Using Python interactive**
```bash
python3
>>> import secrets
>>> secrets.token_urlsafe(32)
# Copy the output
>>> exit()
```

**Example output:** `xK9mP2vQ7wR4tY8uI0oP3aS6dF1gH5jK8lM9nB2vC4xZ7`

### 4.4 Initialize Database

```bash
# Connect to RDS and run schema
psql -h cascade-forum-db.cpmg4iky8jgg.eu-north-1.rds.amazonaws.com -U cascade_admin -d cascade_forum -f /opt/cascade-forum/cascade-forum/database_schema.sql

# Enter password when prompted
```

Or use pgAdmin or DBeaver to connect and run the SQL file.

## 🚀 Step 5: Set Up Systemd Service

### 5.1 Create Service File

```bash
sudo nano /etc/systemd/system/cascade-forum.service
```

**Add the following:**

```ini
[Unit]
Description=Cascade Forum API
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/cascade-forum/cascade-forum/backend
Environment="PATH=/opt/cascade-forum/cascade-forum/backend/venv/bin"
EnvironmentFile=/opt/cascade-forum/cascade-forum/backend/.env
ExecStart=/opt/cascade-forum/cascade-forum/backend/venv/bin/gunicorn -c gunicorn_config.py app.main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5.2 Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable cascade-forum

# Start service
sudo systemctl start cascade-forum

# Check status
sudo systemctl status cascade-forum

# View logs
sudo journalctl -u cascade-forum -f
```

## 🌐 Step 6: Configure Nginx

### 6.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/cascade-forum
```

**Add the following (replace `your-domain.com` with your domain):**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Proxy to FastAPI
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }

    # Webhook endpoint (no timeout)
    location /api/v1/payments/webhook {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

### 6.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/cascade-forum /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 Step 7: Set Up SSL with Let's Encrypt

### 7.1 Configure DNS

1. **Point your domain to EC2 IP:**
   - Create A record: `your-domain.com` → `YOUR_EC2_PUBLIC_IP`
   - Create A record: `www.your-domain.com` → `YOUR_EC2_PUBLIC_IP`

2. **Wait for DNS propagation** (can take up to 48 hours, usually 5-10 minutes)

### 7.2 Obtain SSL Certificate

```bash
# Run Certbot
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### 7.3 Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
# Test renewal
sudo certbot renew --dry-run
```

## 🔐 Step 8: Security Hardening

### 8.1 Update Security Group

1. **Go to EC2 → Security Groups → Select your security group**

2. **Remove port 8000** from inbound rules (only keep 22, 80, 443)

3. **Restrict SSH (port 22)** to your IP only

### 8.2 Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 8.3 Keep System Updated

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Step 9: Monitoring and Logs

### 9.1 View Application Logs

```bash
# Real-time logs
sudo journalctl -u cascade-forum -f

# Last 100 lines
sudo journalctl -u cascade-forum -n 100

# Logs since today
sudo journalctl -u cascade-forum --since today
```

### 9.2 View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 9.3 Set Up CloudWatch (Optional)

1. **Install CloudWatch agent:**
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

2. **Configure and start agent** (follow AWS documentation)

## 🔄 Step 10: Deployment Workflow

### 10.1 Manual Deployment

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Navigate to app directory
cd /opt/cascade-forum

# Pull latest changes
git pull origin main

# Or upload new files
# scp -i your-key.pem -r backend/ ubuntu@YOUR_EC2_IP:/opt/cascade-forum/

# Activate virtual environment
cd backend
source venv/bin/activate

# Install new dependencies (if any)
pip install -r requirements.txt

# Restart service
sudo systemctl restart cascade-forum

# Check status
sudo systemctl status cascade-forum
```

### 10.2 Automated Deployment (CI/CD)

Consider setting up GitHub Actions or AWS CodePipeline for automated deployments.

## 🧪 Step 11: Testing

### 11.1 Test API

```bash
# Health check
curl https://your-domain.com/health

# API docs
# Visit: https://your-domain.com/docs
```

### 11.2 Test Database Connection

```bash
# From EC2, test RDS connection
psql -h cascade-forum-db.xxxxx.us-east-1.rds.amazonaws.com -U cascade_admin -d cascade_forum

# Run a test query
SELECT version();
```

## 💰 Cost Estimation

### Development/Testing:
- **EC2 t2.micro**: Free tier (750 hours/month) or ~$8/month
- **RDS db.t3.micro**: Free tier (750 hours/month) or ~$15/month
- **Data transfer**: ~$0.09/GB
- **Total**: ~$0-25/month

### Production:
- **EC2 t3.small**: ~$15/month
- **RDS db.t3.small**: ~$30/month
- **Data transfer**: ~$0.09/GB
- **Total**: ~$50-100/month (depending on traffic)

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
sudo journalctl -u cascade-forum -n 50

# Check if port is in use
sudo netstat -tulpn | grep 8000

# Check environment variables
sudo systemctl show cascade-forum --property=Environment
```

### Database connection issues
```bash
# Test connection
psql -h YOUR_RDS_ENDPOINT -U YOUR_USER -d cascade_forum

# Check security group rules
# Ensure EC2 security group can access RDS security group
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
sudo systemctl status cascade-forum

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

## 📝 Next Steps

1. ✅ Set up automated backups for RDS
2. ✅ Configure CloudWatch alarms
3. ✅ Set up domain email (optional)
4. ✅ Configure CDN (CloudFront) if needed
5. ✅ Set up monitoring dashboard
6. ✅ Document your deployment process

## 🔗 Useful Commands Reference

```bash
# Service management
sudo systemctl start cascade-forum
sudo systemctl stop cascade-forum
sudo systemctl restart cascade-forum
sudo systemctl status cascade-forum

# View logs
sudo journalctl -u cascade-forum -f

# Nginx
sudo nginx -t
sudo systemctl restart nginx

# SSL renewal
sudo certbot renew

# Database backup (from EC2)
pg_dump -h YOUR_RDS_ENDPOINT -U YOUR_USER -d cascade_forum > backup.sql
```

---

**Need help?** Check AWS documentation or create an issue in your repository.
