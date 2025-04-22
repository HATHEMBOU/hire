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
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-6">
        {/* Logo and Subscription */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img src={assets.hiho} alt="Hire-Next Logo" className="h-8" />
            <span className="text-xl font-bold text-[#0A2463]">Hire-Next</span>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full max-w-sm">
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
              className="bg-[#0A2463] text-white px-4 py-2 rounded-r-md hover:bg-[#00B4D8] transition-colors"
            >
              Join
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            <a href="mailto:contact@hire-next.com" className="hover:text-[#00B4D8]">
              contact@hire-next.com
            </a>{' '}
            |{' '}
            <a href="tel:+15551234567" className="hover:text-[#00B4D8]">
              (555) 123-4567
            </a>
          </p>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center text-sm text-gray-500">
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