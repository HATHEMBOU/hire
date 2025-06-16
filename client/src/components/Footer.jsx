import React, { useState } from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setEmail(''); // Clear input on successful submit
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logo and Subscription */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <img 
              src={assets.logo} 
              alt="Hire-Next Logo" 
              className="w-8 h-8 mr-2"
            />
            <h3 className="text-xl font-semibold text-gray-800">
              Hire-Next
            </h3>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Subscribe for updates"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00B4D8] text-white rounded-r-md hover:bg-[#0096c7] transition-colors"
            >
              Join
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="text-center text-gray-600 mb-4">
          <span>
            <a href="mailto:contact@hire-next.com" className="hover:text-[#00B4D8] transition-colors">
              contact@hire-next.com
            </a>
            {' '}
            |{' '}
            <a href="mailto:admin@HireNext.com" className="hover:text-[#00B4D8] transition-colors">
              admin@HireNext.com
            </a>
            {' '}
            |{' '}
            <a href="tel:+15551234567" className="hover:text-[#00B4D8] transition-colors">
              (555) 123-4567
            </a>
          </span>
        </div>

        {/* Bottom Section */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
          <p>© {currentYear} Hire-Next. All rights reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-4 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
