# How to Launch an EC2 Instance - Step by Step

This guide walks you through launching an EC2 instance for the Cascade Forum backend.

## 📋 Prerequisites

- AWS Account (if you don't have one, sign up at https://aws.amazon.com)
- Credit card (AWS free tier available for 12 months)

## 🚀 Step-by-Step: Launch EC2 Instance

### Step 1: Sign In to AWS Console

1. Go to https://console.aws.amazon.com
2. Sign in with your AWS account credentials
3. Make sure you're in the correct region (e.g., `us-east-1`, `us-west-2`) - you can change it in the top-right corner

### Step 2: Navigate to EC2

1. In the AWS Console, search for "EC2" in the search bar at the top
2. Click on **EC2** (under Services)
3. You should see the EC2 Dashboard

### Step 3: Launch Instance

1. Click the orange **"Launch instance"** button (top-right corner)
2. You'll see a multi-step form

### Step 4: Name Your Instance

1. In the **"Name and tags"** section:
   - **Name**: Enter `cascade-forum-backend`
   - This is just a label for your reference

### Step 5: Choose Application and OS Images (AMI)

1. **Application and OS Images (Amazon Machine Image)** section:
   - Click **"Browse more AMIs"** or select from quick start
   - **Recommended**: Select **"Ubuntu Server 22.04 LTS"** (free tier eligible)
   - Make sure it says "Free tier eligible" if you want to use free tier
   - Click **"Select"**

### Step 6: Choose Instance Type

1. **Instance type** section:
   - For **Development/Testing**: Select **"t2.micro"** (free tier eligible)
   - For **Production**: Select **"t3.small"** or larger
   - Click **"Next: Configure Instance Details"** (or continue)

### Step 7: Create Key Pair (IMPORTANT!)

1. Scroll down to **"Key pair (login)"** section
2. Click **"Create new key pair"**
3. **Key pair name**: Enter `cascade-forum-key` (or any name you prefer)
4. **Key pair type**: Select **"RSA"**
5. **Private key file format**: 
   - **Windows**: Select **".pem"**
   - **Linux/Mac**: Select **".pem"**
6. Click **"Create key pair"**
7. **⚠️ IMPORTANT**: The `.pem` file will download automatically
   - **Save this file in a safe place!** (e.g., `C:\Users\USER\Desktop\aws-keys\`)
   - **You cannot download it again!**
   - **You need this file to SSH into your server**

### Step 8: Network Settings

1. **Network settings** section:
   - **VPC**: Leave default (or select the same VPC as your RDS)
   - **Subnet**: Leave default (public subnet)
   - **Auto-assign public IP**: Select **"Enable"**
   - **Firewall (security groups)**: Select **"Create security group"**
   - **Security group name**: `cascade-forum-sg`
   - **Description**: `Security group for Cascade Forum backend`

2. **Inbound security group rules**:
   - **Rule 1 - SSH**:
     - Type: `SSH`
     - Protocol: `TCP`
     - Port: `22`
     - Source: `My IP` (click the dropdown and select "My IP")
   - **Rule 2 - HTTP**:
     - Click **"Add security group rule"**
     - Type: `HTTP`
     - Protocol: `TCP`
     - Port: `80`
     - Source: `Anywhere-IPv4` (0.0.0.0/0)
   - **Rule 3 - HTTPS**:
     - Click **"Add security group rule"**
     - Type: `HTTPS`
     - Protocol: `TCP`
     - Port: `443`
     - Source: `Anywhere-IPv4` (0.0.0.0/0)
   - **Rule 4 - Custom (for testing)**:
     - Click **"Add security group rule"**
     - Type: `Custom TCP`
     - Port: `8000`
     - Source: `Anywhere-IPv4` (0.0.0.0/0)
     - **Note**: Remove this rule after setup for security

### Step 9: Configure Storage

1. **Configure storage** section:
   - **Volume size**: `20` GB (minimum recommended)
   - **Volume type**: `gp3` (General Purpose SSD)
   - **Delete on termination**: Leave checked (optional, but recommended for cost control)

### Step 10: Review and Launch

1. Click **"Review and Launch"** button
2. Review all your settings:
   - Instance type: t2.micro (or your choice)
   - Key pair: cascade-forum-key (or your name)
   - Security group: cascade-forum-sg
   - Storage: 20 GB
3. If everything looks good, click **"Launch"** button

### Step 11: Launch Status

1. A popup will appear saying "Select an existing key pair or create a new key pair"
2. Make sure your key pair is selected (the one you created/downloaded)
3. Check the box: **"I acknowledge that I have access to the selected private key file"**
4. Click **"Launch instances"**

### Step 12: Instance Launching

1. You'll see a green success message: **"Successfully initiated launch of instance"**
2. Click **"View all instances"** (or the instance ID link)
3. Your instance will appear in the EC2 Instances list
4. **Status** will show:
   - `pending` → `running` (takes 1-2 minutes)

### Step 13: Get Your Instance Details

1. Once status is **"running"**, select your instance (click the checkbox)
2. In the bottom panel, you'll see:
   - **Public IPv4 address**: `xx.xx.xx.xx` ← **Save this!**
   - **Public IPv4 DNS**: `ec2-xx-xx-xx-xx.compute-1.amazonaws.com`
   - **Instance ID**: `i-xxxxxxxxxxxxx`
   - **Instance state**: `running`

## 🔐 Step 14: Connect to Your Instance

### Windows (PowerShell)

1. **Navigate to folder with your .pem file:**
   ```powershell
   cd C:\Users\USER\Desktop\aws-keys
   # Or wherever you saved the .pem file
   ```

2. **Set permissions (if needed):**
   ```powershell
   icacls cascade-forum-key.pem /inheritance:r
   icacls cascade-forum-key.pem /grant:r "$($env:USERNAME):(R)"
   ```

3. **Connect via SSH:**
   ```powershell
   ssh -i cascade-forum-key.pem ubuntu@16.171.149.246
   ```
   
   Replace `YOUR_PUBLIC_IP` with the Public IPv4 address from Step 13.

4. **First time connection:**
   - You'll see: "The authenticity of host... Are you sure you want to continue?"
   - Type: `yes` and press Enter

5. **You should now be connected!** You'll see:
   ```
   Welcome to Ubuntu 22.04 LTS...
   ubuntu@ip-xxx-xxx-xxx-xxx:~$
   ```

### Linux/Mac

1. **Navigate to folder with your .pem file:**
   ```bash
   cd ~/Downloads
   # Or wherever you saved the .pem file
   ```

2. **Set permissions:**
   ```bash
   chmod 400 cascade-forum-key.pem
   ```

3. **Connect via SSH:**
   ```bash
   ssh -i cascade-forum-key.pem ubuntu@YOUR_PUBLIC_IP
   ```

## ✅ Verification

Once connected, verify everything works:

```bash
# Check system info
uname -a

# Check Python version
python3 --version

# Check disk space
df -h

# Update system (optional, but recommended)
sudo apt update
```

## 🎯 Next Steps

Now that your EC2 instance is running, follow the **AWS_DEPLOYMENT.md** guide:

1. ✅ EC2 Instance launched (you just did this!)
2. ⏭️ Install dependencies (Step 3 in AWS_DEPLOYMENT.md)
3. ⏭️ Deploy application code (Step 4)
4. ⏭️ Configure environment variables (Step 4.3)
5. ⏭️ Set up systemd service (Step 5)
6. ⏭️ Configure Nginx (Step 6)
7. ⏭️ Set up SSL (Step 7)

## 💡 Tips

### Finding Your Instance Later

1. Go to EC2 → Instances
2. Use the search/filter to find `cascade-forum-backend`
3. Click on it to see details

### Stopping Your Instance (to save money)

1. Select your instance
2. Click **"Instance state"** → **"Stop instance"**
3. **Note**: Public IP will change when you restart (use Elastic IP for fixed IP)

### Starting Your Instance

1. Select your stopped instance
2. Click **"Instance state"** → **"Start instance"**

### Terminating (Deleting) Your Instance

⚠️ **Warning**: This permanently deletes your instance and all data!

1. Select your instance
2. Click **"Instance state"** → **"Terminate instance"**
3. Confirm

### Getting a Fixed IP (Elastic IP)

1. Go to EC2 → Elastic IPs → Allocate Elastic IP address
2. Allocate
3. Select the Elastic IP → Actions → Associate Elastic IP address
4. Select your instance
5. Associate

## 🐛 Troubleshooting

### "Permission denied (publickey)" error

- Make sure you're using the correct key file
- Check file permissions (Windows: use icacls, Linux/Mac: chmod 400)
- Make sure you're using `ubuntu@` (not `ec2-user@` or `admin@`)

### Can't connect via SSH

- Check security group: Port 22 should be open to "My IP"
- Check instance status: Should be "running"
- Verify Public IP address is correct
- Try using Public DNS instead of IP

### Instance won't start

- Check your AWS account limits
- Verify you have sufficient credits/quota
- Check for any error messages in EC2 console

### Forgot to download key pair

- Unfortunately, you cannot download it again
- You'll need to:
  1. Terminate the instance
  2. Launch a new instance
  3. Create a new key pair
  4. Download it this time!

## 📊 Cost Monitoring

1. Go to AWS Console → Billing & Cost Management
2. Set up billing alerts (recommended)
3. Monitor your usage

**Free Tier Limits:**
- 750 hours/month of t2.micro instances
- 30 GB of EBS storage
- 2 million I/O requests

---

**Congratulations!** 🎉 You've successfully launched your EC2 instance. Now proceed with the deployment steps in **AWS_DEPLOYMENT.md**.
