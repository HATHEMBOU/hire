import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // You may need to install this: npm install uuid
import { AppContext } from '../context/AppContext'; // Update this path to match your project structure

// Configure the base URL for your API
// Change this to match your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Updated test data with actual values
const testData = {
  title: "AI-Powered E-commerce Recommendation System",
  location: "Algeria",
  difficulty: "Intermediate",
  companyId: "", // This will be filled with user's email
  description: "Build an intelligent recommendation system for e-commerce platforms using machine learning algorithms. The system should analyze user behavior, purchase history, and product characteristics to provide personalized product recommendations. Must include real-time processing capabilities and A/B testing framework.",
  prize: "$5,000",
  duration: "2 months",
  category: "AI/ML"
};

const AddProdArena = () => {
  // Get user from AppContext
  const { user } = useContext(AppContext);
  
  // Form state with field names matching your database schema
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Algeria',
    category: 'AI/ML',
    difficulty: 'Beginner',
    prize: '',
    duration: '1 month',
    companyId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [acceptMarketFee, setAcceptMarketFee] = useState(false);
  const [acceptPaymentCommitment, setAcceptPaymentCommitment] = useState(false);
  
  const categories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science', 'AI/ML', 'Marketing'];
  const locations = ['Algeria', 'Remote', 'USA', 'Canada', 'UK', 'France'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const durations = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months'];

  // Set user email when user context changes
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        companyId: user.email
      }));
      console.log("User email set in form:", user.email);
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const formatPrize = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/\D/g, '');
    return `$${Number(numericValue).toLocaleString()}`;
  };

  const handlePrizeChange = (e) => {
    const rawValue = e.target.value.replace(/\$|,/g, '');
    if (rawValue === '' || /^\d+$/.test(rawValue)) {
      setFormData({ ...formData, prize: formatPrize(rawValue) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    // Validation
    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'Please fill in the title and description' });
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.companyId) {
      setMessage({ type: 'error', text: 'User email is required. Please make sure you are logged in.' });
      setIsSubmitting(false);
      return;
    }
    
    if (!acceptMarketFee) {
      setMessage({ type: 'error', text: 'Please accept the market fee agreement to proceed.' });
      setIsSubmitting(false);
      return;
    }
    
    if (!acceptPaymentCommitment) {
      setMessage({ type: 'error', text: 'Please confirm your commitment to pay the winner.' });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare data for submission - using Unix timestamp as requested
      const projectData = {
        ...formData,
        // Combine trust statements with user description
        description: `I trust I give 10% for hire next\nI trust I will give the full prize to the one who have best solution for me\n\n${formData.description}`,
        // Add _id field to satisfy MongoDB schema requirement
        _id: uuidv4(), // Generate a unique ID
        // Convert dollar string to number if needed by your API
        prize: formData.prize,
        // Use Unix timestamp number format as shown in your database
        postedDate: Math.floor(Date.now())
      };
      
      console.log("Sending project data to API:", projectData);
      
      // Make the API call to your backend with the correct URL
      const response = await axios.post(`${API_BASE_URL}/api/projects`, projectData);
      console.log("Project created:", response.data);
      
      // Show success message
      setMessage({ type: 'success', text: 'Project created successfully!' });
      
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Improved error handling with more specific error messages
      let errorMessage = 'Failed to create project. ';
      
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        errorMessage += `Server error: ${error.response.status} ${error.response.statusText}`;
        if (error.response.data && error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += "No response received from server. Is your backend server running?";
      } else {
        // Something happened in setting up the request
        errorMessage += error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Status message */}
      {message.text && (
        <div className={`p-3 mb-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 
          message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
          message.type === 'info' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Simple header */}
        <div className="bg-blue-500 p-4 text-white">
          <h2 className="text-xl font-semibold">Create New Project</h2>
          {user && (
            <p className="text-sm text-blue-100">Logged in as: {user.email} ({user.role})</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Project Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              placeholder="Enter project title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description *
            </label>
            
            {/* Trust statements - non-editable */}
            <div className="mb-2 p-3 bg-gray-50 border rounded text-sm text-gray-700">
              <div className="font-medium text-blue-600 mb-1">Trust Statements:</div>
              <div>• I trust I give 10% for hire next</div>
              <div>• I trust I will give the full prize to the one who have best solution for me</div>
            </div>
            
            {/* User's project description */}
            <textarea
              id="description"
              rows="4"
              placeholder="Describe your project in detail..."
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          {/* Project Details - 2 columns on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded appearance-none focus:border-blue-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <div className="relative">
                <select
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded appearance-none focus:border-blue-500 focus:outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            
            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                Difficulty
              </label>
              <div className="relative">
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full p-2 border rounded appearance-none focus:border-blue-500 focus:outline-none"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration
              </label>
              <div className="relative">
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full p-2 border rounded appearance-none focus:border-blue-500 focus:outline-none"
                >
                  {durations.map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
          
          {/* Prize/Budget */}
          <div>
            <label htmlFor="prize" className="block text-sm font-medium mb-1">
              Prize Amount
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-2 top-2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                id="prize"
                placeholder="Enter amount (e.g., 5000)"
                value={formData.prize}
                onChange={handlePrizeChange}
                className="w-full pl-8 p-2 border rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Market Fee Agreement Checkbox */}
          <div className="border-t pt-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptMarketFee"
                checked={acceptMarketFee}
                onChange={(e) => setAcceptMarketFee(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="acceptMarketFee" className="text-sm text-gray-700">
                <span className="font-medium">I accept that Hire Next will get 10% from the budget *</span>
                <p className="text-xs text-gray-500 mt-1">
                  By checking this box, you agree that Hire Next will deduct 10% from the total project budget as a platform fee.
                </p>
              </label>
            </div>
          </div>

          {/* Payment Commitment Checkbox */}
          <div className="border-t pt-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptPaymentCommitment"
                checked={acceptPaymentCommitment}
                onChange={(e) => setAcceptPaymentCommitment(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="acceptPaymentCommitment" className="text-sm text-gray-700">
                <span className="font-medium">I will pay the person who has the best solution for my project *</span>
                <p className="text-xs text-gray-500 mt-1">
                  By checking this box, you commit to paying the full prize amount to the freelancer who provides the best solution that meets your project requirements.
                </p>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.companyId || !acceptMarketFee || !acceptPaymentCommitment}
              className={`w-full p-3 rounded text-white font-medium transition-colors ${
                isSubmitting || !formData.companyId || !acceptMarketFee || !acceptPaymentCommitment
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </button>
            {!formData.companyId && (
              <p className="text-sm text-red-500 mt-2 text-center">
                Please log in to create a project
              </p>
            )}
            {formData.companyId && (!acceptMarketFee || !acceptPaymentCommitment) && (
              <p className="text-sm text-red-500 mt-2 text-center">
                Please accept both agreements to proceed
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProdArena;
