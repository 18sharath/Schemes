const en = {
  // Common
  common: {
    loading: 'Loading...',
    save: 'Save',
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    apply: 'Apply',
    download: 'Download',
    upload: 'Upload',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  },

  // Navigation
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
    schemes: 'Schemes',
    recommendations: 'Recommendations',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    getStarted: 'Get Started',
    appName: 'SchemeNavigator',
  },

  // Home Page
  home: {
    hero: {
      title: 'Find Your Perfect',
      subtitle: 'Government Scheme',
      description: 'Get personalized recommendations for government schemes based on your profile, interests, and eligibility. Make informed decisions with our AI-powered platform.',
      getDashboard: 'Go to Dashboard',
      getStarted: 'Get Started Free',
      signIn: 'Sign In',
    },
    features: {
      title: 'Why Choose Our Platform?',
      subtitle: 'We make finding and applying for government schemes simple, fast, and personalized.',
      feature1: {
        title: 'Personalized Recommendations',
        description: 'Get scheme recommendations tailored to your profile, interests, and eligibility criteria.',
      },
      feature2: {
        title: 'Verified Information',
        description: 'Access accurate and up-to-date information about government schemes and programs.',
      },
      feature3: {
        title: 'Easy Application',
        description: 'Find application procedures, required documents, and direct links to apply.',
      },
    },
    stats: {
      title: 'Trusted by Thousands',
      subtitle: 'Join our growing community of users who have found their perfect schemes.',
      schemes: 'Government Schemes',
      states: 'States Covered',
      users: 'Users Helped',
      success: 'Success Rate',
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'Get your personalized recommendations in just three simple steps.',
      step1: {
        title: 'Create Your Profile',
        description: 'Tell us about yourself - your age, occupation, income, and interests.',
      },
      step2: {
        title: 'Get AI Recommendations',
        description: 'Our AI analyzes your profile and suggests the most relevant schemes.',
      },
      step3: {
        title: 'Apply & Benefit',
        description: 'Follow our step-by-step guides to apply for your recommended schemes.',
      },
    },
    cta: {
      title: 'Ready to Find Your Perfect Scheme?',
      subtitle: 'Join thousands of users who have already discovered and applied for government schemes that match their needs.',
      button: 'Start Your Journey Today',
    },
  },

  // Authentication
  auth: {
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account to continue',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      loginButton: 'Sign In',
      noAccount: "Don't have an account?",
      registerLink: 'Create one now',
      loggingIn: 'Signing in...',
    },
    register: {
      title: 'Create Account',
      subtitle: 'Join us to discover government schemes tailored for you',
      name: 'Full Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      registerButton: 'Create Account',
      haveAccount: 'Already have an account?',
      loginLink: 'Sign in here',
      registering: 'Creating account...',
    },
  },

  // Profile Page
  profile: {
    title: 'Your Profile',
    subtitle: 'Complete your profile to get personalized scheme recommendations.',
    completion: {
      title: 'Profile Completion',
      missing: 'Missing',
      complete: 'Profile complete! You can now get personalized recommendations.',
    },
    basic: {
      title: 'Basic Information',
      age: 'Age',
      agePlaceholder: 'Enter your age',
      gender: 'Gender',
      genderSelect: 'Select Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      income: 'Annual Income (₹)',
      incomePlaceholder: 'Enter your annual income',
      casteGroup: 'Caste Group',
      casteSelect: 'Select Caste Group',
      general: 'General',
      obc: 'OBC',
      sc: 'SC',
      st: 'ST',
      minority: 'Minority',
      otherCaste: 'Other',
      occupation: 'Occupation',
      occupationPlaceholder: 'Enter your occupation',
      state: 'State',
      statePlaceholder: 'Enter your state',
    },
    interests: {
      title: 'Interests & Preferences',
      placeholder: 'Add an interest (e.g., agriculture, education, health)',
      addButton: 'Add',
    },
    applications: {
      title: 'Previous Applications',
      placeholder: 'Add a previous application (e.g., PM Kisan, Ayushman Bharat)',
      addButton: 'Add',
    },
    saveButton: 'Save Profile',
    successMessage: 'Profile updated successfully!',
    errorMessage: 'Failed to update profile',
  },

  // Dashboard
  dashboard: {
    welcome: 'Welcome back,',
    subtitle: "Here's your personalized dashboard with scheme recommendations and insights.",
    stats: {
      profileCompletion: 'Profile Completion',
      availableSchemes: 'Available Schemes',
      serviceStatus: 'Service Status',
      successRate: 'Success Rate',
      active: 'Active',
      offline: 'Offline',
    },
    profileStatus: {
      title: 'Profile Status',
      completion: 'Completion',
      complete: 'Profile is complete!',
      incomplete: 'Complete your profile for better recommendations',
      updateButton: 'Update Profile',
      completeButton: 'Complete Profile',
    },
    quickActions: {
      title: 'Quick Actions',
      getRecommendations: 'Get Recommendations',
      quickRecommendations: 'Quick Recommendations',
      manageProfile: 'Manage Profile',
    },
    recentActivity: {
      title: 'Recent Activity',
      profileUpdated: 'Profile Updated',
      recommendationsGenerated: 'Recommendations Generated',
      accountCreated: 'Account Created',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
    },
    tips: {
      title: 'Tips & Insights',
      tip1: {
        title: 'Complete Your Profile',
        description: 'The more information you provide, the better our AI can match you with relevant schemes.',
      },
      tip2: {
        title: 'Check Regularly',
        description: 'New schemes are added frequently. Check back often for the latest opportunities.',
      },
      tip3: {
        title: 'Apply Early',
        description: 'Many schemes have limited seats or deadlines. Apply as soon as you find a suitable scheme.',
      },
    },
  },

  // Recommendations
  recommendations: {
    title: 'Scheme Recommendations',
    subtitle: 'Get personalized government scheme recommendations based on your profile and preferences.',
    serviceStatus: {
      status: 'Service Status',
      mlModel: 'ML Model',
      available: 'Available',
      unavailable: 'Unavailable',
    },
    actions: {
      personalized: {
        title: 'Personalized Recommendations',
        description: 'Get AI-powered recommendations based on your complete profile.',
        button: 'Get Recommendations',
        incomplete: 'Complete your profile for personalized recommendations',
      },
      quick: {
        title: 'Quick Recommendations',
        description: 'Get instant recommendations with minimal profile information.',
        button: 'Quick Search',
      },
      settings: {
        title: 'Settings',
        description: 'Customize the number of recommendations you want to see.',
        option1: '5 recommendations',
        option2: '10 recommendations',
        option3: '15 recommendations',
        option4: '20 recommendations',
      },
    },
    filters: {
      title: 'Filters & Search',
      search: 'Search Schemes',
      searchPlaceholder: 'Search by name, details, or benefits...',
      category: 'Category',
      allCategories: 'All Categories',
    },
    results: {
      found: 'Recommendation',
      foundPlural: 'Recommendations Found',
      clearFilters: 'Clear Filters',
      noResults: 'No Results Found',
      noResultsMessage: 'Try adjusting your search terms or filters to find more schemes.',
      noRecommendations: 'No Recommendations Yet',
      noRecommendationsMessage: 'Click the buttons above to get personalized scheme recommendations.',
      analyzing: 'Analyzing your profile and generating recommendations...',
    },
    card: {
      matchScore: 'Match Score',
      excellentMatch: 'Excellent Match',
      goodMatch: 'Good Match',
      fairMatch: 'Fair Match',
      lowMatch: 'Low Match',
      description: 'Description',
      benefits: 'Benefits',
      eligibility: 'Eligibility',
      applicationProcess: 'Application Process',
      requiredDocuments: 'Required Documents',
    },
    modals: {
      application: {
        title: 'Application Process',
        noInfo: 'Detailed application process information is not available for this scheme. Please contact the relevant department or visit the official portal for specific instructions.',
        importantNotes: 'Important Notes',
        note1: 'Ensure all information provided is accurate and up-to-date',
        note2: 'Keep copies of all submitted documents for your records',
        note3: 'Application deadlines vary by scheme - check official notifications',
        note4: 'Contact the helpline if you face any technical issues',
        visitPortal: 'Visit Official Portal',
      },
      documents: {
        title: 'Required Documents',
        noInfo: 'Specific document requirements are not available for this scheme. Please contact the relevant department or visit the official portal for detailed requirements.',
        guidelines: 'General Document Guidelines',
        guideline1: 'All documents should be clear, legible, and recent',
        guideline2: 'File size should not exceed 2MB per document',
        guideline3: 'Supported formats: PDF, JPG, PNG',
        guideline4: 'Ensure documents are not password protected',
        guideline5: 'Keep original documents ready for verification',
        downloadChecklist: 'Download Checklist',
      },
    },
  },

  // Messages
  messages: {
    success: {
      login: 'Login successful!',
      register: 'Registration successful!',
      profileUpdate: 'Profile updated successfully!',
      logout: 'Logged out successfully!',
    },
    error: {
      login: 'Login failed. Please check your credentials.',
      register: 'Registration failed. Please try again.',
      profileUpdate: 'Failed to update profile. Please try again.',
      network: 'Network error. Please check your connection.',
      generic: 'Something went wrong. Please try again.',
    },
  },
};

export default en;

