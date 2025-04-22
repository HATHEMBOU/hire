import React, { useState, useRef } from 'react';
import { assets } from '../assets/assets';
import { useClerk } from '@clerk/clerk-react';

const RecruiterLogin = () => {
  const [formState, setFormState] = useState('Login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
  });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { openSignIn } = useClerk();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, GIF)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setImage(file);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
    handleImageChange({ target: { files: e.dataTransfer.files } });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formState === 'Login') {
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in email and password');
        }
        await openSignIn({
          identifier: formData.email,
          password: formData.password,
        });
      } else {
        if (!formData.companyName || !formData.email || !formData.password || !image) {
          throw new Error('Please fill in all required fields');
        }
        // Here you could implement actual registration logic
        alert('Please contact our team to create a recruiter account');
      }
    } catch (error) {
      alert(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Recruiter {formState}
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            {formState === 'Login'
              ? 'Sign in to manage your recruitment'
              : 'Register your company to start hiring'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formState === 'Register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <img 
                    src={assets.person_icon} 
                    alt="" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo
                </label>
                <div
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.currentTarget.classList.add('border-blue-500')}
                  onDragLeave={(e) => e.currentTarget.classList.remove('border-blue-500')}
                  onDrop={handleImageDrop}
                >
                  <div className="text-center">
                    {image ? (
                      <p className="text-sm text-gray-600">{image.name}</p>
                    ) : (
                      <>
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-blue-600 hover:text-blue-700"
                        >
                          Upload a file
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          or drag and drop (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <img 
                src={assets.email_icon} 
                alt="" 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <img 
                src={assets.lock_icon} 
                alt="" 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {formState === 'Login' && (
              <button
                type="button"
                className="w-full text-sm text-blue-600 hover:text-blue-700 text-center"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                formState === 'Login' ? 'Sign In' : 'Register'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              {formState === 'Login' ? "Don't have an account?" : "Already registered?"}{' '}
              <button
                type="button"
                onClick={() => setFormState(formState === 'Login' ? 'Register' : 'Login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {formState === 'Login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterLogin;