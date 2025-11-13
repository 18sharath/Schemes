import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, 
  Shield, 
  Target, 
  Users, 
  CheckCircle, 
  Star,
  FileText,
  BarChart3,
  User
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Target,
      title: 'Personalized Recommendations',
      description: 'Get scheme recommendations tailored to your profile, interests, and eligibility criteria.'
    },
    {
      icon: Shield,
      title: 'Verified Information',
      description: 'Access accurate and up-to-date information about government schemes and programs.'
    },
    {
      icon: Users,
      title: 'Easy Application',
      description: 'Find application procedures, required documents, and direct links to apply.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 transition-colors"></div>
        <div
          className="absolute inset-0 opacity-50 dark:opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(59,130,246,0.25), transparent 30%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.2), transparent 35%)'
          }}
        ></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:text-yellow-300 dark:bg-none">
              Government Scheme
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-600 dark:text-indigo-200/80 max-w-3xl mx-auto">
            Get personalized recommendations for government schemes based on your profile, 
            interests, and eligibility. Make informed decisions with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn btn-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md dark:bg-white dark:text-blue-700 dark:hover:bg-gray-100"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md dark:bg-yellow-400 dark:text-blue-900 dark:hover:bg-yellow-300"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-lg btn-outline border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white dark:border-white dark:text-white dark:hover:bg-white/10"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We make finding and applying for government schemes simple, fast, and personalized.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm dark:shadow-none">
                <div className="w-16 h-16 bg-blue-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get your personalized recommendations in just three simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 dark:bg-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Create Your Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us about yourself - your age, occupation, income, and interests.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 dark:bg-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Get AI Recommendations
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI analyzes your profile and suggests the most relevant schemes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 dark:bg-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Apply & Benefit
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Follow our step-by-step guides to apply for your recommended schemes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6 drop-shadow">
            Ready to Find Your Perfect Scheme?
          </h2>
          <p className="text-xl mb-8 text-blue-100 dark:text-indigo-200/80 max-w-2xl mx-auto">
            Join thousands of users who have already discovered and applied for 
            government schemes that match their needs.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-lg bg-yellow-400 text-blue-900 hover:bg-yellow-300">
              Start Your Journey Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
