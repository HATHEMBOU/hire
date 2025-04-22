import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import moment from 'moment';
import { AppContext } from '../context/AppContext';

const Applications = () => {
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  
  // Get user from context
  const { user, userApplications } = useContext(AppContext);
  
  // API base URL
  const API_URL = 'http://localhost:5000';
  
  useEffect(() => {
    // Debug user info
    console.log("Current user:", user);
    console.log("User applications from context:", userApplications);
    
    // Fetch all projects joined by the user
    const fetchAllJoinedProjects = async () => {
      try {
        setLoading(true);
        
        // Check if user exists and has an ID
        if (!user || !user._id) {
          console.error("No user ID available");
          setError('User information not available. Please log in again.');
          setLoading(false);
          return;
        }
        
        // Use the correct endpoint from your backend
        console.log(`Fetching joined projects for user: ${user._id}`);
        const response = await axios.get(`${API_URL}/api/projectjoined/user/${user._id}`);
        
        console.log("Raw API response:", response.data);
        
        // Ensure we're dealing with an array and process each project
        const projectsData = Array.isArray(response.data) 
          ? response.data.map(project => ({
              ...project,
              // Convert any potential object fields to strings to avoid React child errors
              title: String(project.title || 'Untitled Project'),
              location: String(project.location || 'No location'),
              status: String(project.status || 'Unknown'),
              companyId: String(project.companyId || 'N/A'),
              userId: String(project.userId || 'N/A')
            }))
          : [];
          
        setJoinedProjects(projectsData);
        setDebugInfo({
          count: projectsData.length,
          firstItem: projectsData[0] || null,
          userInfo: {
            fullUser: user
          }
        });
        console.log("✅ All joined projects loaded:", projectsData.length);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch joined projects:', err);
        console.log("Error details:", err.response?.data || err.message);
        setError('Failed to load joined projects. Please try again later.');
        setJoinedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllJoinedProjects();
  }, [user, userApplications]);

  // Function to handle viewing project details
  const handleViewProject = (projectId) => {
    // Navigate to project details page
    window.location.href = `/projects/${projectId}`;
  };

  // Function to handle viewing solution
  const handleViewSolution = (project) => {
    setSelectedSolution(project);
  };

  // Function to close the solution modal
  const closeSolutionModal = () => {
    setSelectedSolution(null);
  };

  // Function to format date from the backend
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    try {
      return moment(dateString).format('ll');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-gray-200 text-gray-800'; // Default for no status
    
    const statusStr = String(status).toLowerCase();
    
    switch (statusStr) {
      case 'accepted':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      case 'pending':
      default:
        return 'bg-blue-200 text-blue-800';
    }
  };
  
  // Helper function to safely access properties
  const safeGet = (obj, path, fallback = 'N/A') => {
    try {
      if (!obj) return fallback;
      
      const keys = path.split('.');
      let result = obj;
      for (const key of keys) {
        if (result === undefined || result === null) return fallback;
        result = result[key];
      }
      
      // Ensure we always return a string for React rendering
      if (result === undefined || result === null) return fallback;
      if (typeof result === 'object') return JSON.stringify(result);
      return String(result);
    } catch (e) {
      console.error(`Error accessing path ${path}:`, e);
      return fallback;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Applications</h1>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedProjects.length > 0 ? (
              joinedProjects.map((project, index) => (
                <div key={project._id || index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {safeGet(project, 'title', 'Untitled Project')}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span>{safeGet(project, 'location', 'No location specified')}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      <span>{formatDate(project.date)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-4 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(project.status)}`}>
                        {safeGet(project, 'status', 'Unknown')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => handleViewProject(project.projectId || project._id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Project
                      </button>
                      
                      <button
                        onClick={() => handleViewSolution(project)}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors"
                      >
                        View Solution
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-50 p-8 rounded-xl text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-lg font-medium text-gray-600">No applications found.</p>
                <a href="/projects" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                  Browse Projects
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Solution Modal */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-transparent border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Your Solution</h2>
                <button
                  onClick={closeSolutionModal}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Project Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><span className="font-medium">Title:</span> {selectedSolution.title}</p>
                  <p className="mb-2"><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedSolution.status)}`}>{selectedSolution.status}</span></p>
                  <p className="mb-2"><span className="font-medium">Submitted on:</span> {formatDate(selectedSolution.date)}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedSolution.description || "No description provided."}</p>
                </div>
              </div>
              
              {selectedSolution.submissionUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Submission URL</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <a 
                      href={selectedSolution.submissionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {selectedSolution.submissionUrl}
                    </a>
                  </div>
                </div>
              )}
              
              {selectedSolution.submissionFile && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Submission File</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <a 
                      href={selectedSolution.submissionFile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Uploaded File
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeSolutionModal}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Applications;