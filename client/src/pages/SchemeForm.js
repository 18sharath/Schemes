import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Info, RotateCcw } from 'lucide-react';
import { recommendationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SchemeForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const totalSteps = 7;
  
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    state: '',
    area: '',
    caste: '',
    disability: '',
    minority: '',
    student: '',
    bpl: '',
    familyIncome: '',
    parentIncome: ''
  });

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
  ];

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

  const handleSkipToResults = () => {
    handleSubmit();
  };

  const handleReset = () => {
    setFormData({
      gender: '',
      age: '',
      state: '',
      area: '',
      caste: '',
      disability: '',
      minority: '',
      student: '',
      bpl: '',
      familyIncome: '',
      parentIncome: ''
    });
    setCurrentStep(1);
    toast.success('Form reset successfully');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.gender) {
          toast.error('Please select your gender');
          return false;
        }
        if (!formData.age || formData.age < 1 || formData.age > 120) {
          toast.error('Please enter a valid age');
          return false;
        }
        return true;
      case 2:
        if (!formData.state) {
          toast.error('Please select your state');
          return false;
        }
        if (!formData.area) {
          toast.error('Please select your area of residence');
          return false;
        }
        return true;
      case 3:
        if (!formData.caste) {
          toast.error('Please select your caste/community');
          return false;
        }
        return true;
      case 4:
        if (!formData.disability) {
          toast.error('Please answer the disability question');
          return false;
        }
        if (!formData.minority) {
          toast.error('Please answer the minority question');
          return false;
        }
        return true;
      case 5:
        if (!formData.student) {
          toast.error('Please answer the student question');
          return false;
        }
        return true;
      case 6:
        if (!formData.bpl) {
          toast.error('Please answer the BPL question');
          return false;
        }
        if (!formData.familyIncome || formData.familyIncome < 0) {
          toast.error('Please enter a valid family income');
          return false;
        }
        if (!formData.parentIncome || formData.parentIncome < 0) {
          toast.error('Please enter a valid parent/guardian income');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Map form data to API format
      const profileData = {
        gender: formData.gender.toLowerCase(),
        age: parseInt(formData.age),
        state: formData.state,
        caste_group: mapCasteToAPI(formData.caste),
        income: parseFloat(formData.familyIncome) || parseFloat(formData.parentIncome) || 0,
        occupation: formData.student === 'Yes' ? 'Student' : 'General',
        interests: []
      };

      // Add interests based on selections
      if (formData.disability === 'Yes') {
        profileData.interests.push('disability');
      }
      if (formData.minority === 'Yes') {
        profileData.interests.push('minority');
      }
      if (formData.bpl === 'Yes') {
        profileData.interests.push('bpl');
      }

      // Get recommendations using quick recommendations API
      const response = await recommendationsAPI.getQuickRecommendations(profileData);
      
      // Navigate to recommendations page with data
      navigate('/recommendations', { 
        state: { 
          recommendations: response.data.recommendations,
          formData: profileData
        } 
      });
      
      toast.success('Recommendations generated successfully!');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to get recommendations');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to get recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const mapCasteToAPI = (caste) => {
    const mapping = {
      'General': 'General',
      'OBC': 'OBC',
      'PVTG': 'ST',
      'SC': 'SC',
      'ST': 'ST',
      'DNT': 'Other'
    };
    return mapping[caste] || 'General';
  };

  const renderProgressIndicator = () => {
    return (
      <div className="flex items-center space-x-2 mb-8">
        <button
          onClick={handleBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex-1 flex items-center space-x-2 ml-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-green-500 text-white border-2 border-green-600 dark:border-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {step < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={`h-1 w-12 ${
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
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <span className="text-red-500">*</span>Tell us about yourself, you are a...
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['Male', 'Female', 'Transgender'].map((option) => (
            <button
              key={option}
              onClick={() => handleChange('gender', option)}
              className={`p-6 rounded-lg border-2 transition-all ${
                formData.gender === option
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400'
                  : 'border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="text-3xl">
                  {option === 'Male' && '♂'}
                  {option === 'Female' && '♀'}
                  {option === 'Transgender' && '⚧'}
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <span className="text-red-500">*</span>and your age is
        </label>
        <div className="flex items-center space-x-2">
          <select
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
          >
            <option value="" className="text-gray-600 dark:text-gray-400">--</option>
            {Array.from({ length: 103 }, (_, i) => i + 18).map((age) => (
              <option key={age} value={age} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
                {age}
              </option>
            ))}
          </select>
          <span className="text-gray-600 dark:text-gray-400">years</span>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Please select your state
        </label>
        <select
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
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
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <span className="text-red-500">*</span>Please select your area of residence
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['Urban', 'Rural'].map((option) => (
            <button
              key={option}
              onClick={() => handleChange('area', option)}
              className={`px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                formData.area === option
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        <span className="text-red-500">*</span>You belong to...
      </label>
      <div className="space-y-3">
        {[
          'General',
          'Other Backward Class (OBC)',
          'Particularly Vulnerable Tribal Group (PVTG)',
          'Scheduled Caste (SC)',
          'Scheduled Tribe (ST)',
          'De-Notified, Nomadic, and Semi-Nomadic (DNT) communities'
        ].map((option) => (
          <button
            key={option}
            onClick={() => handleChange('caste', option.split('(')[0].trim())}
            className={`w-full px-6 py-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
              formData.caste === option.split('(')[0].trim()
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-700 dark:text-green-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <span className="font-medium">{option}</span>
            <Info className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
          <span className="text-red-500">*</span>
          <span>Do you identify as a person with a disability?</span>
          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Info className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              onClick={() => handleChange('disability', option)}
              className={`px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                formData.disability === option
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
          <span className="text-red-500">*</span>
          <span>Do you belong to minority?</span>
          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Info className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              onClick={() => handleChange('minority', option)}
              className={`px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                formData.minority === option
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        <span className="text-red-500">*</span>Are you a student?
      </label>
      <div className="grid grid-cols-2 gap-4">
        {['Yes', 'No'].map((option) => (
          <button
            key={option}
            onClick={() => handleChange('student', option)}
            className={`px-6 py-4 rounded-lg border-2 transition-all font-medium ${
              formData.student === option
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-700 dark:text-green-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <span className="text-red-500">*</span>Do you belong to BPL category?
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              onClick={() => handleChange('bpl', option)}
              className={`px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                formData.bpl === option
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          What is your family's annual income?
        </label>
        <input
          type="number"
          value={formData.familyIncome}
          onChange={(e) => handleChange('familyIncome', e.target.value)}
          placeholder="Enter amount in ₹"
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          What is your parent / guardian's annual income?
        </label>
        <input
          type="number"
          value={formData.parentIncome}
          onChange={(e) => handleChange('parentIncome', e.target.value)}
          placeholder="Enter amount in ₹"
          className="w-full px-4 py-3 border-2 border-blue-500 dark:border-blue-400 rounded-lg focus:border-green-500 dark:focus:border-green-400 focus:outline-none text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
        />
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
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Help us find the best schemes for you
          </h1>

          {renderProgressIndicator()}

          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSkipToResults}
              className="px-6 py-3 border-2 border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              Skip to Results
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === totalSteps ? 'Submit' : 'Next'}</span>
              {currentStep < totalSteps && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={handleReset}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center space-x-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeForm;

