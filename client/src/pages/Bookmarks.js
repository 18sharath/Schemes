import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookmarksAPI } from '../services/api';
import { 
  Heart, 
  FileText, 
  Star, 
  MapPin, 
  Download, 
  ExternalLink,
  Search,
  Target,
  ClipboardList,
  FileCheck,
  X,
  Trash2,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    filterBookmarks();
  }, [bookmarks, searchTerm]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const response = await bookmarksAPI.getBookmarks();
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const filterBookmarks = () => {
    let filtered = bookmarks;

    if (searchTerm) {
      filtered = filtered.filter(bookmark => 
        bookmark.scheme_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.benefits?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookmarks(filtered);
  };

  const handleRemoveBookmark = async (schemeName) => {
    try {
      await bookmarksAPI.removeBookmark(schemeName);
      setBookmarks(prev => prev.filter(b => b.scheme_name !== schemeName));
      toast.success('Bookmark removed successfully');
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const handleTestReminder = async () => {
    try {
      const response = await bookmarksAPI.testReminder();
      toast.success('Test reminder email sent! Check your inbox.');
    } catch (error) {
      console.error('Failed to send test reminder:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to send test reminder. Please check server logs.';
      toast.error(errorMessage);
    }
  };

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

  const handleVisitOfficialPage = (scheme) => {
    if (!scheme) return;

    const url = scheme.url || 
                scheme.official_url || 
                scheme.website || 
                scheme.official_website || 
                scheme.link || 
                scheme.official_link ||
                scheme.portal_url ||
                scheme.application_url;

    if (url) {
      let finalUrl = url.trim();
      if (!finalUrl.match(/^https?:\/\//i)) {
        finalUrl = 'https://' + finalUrl;
      }
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening official website...');
    } else {
      const searchQuery = encodeURIComponent(`${scheme.scheme_name} ${scheme.level || ''} government scheme official website`.trim());
      const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
      window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
      toast.success('Searching for official website...');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-500 fill-current" />
              My Bookmarked Schemes
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your favorite schemes saved for easy access. You have {bookmarks.length} bookmarked scheme{bookmarks.length !== 1 ? 's' : ''}.
            </p>
          </div>
          <button
            onClick={handleTestReminder}
            className="btn btn-outline flex items-center"
            title="Send a test bookmark reminder email to your registered email address"
          >
            <Mail className="w-4 h-4 mr-2" />
            Test Email Reminder
          </button>
        </div>
      </div>

      {/* Search */}
      {bookmarks.length > 0 && (
        <div className="card p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
              placeholder="Search your bookmarks..."
            />
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      {filteredBookmarks.length > 0 ? (
        <div className="space-y-6">
          {filteredBookmarks.map((bookmark, index) => (
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {bookmark.scheme_name}
                    </h3>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.scheme_name)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      title="Remove bookmark"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {bookmark.level && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {bookmark.level}
                      </span>
                    )}
                    {bookmark.schemeCategory && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        {bookmark.schemeCategory}
                      </span>
                    )}
                    {bookmark.bookmarkedAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {bookmark.score_hybrid && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(bookmark.score_hybrid)}`}>
                    {getScoreText(bookmark.score_hybrid)}
                  </div>
                )}
              </div>

              {bookmark.details && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {bookmark.details.length > 200 ? `${bookmark.details.substring(0, 200)}...` : bookmark.details}
                  </p>
                </div>
              )}

              {bookmark.benefits && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Benefits</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {bookmark.benefits.length > 200 ? `${bookmark.benefits.substring(0, 200)}...` : bookmark.benefits}
                  </p>
                </div>
              )}

              {bookmark.eligibility && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Eligibility</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {bookmark.eligibility.length > 200 ? `${bookmark.eligibility.substring(0, 200)}...` : bookmark.eligibility}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {bookmark.tags && bookmark.tags.split(',').map((tag, tagIndex) => (
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
                  <button 
                    onClick={() => handleVisitOfficialPage(bookmark)}
                    className="btn btn-primary btn-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Visit Official Page
                  </button>
                  {bookmark.application && (
                    <button 
                      onClick={() => handleApplicationClick(bookmark)}
                      className="btn btn-outline btn-sm"
                    >
                      <ClipboardList className="w-4 h-4 mr-1" />
                      Application Process
                    </button>
                  )}
                  {bookmark.documents && (
                    <button 
                      onClick={() => handleDocumentsClick(bookmark)}
                      className="btn btn-outline btn-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Required Documents
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="w-4 h-4" />
                  <span>Match Score: {bookmark.score_hybrid ? (bookmark.score_hybrid * 100).toFixed(1) : 'N/A'}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Bookmarks Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start bookmarking your favorite schemes from the recommendations page.
          </p>
          <Link to="/recommendations" className="btn btn-primary">
            <FileText className="w-4 h-4 mr-2" />
            Browse Schemes
          </Link>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Results Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Try adjusting your search terms.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="btn btn-outline"
          >
            Clear Search
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
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModals}
                    className="btn btn-outline"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleVisitOfficialPage(selectedScheme);
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
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModals}
                    className="btn btn-outline"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleVisitOfficialPage(selectedScheme);
                      closeModals();
                    }}
                    className="btn btn-primary"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Visit Official Page
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

export default Bookmarks;

