import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, recommendationsAPI } from '../services/api';
import { 
  BarChart3, 
  FileText, 
  User, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Star,
  Clock,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [profileResponse, serviceResponse] = await Promise.all([
        profileAPI.getProfileStatus(),
        recommendationsAPI.getServiceStatus()
      ]);
      
      setProfileStatus(profileResponse.data);
      setServiceStatus(serviceResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getQuickRecommendations = async () => {
    try {
      const response = await recommendationsAPI.getQuickRecommendations({
        age: user.profile.age || 25,
        occupation: user.profile.occupation || 'General',
        state: user.profile.state || 'India',
        interests: user.profile.interests || ['general']
      });
      
      if (response.data.recommendations.length > 0) {
        toast.success(`Found ${response.data.recommendations.length} quick recommendations!`);
      } else {
        toast.info('No quick recommendations available. Complete your profile for better results.');
      }
    } catch (error) {
      console.error('Failed to get quick recommendations:', error);
      toast.error('Failed to get quick recommendations');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading"></div>
      </div>
    );
  }

  const completionPercentage = profileStatus?.completionPercentage || 0;
  const isProfileComplete = profileStatus?.isComplete || false;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's your personalized dashboard with scheme recommendations and insights.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profile Completion</p>
              <p className="text-2xl font-bold text-blue-600">{completionPercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Schemes</p>
              <p className="text-2xl font-bold text-green-600">1000+</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Service Status</p>
              <p className="text-2xl font-bold text-purple-600">
                {serviceStatus?.serviceStatus === 'operational' ? 'Active' : 'Offline'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">95%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Status */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Status
          </h2>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completion</span>
              <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {isProfileComplete ? (
            <div className="flex items-center text-green-600 mb-4">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Profile is complete!</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-600 mb-4">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Complete your profile for better recommendations</span>
            </div>
          )}

          <Link
            to="/profile"
            className="btn btn-primary w-full justify-center"
          >
            <User className="w-4 h-4" />
            {isProfileComplete ? 'Update Profile' : 'Complete Profile'}
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            <Link
              to="/recommendations"
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-800">Get Recommendations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <button
              onClick={getQuickRecommendations}
              className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-800">Quick Recommendations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <Link
              to="/profile"
              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center">
                <User className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium text-gray-800">Manage Profile</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Profile Updated</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Recommendations Generated</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Account Created</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Tips & Insights
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Complete Your Profile</h3>
              <p className="text-sm text-blue-700">
                The more information you provide, the better our AI can match you with relevant schemes.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Check Regularly</h3>
              <p className="text-sm text-green-700">
                New schemes are added frequently. Check back often for the latest opportunities.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Apply Early</h3>
              <p className="text-sm text-purple-700">
                Many schemes have limited seats or deadlines. Apply as soon as you find a suitable scheme.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
