import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { User, Save, CheckCircle, AlertCircle, MapPin, Briefcase, DollarSign, Users, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    caste_group: '',
    occupation: '',
    gender: '',
    state: '',
    interests: [],
    previous_applications: []
  });
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [newInterest, setNewInterest] = useState('');
  const [newApplication, setNewApplication] = useState('');

  useEffect(() => {
    loadProfile();
    loadProfileStatus();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const profile = response.data.profile;
      
      setFormData({
        age: profile.age || '',
        income: profile.income || '',
        caste_group: profile.caste_group || '',
        occupation: profile.occupation || '',
        gender: profile.gender || '',
        state: profile.state || '',
        interests: profile.interests || [],
        previous_applications: profile.previous_applications || []
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const loadProfileStatus = async () => {
    try {
      const response = await profileAPI.getProfileStatus();
      setProfileStatus(response.data);
    } catch (error) {
      console.error('Failed to load profile status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await profileAPI.updateProfile(formData);
      updateUser({ ...user, profile: response.data.profile });
      toast.success('Profile updated successfully!');
      loadProfileStatus();
      // Navigate back to the previous page if possible, otherwise to dashboard
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const addApplication = () => {
    if (newApplication.trim() && !formData.previous_applications.includes(newApplication.trim())) {
      setFormData({
        ...formData,
        previous_applications: [...formData.previous_applications, newApplication.trim()]
      });
      setNewApplication('');
    }
  };

  const removeApplication = (application) => {
    setFormData({
      ...formData,
      previous_applications: formData.previous_applications.filter(a => a !== application)
    });
  };

  const completionPercentage = profileStatus?.completionPercentage || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Complete your profile to get personalized scheme recommendations.</p>
      </div>

      {/* Profile Completion Status */}
      {profileStatus && (
        <div className="card p-6 mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile Completion</h2>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          {profileStatus.missingFields.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>Missing: {profileStatus.missingFields.join(', ')}</span>
            </div>
          )}
          {completionPercentage === 100 && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Profile complete! You can now get personalized recommendations.</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="form-input bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder={formData.age ? "" : "Enter your age"}
                min="18"
                max="100"
              />
            </div>

            <div>
              <label className="form-label">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="form-label">Annual Income (₹)</label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none z-10 ${
                  formData.income ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="form-input pl-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder={formData.income ? "" : "Enter your annual income"}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Caste Group</label>
              <select
                name="caste_group"
                value={formData.caste_group}
                onChange={handleChange}
                className="form-select bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Caste Group</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="Minority">Minority</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="form-label">Occupation</label>
              <div className="relative">
                <Briefcase className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none z-10 ${
                  formData.occupation ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="form-input pl-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder={formData.occupation ? "" : "Enter your occupation"}
                />
              </div>
            </div>

            <div>
              <label className="form-label">State</label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none z-10 ${
                  formData.state ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input pl-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder={formData.state ? "" : "Enter your state"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Interests & Preferences
          </h2>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="form-input flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Add an interest (e.g., agriculture, education, health)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <button
                type="button"
                onClick={addInterest}
                className="btn btn-primary"
              >
                Add
              </button>
            </div>
          </div>

          {formData.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Previous Applications */}
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Previous Applications
          </h2>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newApplication}
                onChange={(e) => setNewApplication(e.target.value)}
                className="form-input flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Add a previous application (e.g., PM Kisan, Ayushman Bharat)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
              />
              <button
                type="button"
                onClick={addApplication}
                className="btn btn-primary"
              >
                Add
              </button>
            </div>
          </div>

          {formData.previous_applications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.previous_applications.map((application, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {application}
                  <button
                    type="button"
                    onClick={() => removeApplication(application)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? (
              <div className="loading"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
