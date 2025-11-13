import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, Clock, MapPin, Linkedin, Facebook, Instagram } from 'lucide-react';

const quickLinks = [
  'About Us',
  'Contact Us',
  'Screen Reader',
  'Accessibility Statement',
  'Frequently Asked Questions',
  'Disclaimer',
  'Terms & Conditions',
  'Dashboard'
];

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-100 dark:text-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Quick Links */}
          <div className="md:pl-3 lg:pl-6">
            <h3 className="text-white dark:text-gray-100 font-bold text-lg mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link}
                  to={link === 'Dashboard' ? '/dashboard' : '#'}
                  className="flex items-center text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors text-sm group"
                >
                  <ChevronRight className="w-3.5 h-3.5 mr-2 text-gray-400 dark:text-gray-400 group-hover:text-white dark:group-hover:text-white transition-colors" />
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Useful Links */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-bold text-lg mb-3">Useful Links</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Digital India */}
              <a
                href="https://digitalindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-white transition-colors"
              >
                <svg viewBox="0 0 100 100" className="w-5 h-5 flex-shrink-0">
                  <defs>
                    <linearGradient id="diGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B35" />
                      <stop offset="50%" stopColor="#4ECDC4" />
                      <stop offset="100%" stopColor="#45B7D1" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="40" fill="url(#diGrad)" />
                  <text x="50" y="60" fontSize="28" fill="white" textAnchor="middle" fontWeight="bold">D</text>
                </svg>
                <span className="font-medium">Digital India</span>
              </a>

              {/* DigiLocker */}
              <a
                href="https://digilocker.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-white transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#6A1B9A] text-[10px] font-bold text-white">DL</span>
                <span className="font-medium">DigiLocker</span>
              </a>

              {/* UMANG */}
              <a
                href="https://web.umang.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-white transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#FF6B35] text-[10px] font-bold text-white">U</span>
                <span className="font-medium">UMANG</span>
              </a>

              {/* india.gov.in */}
              <a
                href="https://india.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-white transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white text-[9px] font-bold text-green-600 dark:text-green-400 dark:bg-gray-700">in</span>
                <span className="font-medium">india.gov.in</span>
              </a>

              {/* myGov */}
              <a
                href="https://mygov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-white transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white text-[9px] font-bold text-green-600 dark:text-green-400 dark:bg-gray-700">my</span>
                <span className="font-medium">myGov</span>
              </a>

              {/* data.gov.in */}
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 text-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-white transition-colors"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white text-[9px] font-bold text-orange-500 dark:text-orange-400 dark:bg-gray-700">data</span>
                <span className="font-medium">data.gov.in</span>
              </a>
            </div>
          </div>

          {/* Column 3: Get in touch */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-bold text-lg mb-3">Get in touch</h3>
            <div className="space-y-2 text-sm text-gray-300 dark:text-gray-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-300" />
                <div className="text-gray-300 dark:text-gray-300">
                  <p>BMS College of Engineering,</p>
                  <p>Bengaluru, 560019</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-300" />
                <a
                  href="mailto:sharatht.is22@bmsce.ac.in"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors break-all"
                >
                  sharatht.is22@bmsce.ac.in
                </a>
              </div>
              
              <div className="flex items-start space-x-2">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-300" />
                <div>
                  <p className="text-gray-300 dark:text-gray-300">(9:00 AM to 5:30 PM)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="mt-6 pt-6 border-t border-gray-600 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-6">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center hover:border-white dark:hover:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center hover:border-white dark:hover:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center hover:border-white dark:hover:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

