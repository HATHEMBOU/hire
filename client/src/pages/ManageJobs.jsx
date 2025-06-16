import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ManageJobs = () => {
  const { user } = useContext(AppContext);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    // We will fetch both projects and their applications
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- Step 1: Fetch all applications ---
        // We get all applications first to create a count map.
        // This is more efficient than querying for each project individually.
        console.log("Fetching all applications from /api/projectjoined...");
        const applicationsResponse = await axios.get(`${API_BASE_URL}/api/projectjoined`);
        const allApplications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
        
        // --- Step 2: Create a map of applicant counts ---
        // The key is the projectId, and the value is the number of applicants.
        const applicantCounts = allApplications.reduce((acc, application) => {
          const projectId = application.projectId;
          if (projectId) {
            acc[projectId] = (acc[projectId] || 0) + 1;
          }
          return acc;
        }, {});
        console.log("Applicant counts calculated:", applicantCounts);

        // --- Step 3: Fetch the projects (your existing logic) ---
        let projectsResponse;
        if (user.role === "admin") {
          try {
            console.log("Trying admin endpoint for projects...");
            projectsResponse = await axios.get(`${API_BASE_URL}/api/admin/projects`);
          } catch (adminError) {
            console.log("Admin endpoint failed, falling back to regular endpoint:", adminError.message);
            projectsResponse = await axios.get(`${API_BASE_URL}/api/projects`);
          }
        } else {
          projectsResponse = await axios.get(`${API_BASE_URL}/api/projects`);
        }
        
        // --- Step 4: Filter projects and merge with applicant counts ---
        const userProjects = user.role === "company"
          ? projectsResponse.data.filter(p => p.companyId === user.email)
          : projectsResponse.data;

        const projectsWithCounts = userProjects.map(project => ({
          ...project,
          // Add the applicant count from our map
          applicantCount: applicantCounts[project._id] || 0
        }));
        
        console.log("Final projects with counts:", projectsWithCounts);
        setProjects(projectsWithCounts);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to load data: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role) {
      fetchData();
    }
  }, [user]);

  // Function to calculate deadline from posted date and duration
  const calculateDeadline = (postedDate, duration) => {
    if (!postedDate || !duration) return "N/A";
    
    const durationNum = parseInt(duration);
    const durationUnit = duration.toLowerCase();
    
    let deadline = moment(postedDate);
    
    if (durationUnit.includes('day')) {
      deadline = deadline.add(durationNum, 'days');
    } else if (durationUnit.includes('week')) {
      deadline = deadline.add(durationNum, 'weeks');
    } else if (durationUnit.includes('month')) {
      deadline = deadline.add(durationNum, 'months');
    } else if (durationUnit.includes('year')) {
      deadline = deadline.add(durationNum, 'years');
    } else {
      deadline = deadline.add(durationNum, 'days');
    }
    
    return deadline.format("ll");
  };

  const deleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        console.log("Deleting project with ID:", id);
        
        const endpoint = user.role === "admin" 
          ? `${API_BASE_URL}/api/admin/projects/${id}`
          : `${API_BASE_URL}/api/projects/${id}`;
          
        const response = await axios.delete(endpoint);
        
        console.log("Delete response:", response.data);
        
        if (response.status === 200 || response.status === 204) {
          setProjects(projects.filter(p => p._id !== id));
          setError(null);
          console.log("Project deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        setError(`Deletion failed: ${error.response?.data?.error || "Server error"}`);
      }
    }
  };

  const handleEdit = (project) => {
    // This function can be expanded to navigate to an edit page
    // For now, it could be used for other actions or kept as a placeholder.
    // Let's make the entire row clickable to view applications, for example.
    // Or we could have a "View Applicants" button here.
    // For simplicity, we'll keep the delete functionality separate as it is now.
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Jobs</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deadline</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applicants</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3">Loading jobs and applications...</span>
                  </div>
                </td>
              </tr>
            ) : projects.length > 0 ? (
              projects.map((project, index) => (
                <tr key={project._id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}>
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{project.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {calculateDeadline(project.postedDate, project.duration)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{project.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {/* --- MODIFIED LINE --- */}
                      {project.applicantCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => deleteProject(project._id)}
                        className="px-3 py-1 text-xs font-medium text-red-700 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Delete this project"
                      >
                        Delete
                      </button>
                      {/* You can add an edit button here */}
                      {/* <button className="px-3 py-1 text-xs font-medium text-blue-700 ...">Edit</button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  <p>No jobs found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageJobs;
