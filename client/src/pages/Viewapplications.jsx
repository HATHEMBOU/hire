import React, { useState, useEffect, useContext } from 'react';
import { Search, ChevronDown, ChevronUp, MoreHorizontal, Check, X, ExternalLink, ChevronRight } from 'lucide-react';
import axios from 'axios';
import moment from 'moment';
import { AppContext } from '../context/AppContext';

const Viewapplication = () => {
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  
  // Get user from context
  const { user } = useContext(AppContext);
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Function to fetch all joined projects
  const fetchAllJoinedProjects = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching ALL joined projects');
      const response = await axios.get(`${API_URL}/api/projectjoined`);
      
      console.log("Raw API response:", response.data);
      
      // Ensure we're dealing with an array and process each project
      const projectsData = Array.isArray(response.data) 
        ? response.data.map(project => ({
            ...project,
            // Convert any potential object fields to strings to avoid React child errors
            title: String(project.title || 'Untitled Project'),
            location: String(project.location || 'No location'),
            status: String(project.status || 'Unknown'),
            submissionDate: project.date || new Date().toISOString()
            
          }))
        : [];
        
      setJoinedProjects(projectsData);
      console.log("✅ All joined projects loaded:", projectsData.length);
      setError(null);
      return projectsData; // Return the data for optional use by the caller
    } catch (err) {
      console.error('❌ Failed to fetch joined projects:', err);
      console.log("Error details:", err.response?.data || err.message);
      setError('Failed to load joined projects. Please try again later.');
      setJoinedProjects([]);
      return []; // Return empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    // Fetch all projects when component mounts - not filtered by user
    fetchAllJoinedProjects();
  }, []); // Removed user dependency to avoid re-fetching when user changes

  // Close dropdown when clicking outside
  const handleOutsideClick = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setOpenDropdownIndex(null);
    }
  };

  // Add click handler to document when component mounts
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Toggle dropdown for specific row
  const toggleDropdown = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  // Function to handle viewing solution
  const handleViewSolution = (project) => {
    setSelectedSolution(project);
  };

  // Function to close the solution modal
  const closeSolutionModal = () => {
    setSelectedSolution(null);
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    try {
      return moment(dateString).format('ll');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    
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

  // Sort and filter data
  const filteredProjects = joinedProjects
    .filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const statusOptions = ['All', 'Pending', 'Accepted', 'Rejected'];

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with title and search */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">All Joined Projects</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md bg-white w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          
          {/* Refresh button */}
          <button 
            onClick={fetchAllJoinedProjects}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium text-gray-600 border-b">#</th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gray-600 border-b cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Project Title
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gray-600 border-b cursor-pointer max-sm:hidden"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-2">
                      Location
                      {sortField === 'location' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gray-600 border-b cursor-pointer max-sm:hidden"
                    onClick={() => handleSort('submissionDate')}
                  >
                    <div className="flex items-center gap-2">
                      Submission Date
                      {sortField === 'submissionDate' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 border-b">Status</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 border-b">Actions</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 border-b">Solution</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project, index) => (
                    <tr key={project._id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 border-b font-medium text-gray-800">{project.title}</td>
                      <td className="py-3 px-4 border-b text-gray-700 max-sm:hidden">{project.location}</td>
                      <td className="py-3 px-4 border-b text-gray-700 max-sm:hidden">{formatDate(project.submissionDate)}</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="relative dropdown-container">
                          <button 
                            onClick={() => toggleDropdown(index)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <MoreHorizontal size={18} className="text-gray-600" />
                          </button>
                          {openDropdownIndex === index && (
                            <div className="z-10 absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="py-1">
                                <button 
                                  className="flex items-center w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                                  onClick={() => {
                                    handleViewSolution(project);
                                    setOpenDropdownIndex(null);
                                  }}
                                >
                                  <ExternalLink size={16} className="mr-2" />
                                  View Solution
                                </button>
                                <button 
                                  className="flex items-center w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                                  onClick={() => {
                                    window.location.href = `/projects/${project.projectId || project._id}`;
                                    setOpenDropdownIndex(null);
                                  }}
                                >
                                  <ChevronRight size={16} className="mr-2" />
                                  View Project
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        {project.submissionUrl && (
                          <a 
                            href={project.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-sm"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Solution Link
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No joined projects found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredProjects.length} of {joinedProjects.length} projects
          </div>
        </div>
      </div>

      {/* Solution Modal */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-transparent border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Solution Details
                  {selectedSolution.submissionUrl && (
                    <a 
                      href={selectedSolution.submissionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 text-base font-normal inline-flex items-center"
                    >
                      <ExternalLink size={16} className="mr-1" />
                      View Solution
                    </a>
                  )}
                </h2>
                <button
                  onClick={closeSolutionModal}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Project Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><span className="font-medium">Title:</span> {selectedSolution.title}</p>
                  <p className="mb-2"><span className="font-medium">Location:</span> {selectedSolution.location}</p>
                  <p className="mb-2">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedSolution.status)}`}>
                      {selectedSolution.status}
                    </span>
                  </p>
                  <p className="mb-2"><span className="font-medium">Submitted on:</span> {formatDate(selectedSolution.submissionDate)}</p>
                  {selectedSolution.userId && (
                    <p className="mb-2"><span className="font-medium">Submitted by:</span> {selectedSolution.userId}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Solution Description</h3>
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
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all flex items-center"
                    >
                      <ExternalLink size={16} className="mr-2" />
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
              
              {/* If there are any additional notes or feedback */}
              {selectedSolution.feedback && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Feedback</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedSolution.feedback}</p>
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
    </div>
  );
};

export default Viewapplication;