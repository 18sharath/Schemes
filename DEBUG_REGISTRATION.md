# 🔍 Debug Registration 400 Error

## Step 1: Test the Server Connection

First, test if your server is running properly:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","timestamp":"...","service":"Scheme Recommender API"}
```

## Step 2: Test the Registration Endpoint

Test the registration endpoint directly:

```bash
# Test registration with curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "password123",
    "phone": "9876543210"
  }'
```

## Step 3: Check Server Logs

When you make the request, check your server console for:

1. **Request received**: `Registration request received: { name: '...', email: '...' }`
2. **Validation errors**: Any validation issues
3. **Database errors**: MongoDB connection issues
4. **User creation**: `User created successfully: ...`

## Step 4: Common Issues & Solutions

### Issue 1: MongoDB Not Running
**Error**: `connect ECONNREFUSED ::1:27017`
**Solution**: 
```bash
# Start MongoDB
mongod
# OR use MongoDB Atlas (cloud)
```

### Issue 2: Validation Errors
**Error**: `Validation failed`
**Check**: 
- Name must be 2-100 characters
- Email must be valid
- Password must be at least 6 characters
- Phone must be valid Indian mobile number (if provided)

### Issue 3: Database Connection
**Error**: `Server error during registration`
**Solution**: The app will work without MongoDB in development mode

## Step 5: Frontend Debugging

Open browser developer tools (F12) and check:

1. **Network tab**: Look for the POST request to `/api/auth/register`
2. **Request payload**: Check what data is being sent
3. **Response**: Check the error message from server

## Step 6: Quick Fix

If you want to test without MongoDB:

1. The app should work in development mode
2. Check server logs for detailed error messages
3. Try the test endpoint: `POST /api/test`

## 🚀 Expected Flow

1. **Frontend sends**: `{ name, email, password, phone }`
2. **Server receives**: Logs the request data
3. **Validation**: Checks all fields are valid
4. **Database**: Creates user (or handles error gracefully)
5. **Response**: Returns success with token

## 🔧 Debug Commands

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Check server logs
# Look for: "Registration request received"
```

The detailed logging will show you exactly where the 400 error is coming from!
