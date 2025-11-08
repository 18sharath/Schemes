import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, Clock, MapPin, Linkedin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#282440] text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                'About Us',
                'Contact Us',
                'Screen Reader',
                'Accessibility Statement',
                'Frequently Asked Questions',
                'Disclaimer',
                'Terms & Conditions',
                'Dashboard'
              ].map((link) => (
                <li key={link}>
                  <Link
                    to={link === 'Dashboard' ? '/dashboard' : '#'}
                    className="flex items-center text-white/90 hover:text-white transition-colors text-sm group"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400 group-hover:text-white transition-colors" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Useful Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Useful Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Digital India */}
              <a
                href="https://digitalindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 flex items-center justify-center mb-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
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
                  </div>
                  <span className="text-[10px] font-semibold text-gray-800 text-center">Digital India</span>
                </div>
              </a>

              {/* DigiLocker */}
              <a
                href="https://digilocker.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-[#6A1B9A] rounded flex items-center justify-center mb-1">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                      <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-800 text-center">DigiLocker</span>
                </div>
              </a>

              {/* UMANG */}
              <a
                href="https://web.umang.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded flex items-center justify-center mb-1">
                    <span className="text-white font-bold text-base">U</span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-800 text-center">UMANG</span>
                </div>
              </a>

              {/* india.gov.in */}
              <a
                href="https://india.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold text-green-600">india</span>
                  <span className="text-[10px] font-bold text-orange-500">.gov.in</span>
                </div>
              </a>

              {/* myGov */}
              <a
                href="https://mygov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold text-green-600">my</span>
                  <span className="text-[10px] font-bold text-blue-600">Gov</span>
                  <p className="text-[8px] text-gray-600 mt-0.5">मेरी सरकार</p>
                </div>
              </a>

              {/* data.gov.in */}
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold text-orange-500">data</span>
                  <span className="text-[10px] font-bold text-blue-600">.gov.in</span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 3: Get in touch */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Get in touch</h3>
            <div className="space-y-3 text-sm text-white/90">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>BVSS Maratha Students Home,</p>
                  <p>Basavanagudi, Bengaluru,</p>
                  <p>56004, India</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:sharatht.is22@bmsce.ac.in"
                  className="hover:text-white transition-colors break-all"
                >
                  sharatht.is22@bmsce.ac.in
                </a>
              </div>
              
              <div className="flex items-start space-x-2">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/90">(9:00 AM to 5:30 PM)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="flex items-center justify-center space-x-6">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors"
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

