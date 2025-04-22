import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const JoinChallengeModal = ({ isOpen, onClose, projectId }) => {
  const { user } = useContext(AppContext);
  const [formData, setFormData] = useState({
    description: "",
    url: "",
    file: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState(null);

  // Create axios instance with backend URL
  const API_URL = 'http://localhost:5000';
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    }
  });

  // Fetch project data when modal opens and projectId is available
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectData();
    }
  }, [isOpen, projectId]);

  // Fetch project details from the backend
  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      setProjectData(response.data);
      console.log("Fetched project data:", response.data);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setErrors({
        fetchError: "Could not load project details. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      description: "",
      url: "",
      file: null,
    });
    setErrors({});
    setFileName("");
    setSubmissionSuccess(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors({
          ...errors,
          file: "File size should be less than 10MB"
        });
        return;
      }
      
      setFormData({
        ...formData,
        file: selectedFile,
      });
      setFileName(selectedFile.name);
      
      // Clear file error if exists
      if (errors.file) {
        setErrors({
          ...errors,
          file: "",
        });
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Description is required
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description should be at least 20 characters";
    }
    
    // Either URL or file must be provided
    if (!formData.url && !formData.file) {
      newErrors.submission = "Please provide either a URL or upload a file";
    }
    
    // Validate URL format if provided
    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }
    
    // Check if project data is available
    if (!projectData) {
      newErrors.projectData = "Project data is missing. Please try again later.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // URL validation helper
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {

    
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make sure project data is available
      if (!projectData) {
        throw new Error("Project data is missing");
      }
      
      // Create the data object for the joined project
      const projectJoinedData = {
        companyId: projectData.companyId,
        projectId: projectId,
        title: projectData.title,
        location: projectData.location || "Remote",
        date: new Date().toISOString(),
        status: "Pending",
        userId: user._id,
        userEmail: user.email,
        description: formData.description.trim(), // Ensure description is trimmed
        submissionUrl: formData.url || "",
        // Add any additional fields your API might require
        userName: user.name || user.username || user.email.split('@')[0], // Fallback for user name
        projectType: projectData.projectType || "Challenge", // Fallback for project type
      };
      
      console.log("Project join data being sent:", projectJoinedData);
      console.log("User data available:", user);


      // If a file was provided, handle it first
      if (formData.file) {
        const fileData = new FormData();
        fileData.append("file", formData.file);
        
        // Upload the file and get the URL
        const fileUploadResponse = await api.post("/api/upload", fileData);
        
        // If URL is empty, use the file URL as the submissionUrl
        if (!formData.url) {
          projectJoinedData.submissionUrl = fileUploadResponse.data.fileUrl;
        } else {
          // If both URL and file are provided, keep URL in submissionUrl and add file separately
          projectJoinedData.submissionFile = fileUploadResponse.data.fileUrl;
        }
      }
      
      console.log("Submitting project data:", projectJoinedData); // Debug log to verify data
      
      // Send the data to join the project
      const response = await api.post("/api/projectjoined", projectJoinedData);
      
      console.log("Project joined successfully:", response.data);
      
      // Show success
      setSubmissionSuccess(true);
      
      // Update the local database with the response to confirm it was properly saved
// Update this section in your JoinChallengeModal.jsx, around line 228
if (response.data && response.data.joinedProject) {
  const savedProject = response.data.joinedProject;
  
  // Add console logs to see exactly what's in the response
  console.log("Submitted description:", formData.description);
  console.log("Submitted URL:", projectJoinedData.submissionUrl);
  console.log("Response project:", savedProject);
  
  // The issue might be that your check is too strict
  // Check if the fields exist but might be empty strings
  const missingFields = [];
  
  if (!savedProject.description && formData.description) {
    missingFields.push('description');
  }
  
  if (!savedProject.submissionUrl && projectJoinedData.submissionUrl) {
    missingFields.push('submissionUrl');
  }
  
  if (savedProject.submissionFile === undefined && projectJoinedData.submissionFile) {
    missingFields.push('submissionFile');
  }
  
  if (missingFields.length > 0) {
    console.warn("Warning: Some fields were not saved properly:", missingFields);
  }
}
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error during submission:", error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? "Missing required fields: " + 
                            Object.keys(error.response.data.errors).join(", ") : 
                            "An error occurred. Please try again.");
      
      setErrors({
        submission: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2463]/10 to-transparent border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Join Challenge</h2>
            <button
              onClick={onClose}
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

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-[#0A2463]/20 border-t-[#0A2463] rounded-full mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
          </div>
        )}

        {/* Error Fetching Project */}
        {errors.fetchError && !isLoading && (
          <div className="bg-red-50 text-red-600 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-1">Error Loading Project</h3>
            <p>{errors.fetchError}</p>
            <button 
              onClick={fetchProjectData}
              className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success Message */}
        {submissionSuccess && (
          <div className="bg-green-50 text-green-600 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-semibold mb-1">Submission Successful!</h3>
            <p>You have successfully joined this project.</p>
          </div>
        )}

        {/* Form */}
        {!isLoading && !errors.fetchError && !submissionSuccess && projectData && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">Project Details</h3>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Title:</span> {projectData.title}
                </p>
                {projectData.location && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Location:</span> {projectData.location}
                  </p>
                )}
                {projectData.companyName && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Company:</span> {projectData.companyName}
                  </p>
                )}
              </div>
              
              {errors.submission && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                  {errors.submission}
                </div>
              )}

              {/* Description Field - Required */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A2463]/50 outline-none transition-colors ${
                    errors.description ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Describe your submission... (minimum 20 characters)"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.description.length} / 20 characters minimum
                </p>
              </div>

              {/* URL Field */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  URL <span className="text-gray-400 text-sm font-normal">(provide URL or upload a file)</span>
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A2463]/50 outline-none transition-colors ${
                    errors.url ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="https://your-project-url.com"
                />
                {errors.url && (
                  <p className="text-red-500 text-sm mt-1">{errors.url}</p>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Upload File <span className="text-gray-400 text-sm font-normal">(provide URL or upload a file)</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition">
                    <span>Choose File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {fileName || "No file chosen"}
                  </div>
                </div>
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Maximum file size: 10MB</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg mr-2 hover:bg-gray-200 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#0A2463] px-4 py-2 text-white rounded-lg font-semibold hover:bg-[#08184a] transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Challenge</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinChallengeModal;