import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Save, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, loadUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    state: '',
    caste_group: '',
    occupation: '',
    income: '',
    interests: [],
    previous_applications: []
  });

  const [newInterest, setNewInterest] = useState('');
  const [newApplication, setNewApplication] = useState('');

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
  ];

  useEffect(() => {
    loadProfile();
    loadProfileStatus();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const profile = response.data.profile;
      
      setFormData({
        gender: profile.gender || '',
        age: profile.age || '',
        state: profile.state || '',
        caste_group: profile.caste_group || '',
        occupation: profile.occupation || '',
        income: profile.income || '',
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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    loadProfile();
    setCurrentStep(1);
    toast.success('Form reset to saved values');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.gender) {
          toast.error('Please select your gender');
          return false;
        }
        if (!formData.age || formData.age < 18 || formData.age > 100) {
          toast.error('Please enter a valid age (18-100)');
          return false;
        }
        return true;
      case 2:
        if (!formData.state) {
          toast.error('Please select your state');
          return false;
        }
        if (!formData.caste_group) {
          toast.error('Please select your caste group');
          return false;
        }
        return true;
      case 3:
        if (!formData.occupation) {
          toast.error('Please enter your occupation');
          return false;
        }
        return true;
      case 4:
        return true; // Interests and applications are optional
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Debug: Log what we're sending
      console.log('Submitting profile data:', {
        ...formData,
        interestsCount: formData.interests?.length || 0,
        interests: formData.interests
      });
      
      const response = await profileAPI.updateProfile(formData);
      console.log('Profile update response:', response.data);
      
      // Reload user data to get updated profile status
      await loadUser();
      toast.success('Profile updated successfully!');
      loadProfileStatus();
      // Redirect to dashboard after successful save
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
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

  const renderProgressIndicator = () => {
    return (
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex-1 flex items-center space-x-2 ml-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-green-500 text-white border-2 border-green-600 dark:border-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {step < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={`h-1 w-8 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          <span className="text-red-500">*</span>Gender
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['Male', 'Female', 'Transgender'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChange('gender', option.toLowerCase())}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.gender === option.toLowerCase()
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400'
                  : 'border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className="text-2xl">
                  {option === 'Male' && '♂'}
                  {option === 'Female' && '♀'}
                  {option === 'Transgender' && '⚧'}
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          <span className="text-red-500">*</span>Age
        </label>
        <div className="flex items-center space-x-2">
          <select
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-sm flex-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
          >
            <option value="" className="text-gray-600 dark:text-gray-400">--</option>
            {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
              <option key={age} value={age} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
                {age}
              </option>
            ))}
          </select>
          <span className="text-gray-600 dark:text-gray-400 text-sm">years</span>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          <span className="text-red-500">*</span>State
        </label>
        <select
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
        >
          <option value="" className="text-gray-600 dark:text-gray-400">--Select One--</option>
          {states.map((state) => (
            <option key={state} value={state} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
              {state}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          <span className="text-red-500">*</span>Caste Group
        </label>
        <select
          value={formData.caste_group}
          onChange={(e) => handleChange('caste_group', e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
        >
          <option value="" className="text-gray-600 dark:text-gray-400">--Select One--</option>
          <option value="General" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">General</option>
          <option value="OBC" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">Other Backward Class (OBC)</option>
          <option value="SC" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">Scheduled Caste (SC)</option>
          <option value="ST" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">Scheduled Tribe (ST)</option>
          <option value="Minority" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">Minority</option>
          <option value="Other" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">Other</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          <span className="text-red-500">*</span>Occupation
        </label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => handleChange('occupation', e.target.value)}
          placeholder="e.g., Student, Farmer, Engineer"
          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Annual Income (₹)
        </label>
        <input
          type="number"
          value={formData.income}
          onChange={(e) => handleChange('income', e.target.value)}
          placeholder="Enter your annual income"
          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          min="0"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Interests & Preferences
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            placeholder="e.g., agriculture, education, health"
            className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="button"
            onClick={addInterest}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            Add
          </button>
        </div>
        {formData.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Previous Applications
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newApplication}
            onChange={(e) => setNewApplication(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
            placeholder="e.g., PM Kisan, Ayushman Bharat"
            className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="button"
            onClick={addApplication}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            Add
          </button>
        </div>
        {formData.previous_applications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.previous_applications.map((application, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              >
                {application}
                <button
                  type="button"
                  onClick={() => removeApplication(application)}
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  const completionPercentage = profileStatus?.completionPercentage || 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Profile</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Complete your profile to get personalized scheme recommendations.</p>
      </div>

      {/* Profile Completion Status */}
      {profileStatus && (
        <div className="card p-4 mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Profile Completion</h2>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          {profileStatus.missingFields.length > 0 && (
            <div className="flex items-center text-xs text-gray-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              <span>Missing: {profileStatus.missingFields.join(', ')}</span>
            </div>
          )}
          {completionPercentage === 100 && (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Profile complete! You can now get personalized recommendations.</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        {renderProgressIndicator()}

        <div className="mb-6 min-h-[200px]">
          {renderCurrentStep()}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center space-x-1 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{currentStep === totalSteps ? 'Save Profile' : 'Next'}</span>
                {currentStep < totalSteps ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
