# How to Generate JWT Secret Key

A secure JWT secret key is essential for protecting your application's authentication tokens.

## 🔐 Requirements

- **Minimum length**: 32 characters (recommended: 32-64)
- **Random**: Must be cryptographically random
- **Secret**: Never commit to version control
- **Unique**: Different for each environment (dev/staging/prod)

## 🚀 Methods to Generate

### Method 1: Python (Recommended - Works on EC2)

**On your EC2 instance or local machine:**

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Output example:**
```
xK9mP2vQ7wR4tY8uI0oP3aS6dF1gH5jK8lM9nB2vC4xZ7aQ9wE2rT5yU8iO1pA
```

**Alternative (hexadecimal):**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Output example:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Method 2: OpenSSL

```bash
openssl rand -hex 32
```

**Output example:**
```
4f8a9b2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

### Method 3: Python Interactive

```bash
python3
```

Then in Python:
```python
import secrets
secret_key = secrets.token_urlsafe(32)
print(secret_key)
exit()
```

### Method 4: Online Generator (Use with Caution)

⚠️ **Warning**: Only use trusted online generators. Better to use local methods.

- https://generate-secret.vercel.app/32
- https://www.lastpass.com/features/password-generator

**Never use online generators for production secrets if you're concerned about security.**

## 📝 How to Use

### On EC2 (During Deployment)

1. **Generate the key:**
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Copy the output**

3. **Add to your .env file:**
   ```bash
   nano /opt/cascade-forum/backend/.env
   ```
   
   Add:
   ```env
   SECRET_KEY=your-generated-key-here
   ```

### On Local Machine (For Development)

1. **Generate the key:**
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Add to backend/.env:**
   ```env
   SECRET_KEY=your-generated-key-here
   ```

## ✅ Best Practices

1. **Different keys for each environment:**
   - Development: One key
   - Staging: Different key
   - Production: Different key (most secure)

2. **Never commit to Git:**
   - Always use `.env` file
   - Add `.env` to `.gitignore` ✅ (already done)

3. **Store securely:**
   - Use environment variables
   - Use AWS Secrets Manager (for production)
   - Use password managers for backup

4. **Rotate periodically:**
   - Change every 90 days (production)
   - Change if compromised
   - **Note**: Changing invalidates all existing tokens (users will need to re-login)

## 🔄 Rotating Secret Keys

If you need to change the secret key:

1. **Generate new key:**
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Update .env file:**
   ```env
   SECRET_KEY=new-generated-key-here
   ```

3. **Restart service:**
   ```bash
   sudo systemctl restart cascade-forum
   ```

4. **⚠️ Important**: All existing JWT tokens will become invalid. Users will need to log in again.

## 🧪 Verify Your Key

After setting the key, verify it's being used:

```bash
# Check if environment variable is loaded
sudo systemctl show cascade-forum --property=Environment

# Check application logs
sudo journalctl -u cascade-forum -n 20 | grep -i secret
```

## 📋 Quick Reference

**Generate 32-character URL-safe key:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Generate 64-character hex key:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Generate 32-byte base64 key:**
```bash
python3 -c "import secrets, base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())"
```

## 🔒 Security Notes

- ✅ **DO**: Use cryptographically secure random generators
- ✅ **DO**: Use different keys for each environment
- ✅ **DO**: Store in environment variables
- ❌ **DON'T**: Use predictable patterns (dates, names, etc.)
- ❌ **DON'T**: Share keys between environments
- ❌ **DON'T**: Commit keys to version control
- ❌ **DON'T**: Use short keys (< 32 characters)

---

**Quick Command for EC2:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste it into your `.env` file as `SECRET_KEY=...`
