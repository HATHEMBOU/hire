import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, MoreHorizontal, Check, X, ExternalLink, Calendar } from 'lucide-react';

const viewProjectjoined = () => {
  const [applications, setApplications] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch applications data
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('/api/company/project-applications');
        const data = await response.json();
        
        if (data.success) {
          setApplications(data.applications);
        } else {
          console.error("Failed to fetch applications:", data.message);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/company/project-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the local state with the new status
        setApplications(prevApplications => 
          prevApplications.map(app => 
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        console.error("Failed to update status:", data.message);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort and filter data
  const filteredData = applications
    .filter(application => {
      const matchesSearch = searchTerm === '' || 
        (application.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || application.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      let aValue, bValue;
      
      // Handle nested fields
      if (sortField === 'userName') {
        aValue = a.userId?.name || "";
        bValue = b.userId?.name || "";
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const statusOptions = ['All', 'Pending', 'Accepted', 'Rejected'];

  // Toggle dropdown for specific row
  const toggleDropdown = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with title and search */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Project Applications</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by name, email, project..."
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
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading applications...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium text-gray-600 border-b">#</th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gray-600 border-b cursor-pointer"
                    onClick={() => handleSort('userName')}
                  >
                    <div className="flex items-center gap-2">
                      Applicant
                      {sortField === 'userName' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gray-600 border-b cursor-pointer max-sm:hidden"
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
                    className="py-3 px-4 text-left font-medium text-gray-600 border-b cursor-pointer max-md:hidden"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="mr-1" />
                      Date
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gray-600 border-b cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center font-medium text-gray-600 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((application, index) => (
                    <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mr-3">
                            {application.userId?.profileImage ? (
                              <img 
                                className="h-full w-full object-cover" 
                                src={application.userId.profileImage} 
                                alt={`${application.userId?.name || 'User'}'s profile`} 
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold">
                                {(application.userId?.name?.charAt(0) || application.userEmail.charAt(0)).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{application.userId?.name || 'Unnamed User'}</div>
                            <div className="text-sm text-gray-500">{application.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b text-gray-700 max-sm:hidden">{application.title}</td>
                      <td className="py-3 px-4 border-b text-gray-700 max-sm:hidden">{application.location}</td>
                      <td className="py-3 px-4 border-b text-gray-600 max-md:hidden">{formatDate(application.date)}</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                          application.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <div className="relative dropdown-container inline-block">
                          <button 
                            onClick={() => toggleDropdown(index)}
                            className="p-1 rounded-full hover:bg-gray-100"
                            aria-label="Application actions"
                          >
                            <MoreHorizontal size={18} className="text-gray-600" />
                          </button>
                          {openDropdownIndex === index && (
                            <div className="z-10 absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="py-1">
                                {application.status !== 'Accepted' && (
                                  <button 
                                    className="flex items-center w-full text-left px-4 py-2 text-green-600 hover:bg-gray-100"
                                    onClick={() => {
                                      updateApplicationStatus(application._id, 'Accepted');
                                      setOpenDropdownIndex(null);
                                    }}
                                  >
                                    <Check size={16} className="mr-2" />
                                    Accept Application
                                  </button>
                                )}
                                {application.status !== 'Rejected' && (
                                  <button 
                                    className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                    onClick={() => {
                                      updateApplicationStatus(application._id, 'Rejected');
                                      setOpenDropdownIndex(null);
                                    }}
                                  >
                                    <X size={16} className="mr-2" />
                                    Reject Application
                                  </button>
                                )}
                                {application.submissionUrl && (
                                  <a 
                                    href={application.submissionUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                                  >
                                    <ExternalLink size={16} className="mr-2" />
                                    View Submission URL
                                  </a>
                                )}
                                {application.submissionFile && (
                                  <a 
                                    href={application.submissionFile} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                                    download
                                  >
                                    <ExternalLink size={16} className="mr-2" />
                                    Download Submission File
                                  </a>
                                )}
                                <button 
                                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                  onClick={() => {
                                    // You can add navigation to detailed view here
                                    // Example: router.push(`/applications/${application._id}`);
                                    setOpenDropdownIndex(null);
                                  }}
                                >
                                  <ExternalLink size={16} className="mr-2" />
                                  View Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No applications found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {applications.length} applications
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default viewProjectjoined;