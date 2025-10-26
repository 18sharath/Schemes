const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scheme_recommender';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('💡 Make sure MongoDB is running on your system');
    console.log('💡 You can start MongoDB with: mongod');
    console.log('💡 Or use MongoDB Atlas (cloud) and update MONGODB_URI');
    
    // Don't exit in development, just warn
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuing without database connection (development mode)');
    }
  }
};

module.exports = { connectDB };
