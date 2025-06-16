import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const JoinChallengeModal = ({ isOpen, onClose, projectId }) => {
  const { user } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    paymentLink: "",
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

  // API configuration
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    }
  });

  // Fetch project data when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectData();
    }
  }, [isOpen, projectId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      setProjectData(response.data);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setErrors({
        fetchError: "Unable to load project details. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: user?.name || user?.username || "",
      email: user?.email || "",
      paymentLink: "",
      description: "", 
      url: "", 
      file: null 
    });
    setErrors({});
    setFileName("");
    setSubmissionSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error on input
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        file: "File size must be less than 10MB"
      }));
      return;
    }
    
    setFormData(prev => ({ ...prev, file: selectedFile }));
    setFileName(selectedFile.name);
    
    // Clear file error
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate payment link
    if (!formData.paymentLink.trim()) {
      newErrors.paymentLink = "Payment link is required";
    } else if (!isValidUrl(formData.paymentLink)) {
      newErrors.paymentLink = "Please enter a valid payment link URL";
    }
    
    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    
    // Validate submission method
    if (!formData.url && !formData.file) {
      newErrors.submission = "Please provide either a URL or upload a file";
    }
    
    // Validate URL format if provided
    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }
    
    // Validate project data availability
    if (!projectData) {
      newErrors.projectData = "Project data unavailable. Please try again.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (!projectData) {
        throw new Error("Project data is missing");
      }
      
      // Merge form data into structured description
      const structuredDescription = `name: ${formData.name.trim()}
email: ${formData.email.trim()}
payment link: ${formData.paymentLink.trim()}

${formData.description.trim()}`;
      
      // Prepare submission data
      const submissionData = {
        companyId: projectData.companyId,
        projectId: projectId,
        title: projectData.title,
        location: projectData.location || "Remote",
        date: new Date().toISOString(),
        status: "Pending",
        userId: user._id,
        userEmail: user.email,
        userName: user.name || user.username || user.email.split('@')[0],
        description: structuredDescription,
        submissionUrl: formData.url || "",
        projectType: projectData.projectType || "Challenge",
      };

      // Handle file upload if provided
      if (formData.file) {
        const fileFormData = new FormData();
        fileFormData.append("file", formData.file);
        
        const fileUploadResponse = await api.post("/api/upload", fileFormData);
        
        if (!formData.url) {
          submissionData.submissionUrl = fileUploadResponse.data.fileUrl;
        } else {
          submissionData.submissionFile = fileUploadResponse.data.fileUrl;
        }
      }
      
      // Submit to backend
      const response = await api.post("/api/projectjoined", submissionData);
      
      // Validate response
      if (response.data?.joinedProject) {
        const savedProject = response.data.joinedProject;
        const missingFields = [];
        
        if (!savedProject.description && structuredDescription) {
          missingFields.push('description');
        }
        if (!savedProject.submissionUrl && submissionData.submissionUrl) {
          missingFields.push('submissionUrl');
        }
        if (savedProject.submissionFile === undefined && submissionData.submissionFile) {
          missingFields.push('submissionFile');
        }
        
        if (missingFields.length > 0) {
          console.warn("Warning: Some fields were not saved properly:", missingFields);
        }
      }
      
      setSubmissionSuccess(true);
      
      // Auto-close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? 
                            "Missing required fields: " + Object.keys(error.response.data.errors).join(", ") : 
                            "Submission failed. Please try again.");
      
      setErrors({ submission: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Join Challenge</h2>
          <p className="text-slate-300 text-sm mt-1">Submit your solution and join the competition</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full mb-4"></div>
            <p className="text-slate-600 font-medium">Loading project details...</p>
          </div>
        )}

        {/* Error State */}
        {errors.fetchError && !isLoading && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Unable to Load Project</h3>
            <p className="text-slate-600 mb-4">{errors.fetchError}</p>
            <button 
              onClick={fetchProjectData}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success State */}
        {submissionSuccess && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Submission Successful!</h3>
            <p className="text-slate-600">Your challenge submission has been received and is under review.</p>
          </div>
        )}

        {/* Main Form */}
        {!isLoading && !errors.fetchError && !submissionSuccess && projectData && (
          <div className="p-6">
            {/* Project Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-slate-800 mb-3 text-lg">Project Overview</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-slate-700 min-w-20">Title:</span>
                  <span className="text-slate-600">{projectData.title}</span>
                </div>
                {projectData.location && (
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-700 min-w-20">Location:</span>
                    <span className="text-slate-600">{projectData.location}</span>
                  </div>
                )}
                {projectData.companyName && (
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-700 min-w-20">Company:</span>
                    <span className="text-slate-600">{projectData.companyName}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Global Error */}
              {errors.submission && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{errors.submission}</span>
                  </div>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-3">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all ${
                    errors.name ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm font-medium mt-2">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-3">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all ${
                    errors.email ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm font-medium mt-2">{errors.email}</p>
                )}
              </div>

              {/* Payment Link Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-3">
                  Payment Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="paymentLink"
                  value={formData.paymentLink}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all ${
                    errors.paymentLink ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  placeholder="https://buymeacoffee.com/yourname or your payment link"
                />
                {errors.paymentLink && (
                  <p className="text-red-600 text-sm font-medium mt-2">{errors.paymentLink}</p>
                )}
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    💡 <strong>Pro Tip:</strong> Use{" "}
                    <a 
                      href="https://getcode-lwui.onrender.com/upload.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-900 underline hover:no-underline font-medium"
                    >
                      our platform
                    </a>
                    {" "}or{" "}
                    <a 
                      href="https://buymeacoffee.com/signup" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-900 underline hover:no-underline font-medium"
                    >
                      similar services
                    </a>
                    {" "}to monetize your solution.
                  </p>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-3">
                  Solution Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all resize-none ${
                    errors.description ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  placeholder="Describe your solution approach, implementation details, key features, and technical stack..."
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.description ? (
                    <p className="text-red-600 text-sm font-medium">{errors.description}</p>
                  ) : (
                    <p className="text-slate-500 text-sm">
                      Minimum 20 characters required
                    </p>
                  )}
                  <p className="text-slate-400 text-sm">
                    {formData.description.length}/20
                  </p>
                </div>
              </div>

              {/* URL Field */}
              <div>
                <label className="block text-slate-700 font-semibold mb-3">
                  Project URL
                  <span className="text-slate-500 text-sm font-normal ml-2">(URL or file required)</span>
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all ${
                    errors.url ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  placeholder="https://github.com/yourproject or https://yourapp.com"
                />
                {errors.url && (
                  <p className="text-red-600 text-sm font-medium mt-2">{errors.url}</p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-slate-700 font-semibold mb-3">
                  Upload File
                  <span className="text-slate-500 text-sm font-normal ml-2">(URL or file required)</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-slate-700 font-medium mb-1">
                      {fileName ? fileName : "Choose a file to upload"}
                    </p>
                    <p className="text-slate-500 text-sm">Maximum size: 10MB</p>
                  </label>
                </div>
                {errors.file && (
                  <p className="text-red-600 text-sm font-medium mt-2">{errors.file}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:from-slate-900 hover:to-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Submit Challenge</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinChallengeModal;
