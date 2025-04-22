import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown, DollarSign, Upload } from 'lucide-react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // You may need to install this: npm install uuid
import { AppContext } from '../context/AppContext'; // Update this path to match your project structure

// Configure the base URL for your API
// Change this to match your actual backend URL
const API_BASE_URL = 'http://localhost:5000';

// Modified test data with empty companyId since we'll set it dynamically
const testData = {
  title: " ",
  location: "",
  difficulty: "",
  companyId: "", // This will be filled with user's email
  description: "",
  prize: "",
  duration: "",
  category: ""
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
  
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const categories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science', 'AI/ML', 'Marketing'];
  const locations = ['Algeria', 'Remote', 'USA', 'Canada', 'UK', 'France'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const durations = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months'];

  // Load test data and set user email on component mount
  useEffect(() => {
    if (user && user.email) {
      // Update test data with the user's email
      const updatedTestData = {
        ...testData,
        companyId: user.email
      };
      
      // Set form data with user's email as companyId
      setFormData(updatedTestData);
      console.log("User email set as companyId:", user.email);
    } else {
      // Still load test data but without user email
      setFormData(testData);
      console.log("No logged-in user found, companyId will be empty");
      setMessage({ 
        type: 'warning', 
        text: 'You are not logged in. Please log in to associate this project with your account.' 
      });
    }
  }, [user]); // Re-run this effect if user changes
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
    
    try {
      // Prepare data for submission - using Unix timestamp as requested
      const projectData = {
        ...formData,
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
      
      // Handle file upload if needed
      if (file && response.data._id) {
        const fileData = new FormData();
        fileData.append('file', file);
        
        await axios.post(`${API_BASE_URL}/api/projects/${response.data._id}/upload`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log("File uploaded successfully");
      }
      
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
          'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Simple header */}
        <div className="bg-blue-500 p-4 text-white">
          <h2 className="text-xl font-semibold">Create New Project (Test Mode)</h2>
          <p className="text-sm text-blue-100">Form pre-filled with test data</p>
          {user && (
            <p className="text-sm text-blue-100">Logged in as: {user.email} ({user.role})</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Project Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Enter project title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              placeholder="Describe your project"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400" size={16} />
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
                  className="w-full p-2 border rounded appearance-none"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400" size={16} />
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
                  className="w-full p-2 border rounded appearance-none"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400" size={16} />
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
                  className="w-full p-2 border rounded appearance-none"
                >
                  {durations.map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 text-gray-400" size={16} />
              </div>
            </div>
          </div>
          
          {/* Prize/Budget */}
          <div>
            <label htmlFor="prize" className="block text-sm font-medium mb-1">
              Prize Amount
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-2 top-2 text-gray-400" />
              <input
                type="text"
                id="prize"
                placeholder="Enter amount"
                value={formData.prize}
                onChange={handlePrizeChange}
                className="w-full pl-8 p-2 border rounded"
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.companyId}
              className={`w-full p-2 rounded text-white ${
                isSubmitting || !formData.companyId ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Project with Test Data'}
            </button>
            {!formData.companyId && (
              <p className="text-sm text-red-500 mt-2 text-center">
                Please log in to create a project
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProdArena;