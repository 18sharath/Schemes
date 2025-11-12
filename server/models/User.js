const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    // Not required for OAuth users
    required: function () {
      return this.provider === 'local';
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    index: true
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  profile: {
    age: {
      type: Number,
      min: [18, 'Age must be at least 18'],
      max: [100, 'Age cannot exceed 100']
    },
    income: {
      type: Number,
      min: [0, 'Income cannot be negative']
    },
    caste_group: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'Minority', 'Other']
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    interests: [{
      type: String,
      trim: true
    }],
    previous_applications: [{
      type: String,
      trim: true
    }],
    isProfileComplete: {
      type: Boolean,
      default: false
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  bookmarks: [{
    scheme_name: String,
    slug: String,
    level: String,
    schemeCategory: String,
    tags: String,
    details: String,
    benefits: String,
    eligibility: String,
    application: String,
    documents: String,
    score_hybrid: Number,
    score_content: Number,
    score_eligibility: Number,
    score_popularity: Number,
    bookmarkedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if profile is complete
userSchema.methods.isProfileComplete = function() {
  const profile = this.profile;
  // Interests are optional for profile completion
  return !!(
    profile.age &&
    profile.income !== undefined &&
    profile.caste_group &&
    profile.occupation &&
    profile.gender &&
    profile.state
    // Note: interests is optional - removed from required fields
  );
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
