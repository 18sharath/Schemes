import React from 'react';
import { X, ExternalLink, ClipboardList, FileText, CheckCircle2 } from 'lucide-react';

const SchemeDetailModal = ({ scheme, onClose, onVisit }) => {
  if (!scheme) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold">{scheme.scheme_name}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {scheme.details && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-indigo-300" />
                <h4 className="font-medium">Description</h4>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line">
                {scheme.details}
              </div>
            </div>
          )}
          {scheme.benefits && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-300" />
                <h4 className="font-medium">Benefits</h4>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line">
                {scheme.benefits}
              </div>
            </div>
          )}
          {scheme.eligibility && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                <h4 className="font-medium">Eligibility</h4>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line">
                {scheme.eligibility}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-outline">Close</button>
          {onVisit && (
            <button onClick={onVisit} className="btn btn-primary">
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit Official Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailModal;


