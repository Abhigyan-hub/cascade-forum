# Quick Start Guide - Windows

## Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- PostgreSQL 14+ installed (or use a cloud database)
- Git installed

## Backend Setup (Windows PowerShell)

1. **Open PowerShell and navigate to backend folder**
   ```powershell
   cd backend
   ```

2. **Create virtual environment**
   ```powershell
   python -m venv venv
   ```

3. **Activate virtual environment**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   
   If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   Then try activating again.

4. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   ```powershell
   Copy-Item .env.example .env
   # Edit .env with Notepad or your preferred editor
   notepad .env
   ```

6. **Set up database**
   ```powershell
   # If PostgreSQL is installed locally
   createdb cascade_forum
   
   # Run schema
   psql -d cascade_forum -f ..\database_schema.sql
   ```
   
   Or use pgAdmin to create the database and run the SQL file.

7. **Run development server**
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Frontend Setup (Windows)

1. **Open PowerShell and navigate to frontend folder**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Set up environment variables**
   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

4. **Generate route tree (first time only)**
   ```powershell
   npx @tanstack/router-cli generate
   ```

5. **Run development server**
   ```powershell
   npm run dev
   ```

## Alternative: Using Command Prompt (CMD)

If you prefer CMD instead of PowerShell:

1. **Activate virtual environment**
   ```cmd
   venv\Scripts\activate.bat
   ```

2. **Copy files**
   ```cmd
   copy .env.example .env
   ```

## Troubleshooting

### Virtual Environment Activation Issues

**PowerShell Execution Policy Error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Alternative (CMD):**
```cmd
venv\Scripts\activate.bat
```

### PostgreSQL Connection Issues

If `psql` is not recognized:
- Add PostgreSQL bin directory to PATH, or
- Use pgAdmin GUI to run the SQL file

### Port Already in Use

If port 8000 is already in use:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or change the port in the uvicorn command:
```powershell
uvicorn app.main:app --reload --port 8001
```

## Next Steps

1. Backend should be running at: `http://localhost:8000`
2. Frontend should be running at: `http://localhost:5173` (or the port shown)
3. Visit `http://localhost:8000/docs` for API documentation
4. Start using the application!
