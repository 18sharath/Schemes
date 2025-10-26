# Government Scheme Recommendation System

A full-stack web application that provides personalized government scheme recommendations using machine learning. Built with Node.js, Express, React.js, and integrated with your trained ML model.

## 🚀 Features

- **User Authentication**: Secure login/registration system
- **Profile Management**: Complete user profile with interests and preferences
- **AI-Powered Recommendations**: Personalized scheme suggestions using your ML model
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Real-time Status**: Service health monitoring and ML model availability
- **Quick Recommendations**: Get instant recommendations with minimal profile data
- **Advanced Filtering**: Search and filter recommendations by category and keywords

## 📁 Project Structure

```
├── server/                 # Node.js/Express Backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # ML service integration
│   └── index.js          # Server entry point
├── client/               # React.js Frontend
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.js        # Main app component
│   └── package.json
├── artifacts/            # Your trained ML model
│   └── scheme_recommender.joblib
├── package.json          # Root package.json
└── requirements.txt      # Python dependencies
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud)
- Your trained ML model in `artifacts/scheme_recommender.joblib`

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install Python dependencies (if not already installed)
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/scheme_recommender

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Python Configuration (if needed)
PYTHON_PATH=python
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

### 4. Verify ML Model

Ensure your trained model is available at:
```
artifacts/scheme_recommender.joblib
```

### 5. Start the Application

#### Development Mode (Recommended)

```bash
# Start both backend and frontend concurrently
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

#### Production Mode

```bash
# Build the React app
npm run build

# Start the server
npm start
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/complete` - Mark profile as complete
- `GET /api/profile/status` - Get profile completion status

### Recommendations
- `POST /api/recommendations` - Get personalized recommendations
- `POST /api/recommendations/quick` - Get quick recommendations
- `GET /api/recommendations/status` - Get service status

### Health Check
- `GET /api/health` - Service health check

## 🎨 Frontend Pages

1. **Home** (`/`) - Landing page with features and benefits
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - User registration
4. **Dashboard** (`/dashboard`) - User dashboard with stats and quick actions
5. **Profile** (`/profile`) - Complete user profile management
6. **Recommendations** (`/recommendations`) - AI-powered scheme recommendations

## 🤖 ML Integration

The application integrates with your trained ML model through:

1. **ML Service** (`server/services/mlService.js`):
   - Spawns Python processes to run inference
   - Handles model loading and prediction
   - Error handling and fallback mechanisms

2. **API Integration** (`server/routes/recommendations.js`):
   - RESTful endpoints for recommendations
   - Profile validation and preprocessing
   - Response formatting and error handling

3. **Frontend Integration** (`client/src/services/api.js`):
   - Axios-based API client
   - Error handling and retry logic
   - Authentication token management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Helmet.js security headers

## 📱 Responsive Design

- Mobile-first design approach
- Tailwind CSS for styling
- Smooth animations with Framer Motion
- Dark mode support
- Accessible components

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Install dependencies: `npm install`
3. Start server: `npm start`

### Frontend Deployment
1. Build React app: `npm run build`
2. Serve static files from `client/build`
3. Configure API endpoints for production

### ML Model Deployment
- Ensure Python dependencies are installed
- Verify model file path in ML service
- Test model inference before deployment

## 🐛 Troubleshooting

### Common Issues

1. **ML Model Not Found**
   - Verify `artifacts/scheme_recommender.joblib` exists
   - Check Python path in environment variables

2. **Database Connection Failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

3. **CORS Errors**
   - Verify CLIENT_URL in .env file
   - Check if frontend is running on correct port

4. **Authentication Issues**
   - Check JWT_SECRET in .env file
   - Verify token expiration settings

## 📊 Performance Optimization

- Lazy loading of components
- Image optimization
- API response caching
- Database query optimization
- ML model caching

## 🔄 Future Enhancements

- Real-time notifications
- Email integration
- Advanced analytics
- Multi-language support
- Mobile app development

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs for errors
4. Verify ML model compatibility

---

**Built with ❤️ using Node.js, Express, React.js, and your trained ML model.**
