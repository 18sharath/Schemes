import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { recommendationsAPI, profileAPI } from '../services/api';
import { 
  FileText, 
  Star, 
  MapPin, 
  Calendar, 
  Download, 
  ExternalLink,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  X,
  FileCheck,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [topK, setTopK] = useState(10);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [profileStatus, setProfileStatus] = useState(null);
  const [eligibilityQuestions, setEligibilityQuestions] = useState([]);
  const [eligibilityAnswers, setEligibilityAnswers] = useState({});
  const [isEligible, setIsEligible] = useState(null);

  useEffect(() => {
    loadServiceStatus();
    loadProfileStatus();
    // Check if recommendations were passed from form
    if (location.state?.recommendations) {
      setRecommendations(location.state.recommendations);
      toast.success(`Found ${location.state.recommendations.length} recommendations!`);
    }
  }, [location.state, user]);

  // Reload profile status when navigating to this page
  useEffect(() => {
    loadProfileStatus();
  }, [location.pathname]);

  const filterRecommendations = React.useCallback(() => {
    let filtered = recommendations;

    if (searchTerm) {
      filtered = filtered.filter(rec => 
        rec.scheme_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.benefits?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec => 
        rec.schemeCategory?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredRecommendations(filtered);
  }, [recommendations, searchTerm, selectedCategory]);

  useEffect(() => {
    if (recommendations.length > 0) {
      filterRecommendations();
    }
  }, [recommendations, searchTerm, selectedCategory, filterRecommendations]);

  const loadServiceStatus = async () => {
    try {
      const response = await recommendationsAPI.getServiceStatus();
      setServiceStatus(response.data);
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  };

  const loadProfileStatus = async () => {
    try {
      const response = await profileAPI.getProfileStatus();
      setProfileStatus(response.data);
      console.log('Profile status loaded:', response.data); // Debug log
    } catch (error) {
      console.error('Failed to load profile status:', error);
    }
  };

  const getRecommendations = async () => {
    // Check profile status dynamically - try both profileStatus and user object
    let isComplete = profileStatus?.isComplete || user?.isProfileComplete || false;
    
    // If not complete, reload profile status one more time before showing error
    if (!isComplete) {
      try {
        const response = await profileAPI.getProfileStatus();
        const updatedStatus = response.data;
        setProfileStatus(updatedStatus);
        isComplete = updatedStatus?.isComplete || user?.isProfileComplete || false;
      } catch (error) {
        console.error('Failed to reload profile status:', error);
      }
      
      if (!isComplete) {
        toast.error('Please complete your profile first to get personalized recommendations.');
        return;
      }
    }

    setLoadingPersonalized(true);
    try {
      const response = await recommendationsAPI.getRecommendations(topK);
      setRecommendations(response.data.recommendations);
      toast.success(`Found ${response.data.recommendations.length} recommendations!`);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      toast.error('Failed to get recommendations. Please try again.');
    } finally {
      setLoadingPersonalized(false);
    }
  };

  const getQuickRecommendations = async () => {
    setLoadingQuick(true);
    try {
      const response = await recommendationsAPI.getQuickRecommendations({
        age: user.profile.age || 25,
        occupation: user.profile.occupation || 'General',
        state: user.profile.state || 'India',
        interests: user.profile.interests || ['general']
      });
      setRecommendations(response.data.recommendations);
      toast.success(`Found ${response.data.recommendations.length} quick recommendations!`);
    } catch (error) {
      console.error('Failed to get quick recommendations:', error);
      toast.error('Failed to get quick recommendations. Please try again.');
    } finally {
      setLoadingQuick(false);
    }
  };


  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreText = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Low Match';
  };

  const categories = [
    'all',
    ...new Set(recommendations.map(rec => rec.schemeCategory).filter(Boolean))
  ];

  const handleApplicationClick = (scheme) => {
    setSelectedScheme(scheme);
    setShowApplicationModal(true);
  };

  const handleDocumentsClick = (scheme) => {
    setSelectedScheme(scheme);
    setShowDocumentsModal(true);
  };

  const closeModals = () => {
    setShowApplicationModal(false);
    setShowDocumentsModal(false);
    setShowEligibilityModal(false);
    setSelectedScheme(null);
    setEligibilityQuestions([]);
    setEligibilityAnswers({});
    setIsEligible(null);
  };

  // Parse eligibility text into questions
  const parseEligibilityToQuestions = (eligibilityText) => {
    if (!eligibilityText) return [];

    const questions = [];
    
    // First, try to split by numbered lists (1., 2., 3., etc.)
    let items = eligibilityText.split(/(?=\d+[\.\)]\s)/);
    
    // If that didn't work, try splitting by newlines
    if (items.length === 1) {
      items = eligibilityText.split(/\n/).filter(line => line.trim());
    }
    
    items.forEach((item, index) => {
      // Remove numbering (1., 2., etc.) and bullet points
      let cleaned = item.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '').trim();
      
      // Skip empty lines or very short lines
      if (cleaned.length < 10) return;
      
      // Store original for sub-lists
      const originalText = cleaned;
      
      // Convert statement to question format
      let question = cleaned;
      
      // Handle "The applicant should/must..." patterns
      if (/the applicant (should|must)/i.test(cleaned)) {
        question = cleaned.replace(/the applicant (should|must)/i, 'Do you');
      } else if (/applicant (should|must)/i.test(cleaned)) {
        question = cleaned.replace(/applicant (should|must)/i, 'Do you');
      } 
      // Handle "should be/must be" patterns
      else if (/should be/i.test(cleaned)) {
        question = cleaned.replace(/should be/i, 'Are you');
      } else if (/must be/i.test(cleaned)) {
        question = cleaned.replace(/must be/i, 'Are you');
      } 
      // Handle "should have/must have" patterns
      else if (/must have/i.test(cleaned)) {
        question = cleaned.replace(/must have/i, 'Do you have');
      } else if (/should have/i.test(cleaned)) {
        question = cleaned.replace(/should have/i, 'Do you have');
      }
      // Handle "have you" patterns (already questions)
      else if (/^have you/i.test(cleaned)) {
        question = cleaned;
      }
      // Handle "belong to" patterns
      else if (/belong to/i.test(cleaned)) {
        question = cleaned.replace(/.*belong to/i, 'Do you belong to');
      }
      // Handle "resident of" patterns
      else if (/resident of/i.test(cleaned)) {
        question = cleaned.replace(/.*resident of/i, 'Are you a resident of');
      }
      // Handle "above/below" age patterns
      else if (/(above|below|at least|minimum|maximum).*\d+/i.test(cleaned)) {
        question = cleaned.replace(/.*(above|below|at least|minimum|maximum)/i, 'Are you');
      }
      // Handle "hold" patterns (documents, licenses, etc.)
      else if (/hold/i.test(cleaned)) {
        question = cleaned.replace(/.*hold/i, 'Do you hold');
      }
      // Default: prepend "Do you" if it doesn't start with a question word
      else if (!/^(do you|are you|have you|did you|will you)/i.test(cleaned)) {
        // Remove "The" if it starts with it
        if (/^the /i.test(cleaned)) {
          cleaned = cleaned.substring(4);
        }
        question = 'Do you ' + cleaned.toLowerCase();
      }
      
      // Capitalize first letter
      question = question.charAt(0).toUpperCase() + question.slice(1);
      
      // Add question mark if not present
      if (!question.endsWith('?') && !question.endsWith('.')) {
        question += '?';
      } else if (question.endsWith('.')) {
        question = question.slice(0, -1) + '?';
      }
      
      questions.push({
        id: index,
        question: question,
        originalText: originalText
      });
    });
    
    // If no questions were generated, create a single question from the whole text
    if (questions.length === 0 && eligibilityText.trim().length > 0) {
      questions.push({
        id: 0,
        question: 'Do you meet the eligibility criteria for this scheme?',
        originalText: eligibilityText
      });
    }
    
    return questions;
  };

  const handleEligibilityClick = (scheme) => {
    if (!scheme.eligibility) {
      toast.error('Eligibility information is not available for this scheme.');
      return;
    }
    
    setSelectedScheme(scheme);
    const questions = parseEligibilityToQuestions(scheme.eligibility);
    setEligibilityQuestions(questions);
    setEligibilityAnswers({});
    setIsEligible(null);
    setShowEligibilityModal(true);
  };

  const handleEligibilityAnswer = (questionId, answer) => {
    setEligibilityAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    setIsEligible(null); // Reset eligibility status when answer changes
  };

  const handleEligibilitySubmit = () => {
    // Check if all questions are answered
    if (eligibilityQuestions.length === 0) {
      toast.error('No eligibility questions available.');
      return;
    }
    
    const allAnswered = eligibilityQuestions.every(q => eligibilityAnswers[q.id] !== undefined);
    if (!allAnswered) {
      toast.error('Please answer all questions before submitting.');
      return;
    }
    
    // Check if all answers are "Yes"
    const allYes = eligibilityQuestions.every(q => eligibilityAnswers[q.id] === 'yes');
    setIsEligible(allYes);
    
    if (allYes) {
      toast.success('Congratulations! You are eligible for this scheme.');
    } else {
      toast.error('You may not be eligible for this scheme based on your answers.');
    }
  };

  const handleEligibilityReset = () => {
    setEligibilityAnswers({});
    setIsEligible(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Scheme Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Get personalized government scheme recommendations based on your profile and preferences.
        </p>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <div className="card p-4 mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {serviceStatus.serviceStatus === 'operational' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              )}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Service Status: {serviceStatus.serviceStatus === 'operational' ? 'Active' : 'Offline'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ML Model: {serviceStatus.modelInfo?.isAvailable ? 'Available' : 'Unavailable'}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Personalized Recommendations</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get AI-powered recommendations based on your complete profile.
          </p>
          <button
            onClick={getRecommendations}
            disabled={loadingPersonalized || (!profileStatus?.isComplete && !user?.isProfileComplete)}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPersonalized ? (
              <div className="loading"></div>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Get Recommendations
              </>
            )}
          </button>
          {!profileStatus?.isComplete && !user?.isProfileComplete && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Complete your profile for personalized recommendations
            </p>
          )}
        </div>

        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Quick Recommendations</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get instant recommendations with minimal profile information.
          </p>
          <button
            onClick={getQuickRecommendations}
            disabled={loadingQuick}
            className="btn btn-secondary w-full"
          >
            {loadingQuick ? (
              <div className="loading"></div>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Quick Search
              </>
            )}
          </button>
        </div>

        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Customize the number of recommendations you want to see.
          </p>
          <select
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="form-select w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            <option value={5}>5 recommendations</option>
            <option value={10}>10 recommendations</option>
            <option value={15}>15 recommendations</option>
            <option value={20}>20 recommendations</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      {recommendations.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Search Schemes</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Search by name, details, or benefits..."
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {(loadingPersonalized || loadingQuick) && (
        <div className="text-center py-12">
          <div className="loading mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Analyzing your profile and generating recommendations...</p>
        </div>
      )}

      {!loadingPersonalized && !loadingQuick && filteredRecommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {filteredRecommendations.length} Recommendation{filteredRecommendations.length !== 1 ? 's' : ''} Found
            </h2>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn btn-outline btn-sm"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          </div>

          {filteredRecommendations.map((rec, index) => (
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {rec.scheme_name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rec.level && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {rec.level}
                      </span>
                    )}
                    {rec.schemeCategory && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        {rec.schemeCategory}
                      </span>
                    )}
                  </div>
                </div>
                
                {rec.score_hybrid && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(rec.score_hybrid)}`}>
                    {getScoreText(rec.score_hybrid)}
                  </div>
                )}
              </div>

              {rec.details && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {rec.details.length > 200 ? `${rec.details.substring(0, 200)}...` : rec.details}
                  </p>
                </div>
              )}

              {rec.benefits && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Benefits</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {rec.benefits.length > 200 ? `${rec.benefits.substring(0, 200)}...` : rec.benefits}
                  </p>
                </div>
              )}

              {rec.eligibility && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Eligibility</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {rec.eligibility.length > 200 ? `${rec.eligibility.substring(0, 200)}...` : rec.eligibility}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {rec.tags && rec.tags.split(',').map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4 flex-wrap gap-2">
                  {rec.eligibility && (
                    <button 
                      onClick={() => handleEligibilityClick(rec)}
                      className="btn btn-primary btn-sm"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Check Eligibility
                    </button>
                  )}
                  {rec.application && (
                    <button 
                      onClick={() => handleApplicationClick(rec)}
                      className="btn btn-outline btn-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Application Process
                    </button>
                  )}
                  {rec.documents && (
                    <button 
                      onClick={() => handleDocumentsClick(rec)}
                      className="btn btn-outline btn-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Required Documents
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="w-4 h-4" />
                  <span>Match Score: {rec.score_hybrid ? (rec.score_hybrid * 100).toFixed(1) : 'N/A'}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingPersonalized && !loadingQuick && recommendations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Click the buttons above to get personalized scheme recommendations.
          </p>
        </div>
      )}

      {!loadingPersonalized && !loadingQuick && recommendations.length > 0 && filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Results Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Try adjusting your search terms or filters to find more schemes.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="btn btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Application Process Modal */}
      {showApplicationModal && selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Application Process
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedScheme.scheme_name}
                </h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedScheme.level}</p>
                  {selectedScheme.schemeCategory && (
                    <>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        {selectedScheme.schemeCategory}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {selectedScheme.application ? (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Application Process:</h5>
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {selectedScheme.application}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Application Process:</h5>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        Detailed application process information is not available for this scheme. 
                        Please contact the relevant department or visit the official portal for specific instructions.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Important Notes:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                    <li>Ensure all information provided is accurate and up-to-date</li>
                    <li>Keep copies of all submitted documents for your records</li>
                    <li>Application deadlines vary by scheme - check official notifications</li>
                    <li>Contact the helpline if you face any technical issues</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModals}
                    className="btn btn-outline"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Redirecting to official portal...');
                      closeModals();
                    }}
                    className="btn btn-primary"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Visit Official Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check Eligibility Modal */}
      {showEligibilityModal && selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Check Eligibility
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {selectedScheme.scheme_name}
                </h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedScheme.level}</p>
                  {selectedScheme.schemeCategory && (
                    <>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        {selectedScheme.schemeCategory}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {isEligible === true && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                    <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                      You are eligible for this scheme!
                    </p>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                    Based on your answers, you meet all the eligibility criteria. You can proceed with the application.
                  </p>
                </div>
              )}

              {isEligible === false && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-lg font-semibold text-red-800 dark:text-red-300">
                      You may not be eligible for this scheme
                    </p>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                    Based on your answers, you may not meet all the eligibility criteria. Please review the requirements or contact the scheme administrator for clarification.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {eligibilityQuestions.length > 0 ? (
                  eligibilityQuestions.map((q, index) => (
                    <div key={q.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                        {q.question}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      
                      {/* Show sub-list if original text contains list items */}
                      {(q.originalText.toLowerCase().includes('following') || 
                        q.originalText.toLowerCase().includes('one of') ||
                        q.originalText.includes('Universities') ||
                        q.originalText.includes('Institutions') ||
                        q.originalText.includes('Colleges')) && (
                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                          {/* Try to extract list items from the original text */}
                          {(() => {
                            // Look for patterns like "one of the following:" followed by list items
                            const followingMatch = q.originalText.match(/following[:\s]+(.*)/is);
                            if (followingMatch) {
                              const listText = followingMatch[1];
                              // Split by common list separators
                              const items = listText
                                .split(/(?:Universities|Institutions|Colleges|Institutes)/i)
                                .filter(item => item.trim().length > 10)
                                .map(item => {
                                  // Clean up the item
                                  let cleaned = item.replace(/^[\.\)]\s*/, '').trim();
                                  // Add back the keyword if it was split
                                  if (cleaned && !cleaned.match(/^(Universities|Institutions|Colleges|Institutes)/i)) {
                                    const prevMatch = listText.substring(0, listText.indexOf(item)).match(/(Universities|Institutions|Colleges|Institutes)/i);
                                    if (prevMatch) {
                                      cleaned = prevMatch[1] + ' ' + cleaned;
                                    }
                                  }
                                  return cleaned;
                                })
                                .filter(item => item.length > 10);
                              
                              if (items.length > 0) {
                                return (
                                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                    {items.map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                );
                              }
                            }
                            
                            // Fallback: show the original text in a formatted way
                            return (
                              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Details:</p>
                                <p className="text-sm">{q.originalText}</p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      <div className="flex space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`eligibility-${q.id}`}
                            value="yes"
                            checked={eligibilityAnswers[q.id] === 'yes'}
                            onChange={() => handleEligibilityAnswer(q.id, 'yes')}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`eligibility-${q.id}`}
                            value="no"
                            checked={eligibilityAnswers[q.id] === 'no'}
                            onChange={() => handleEligibilityAnswer(q.id, 'no')}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">No</span>
                        </label>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Unable to parse eligibility criteria. Please review the eligibility section manually.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleEligibilityReset}
                    className="btn btn-outline"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleEligibilitySubmit}
                    disabled={eligibilityQuestions.length === 0 || !eligibilityQuestions.every(q => eligibilityAnswers[q.id] !== undefined)}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Required Documents Modal */}
      {showDocumentsModal && selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2" />
                  Required Documents
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedScheme.scheme_name}
                </h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedScheme.level}</p>
                  {selectedScheme.schemeCategory && (
                    <>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        {selectedScheme.schemeCategory}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {selectedScheme.documents ? (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Required Documents:</h5>
                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {selectedScheme.documents}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Required Documents:</h5>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        Specific document requirements are not available for this scheme. 
                        Please contact the relevant department or visit the official portal for detailed requirements.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">General Document Guidelines:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                    <li>All documents should be clear, legible, and recent</li>
                    <li>File size should not exceed 2MB per document</li>
                    <li>Supported formats: PDF, JPG, PNG</li>
                    <li>Ensure documents are not password protected</li>
                    <li>Keep original documents ready for verification</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModals}
                    className="btn btn-outline"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Document checklist downloaded!');
                      closeModals();
                    }}
                    className="btn btn-primary"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download Checklist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
