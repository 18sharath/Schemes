import React, { useState, useEffect, useMemo } from 'react';
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
  Target,
  PieChart as PieChartIcon,
  Heart
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  useEffect(() => {
    loadDashboardData();
    
    // Refresh activity data periodically to update "time ago" labels
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  // Calculate activity data for pie chart
  const activityData = useMemo(() => {
    if (!user) return [];

    const now = new Date();
    const activities = [];

    // Account Created - use createdAt or fallback to a default date
    const accountCreated = user.createdAt 
      ? new Date(user.createdAt) 
      : (user._id ? new Date() : null); // If user exists but no createdAt, use current time as fallback
    
    if (accountCreated) {
      const accountAge = now - accountCreated;
      activities.push({
        name: 'Account Created',
        value: accountAge,
        timestamp: accountCreated,
        color: '#9333ea' // purple
      });
    }

    // Profile Updated - use updatedAt or createdAt as fallback
    const profileUpdated = user.updatedAt 
      ? new Date(user.updatedAt) 
      : (user.createdAt ? new Date(user.createdAt) : null);
    
    if (profileUpdated) {
      const profileAge = now - profileUpdated;
      activities.push({
        name: 'Profile Updated',
        value: profileAge,
        timestamp: profileUpdated,
        color: '#10b981' // green
      });
    }

    // Recommendations Generated
    try {
      const userId = user?.id || user?._id || 'anonymous';
      const timestampKey = `recommendations_timestamp_${userId}`;
      const recTimestamp = localStorage.getItem(timestampKey);
      if (recTimestamp) {
        const recGenerated = new Date(recTimestamp);
        const recAge = now - recGenerated;
        activities.push({
          name: 'Recommendations Generated',
          value: recAge,
          timestamp: recGenerated,
          color: '#3b82f6' // blue
        });
      }
    } catch (error) {
      console.error('Error loading recommendations timestamp:', error);
    }

    // Sort by timestamp (oldest first)
    activities.sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate distribution based on recency (more recent = larger slice)
    // Use inverse of time difference so recent activities get larger portions
    const maxTime = Math.max(...activities.map(a => a.value), 1);
    const totalInverse = activities.reduce((sum, act) => sum + (maxTime / Math.max(act.value, 1)), 0);
    
    if (totalInverse === 0 || activities.length === 0) return [];

    return activities.map(act => {
      const inverseValue = maxTime / Math.max(act.value, 1);
      const percentage = Math.max(5, Math.round((inverseValue / totalInverse) * 100)); // Minimum 5% for visibility
      return {
        ...act,
        value: percentage,
        timeAgo: getTimeAgo(act.timestamp)
      };
    });
  }, [user, refreshKey]);

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

            <Link
              to="/bookmarks"
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-600 mr-3 fill-current" />
                <span className="font-medium text-gray-800">My Bookmarks</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2" />
            Activity Distribution
          </h2>
          
          {activityData.length > 0 ? (
            <div className="space-y-4">
              {/* Pie Chart */}
              <div className="flex justify-center items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        const percentage = (percent * 100).toFixed(0);
                        return percentage >= 10 ? `${percentage}%` : ''; // Only show label if >= 10% for readability
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${props.payload.timeAgo}`,
                        props.payload.name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px',
                        color: '#111827'
                      }}
                      labelStyle={{
                        color: '#111827',
                        fontWeight: '600'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontSize: '12px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Activity List */}
              <div className="space-y-3 mt-4">
                {activityData.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: activity.color }}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {activity.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.timeAgo}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {activity.value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No activity data available yet</p>
            </div>
          )}
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
