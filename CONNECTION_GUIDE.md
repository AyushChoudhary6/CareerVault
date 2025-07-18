# Job Tracker - Frontend & Backend Connection Guide

## 🚀 Quick Start

### Option 1: Start Both (Recommended)
```bash
# From the project root directory
start_both.bat
```

### Option 2: Start Manually

#### Backend (Terminal 1):
```bash
cd backend
pip install -r requirements.txt
python main_mongo.py
```

#### Frontend (Terminal 2):
```bash
cd vite-project
npm install
npm run dev
```

## 🔧 Connection Configuration

### Backend Configuration
- **URL**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`
- **Database**: MongoDB (Cloud)
- **CORS**: Enabled for localhost:3000 and localhost:5173

### Frontend Configuration
- **URL**: `http://localhost:3000`
- **API Base**: `http://localhost:8000` (configured in `src/services/api.js`)
- **Framework**: React + Vite

## 🐛 Troubleshooting

### 1. Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Install dependencies
cd backend
pip install -r requirements.txt

# Check for conflicts
pip list | grep fastapi
```

### 2. Frontend Can't Connect to Backend

#### Check Backend Status:
```bash
cd backend
python test_simple.py
```

#### Check CORS Issues:
- Open browser dev tools (F12)
- Look for CORS errors in console
- Verify Origin headers match allowed origins

#### Verify API Endpoints:
- Visit: `http://localhost:8000/docs`
- Test endpoints directly in Swagger UI

### 3. MongoDB Connection Issues

#### Check MongoDB Connection:
```bash
# From backend directory
python -c "from app.utils.mongodb import connect_to_mongo; import asyncio; asyncio.run(connect_to_mongo())"
```

#### Verify Environment Variables:
```bash
# Check .env file exists
cd backend
type .env
```

### 4. Authentication Issues

#### Clear Browser Storage:
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear Local Storage
4. Refresh page

#### Check JWT Token:
```javascript
// In browser console
console.log(localStorage.getItem('authToken'));
```

### 5. Port Conflicts

#### Check Port Usage:
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job
- `GET /api/jobs/stats/summary` - Get job statistics

## ✅ Testing Connection

### Quick Test Commands:
```bash
# Test backend health
curl http://localhost:8000/

# Test with CORS headers
curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:8000/

# Test frontend health
curl http://localhost:3000/
```

### Automated Test:
```bash
cd backend
python test_simple.py
```

## 🔑 Environment Variables

Create/update `backend/.env`:
```env
# MongoDB Configuration
MONGODB_URL=mongodb+srv://awesomea12005:CgaagLstpLMAsZov@cluster0.znrn1nm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DATABASE=job_tracker

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 📞 Common Error Solutions

### Error: "CORS policy has blocked the request"
**Solution**: Verify backend CORS configuration includes frontend URL

### Error: "Failed to fetch"
**Solutions**:
1. Check if backend is running
2. Verify API URL in frontend
3. Check firewall/antivirus blocking connections

### Error: "401 Unauthorized"
**Solutions**:
1. Clear browser storage and re-login
2. Check JWT token expiration
3. Verify user credentials

### Error: "MongoParseError"
**Solutions**:
1. Check MongoDB connection string
2. Verify network connectivity
3. Check MongoDB Atlas IP whitelist

## 📄 File Structure
```
project/
├── backend/
│   ├── main_mongo.py          # Main backend entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   ├── test_simple.py         # Connection test script
│   └── app/
│       ├── routes/            # API routes
│       └── utils/             # Database & utilities
├── vite-project/
│   ├── src/
│   │   ├── services/api.js    # API client configuration
│   │   ├── context/           # React contexts
│   │   └── pages/             # React pages
│   └── package.json           # Node dependencies
├── start_both.bat             # Start both servers
├── start_frontend.bat         # Start frontend only
└── backend/start_backend.bat  # Start backend only
```

For more help, check the API documentation at `http://localhost:8000/docs`
