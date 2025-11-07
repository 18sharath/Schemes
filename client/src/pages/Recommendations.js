import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { recommendationsAPI } from '../services/api';
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
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    loadServiceStatus();
  }, []);

  useEffect(() => {
    if (recommendations.length > 0) {
      filterRecommendations();
    }
  }, [recommendations, searchTerm, selectedCategory]);

  const loadServiceStatus = async () => {
    try {
      const response = await recommendationsAPI.getServiceStatus();
      setServiceStatus(response.data);
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  };

  const getRecommendations = async () => {
    if (!user.isProfileComplete) {
      toast.error('Please complete your profile first to get personalized recommendations.');
      return;
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

  const filterRecommendations = () => {
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
    setSelectedScheme(null);
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
            disabled={loadingPersonalized || !user.isProfileComplete}
            className="btn btn-primary w-full"
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
          {!user.isProfileComplete && (
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
            <h2 className="text-xl font-semibold text-gray-800">
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
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                  <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {rec.details.length > 200 ? `${rec.details.substring(0, 200)}...` : rec.details}
                  </p>
                </div>
              )}

              {rec.benefits && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Benefits</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {rec.benefits.length > 200 ? `${rec.benefits.substring(0, 200)}...` : rec.benefits}
                  </p>
                </div>
              )}

              {rec.eligibility && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Eligibility</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {rec.eligibility.length > 200 ? `${rec.eligibility.substring(0, 200)}...` : rec.eligibility}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {rec.tags && rec.tags.split(',').map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-4">
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
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
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
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Results Found</h3>
          <p className="text-gray-600 mb-6">
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
                    <h5 className="font-medium text-gray-800 mb-2">Application Process:</h5>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedScheme.application}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Application Process:</h5>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 italic">
                        Detailed application process information is not available for this scheme. 
                        Please contact the relevant department or visit the official portal for specific instructions.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Important Notes:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
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
                    <h5 className="font-medium text-gray-800 mb-2">Required Documents:</h5>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedScheme.documents}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Required Documents:</h5>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 italic">
                        Specific document requirements are not available for this scheme. 
                        Please contact the relevant department or visit the official portal for detailed requirements.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">General Document Guidelines:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
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
