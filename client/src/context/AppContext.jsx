import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showRecruterLogin, setShowRecruterLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userApplications, setUserApplications] = useState([]); // Add user applications state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to determine role based on user info
  const getUserRole = (userData) => {
    // If user has a role property, use it
    if (userData.role) {
      return userData.role;
    }
    
    // If no role but username is "company" or "admin", use that as the role
    if (userData.name) {
      if (userData.name.toLowerCase() === "company") {
        return "company";
      }
      if (userData.name.toLowerCase() === "admin") {
        return "admin";
      }
    }
    
    // If email contains company or admin, use that as role
    if (userData.email) {
      if (userData.email.toLowerCase().includes("company")) {
        return "company";
      }
      if (userData.email.toLowerCase().includes("admin")) {
        return "admin";
      }
    }
    
    // Default to regular user
    return "user";
  };

  // Function to enhance user data with role
  const enhanceUserData = (userData) => {
    if (!userData) return null;
    
    // If role is missing, add it based on name or email
    if (!userData.role) {
      return {
        ...userData,
        role: getUserRole(userData)
      };
    }
    
    return userData;
  };

  // Fetch projects from backend on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(`${API_BASE_URL}/api/projects`);
        

        const projectData = response.data;

        if (Array.isArray(projectData)) {
          setProjects(projectData);
          console.log("✅ Projects loaded:", projectData.length);
        } else {
          console.warn("⚠️ Project data is not an array", projectData);
          setProjects([]);
        }

        setError(null);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
        setError("Failed to fetch projects");
        setProjects([]); // fallback to safe state
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Load user from localStorage or sessionStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Enhance user data with role if needed
        const enhancedUser = enhanceUserData(parsedUser);
        console.log("Loading user from storage with role:", enhancedUser.role);
        setUser(enhancedUser);
        
        // Fetch user applications once user is loaded
        if (enhancedUser && enhancedUser._id) {
          fetchUserApplications(enhancedUser._id);
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    }
  }, []);
  
  // Function to fetch user applications
  const fetchUserApplications = async (userId) => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications/user/${userId}`);
      
      if (Array.isArray(response.data)) {
        // Process data to ensure application objects have proper project data in string form
        const processedApplications = response.data.map(app => {
          // Ensure project data is properly formatted - convert object properties to strings if needed
          if (app.project) {
            return {
              ...app,
              project: {
                ...app.project,
                // Convert any object values to strings to prevent React child issues
                name: app.project.name ? String(app.project.name) : '',
                logo: app.project.logo ? String(app.project.logo) : '',
                description: app.project.description ? String(app.project.description) : ''
              }
            };
          }
          return app;
        });
        
        setUserApplications(processedApplications);
        console.log("✅ User applications loaded:", processedApplications.length);
      } else {
        console.warn("⚠️ Applications data is not an array", response.data);
        setUserApplications([]);
      }
    } catch (err) {
      console.error("❌ Error fetching user applications:", err);
      setUserApplications([]);
    }
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
      let userData = response.data;
      
      // Add role if missing
      userData = enhanceUserData(userData);
      
      console.log("Login successful, user data with role:", userData);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setShowRecruterLogin(false);
      
      // Fetch user applications after login
      if (userData && userData._id) {
        fetchUserApplications(userData._id);
      }
      
      return userData;
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      alert("Login failed: " + (error.response?.data?.message || "Server error"));
      throw error;
    }
  };

  // Register handler with improved role handling
  const register = async (email, password, name, image, role = "user") => {
    console.log("Registering with role:", role);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        email,
        password,
        name,
        image,
        role,
      });
      
      let userData = response.data;
      
      // Make sure role is present
      if (!userData.role) {
        userData = {
          ...userData,
          role: role // Use the role that was passed to register
        };
      }
      
      console.log("Registration successful, user data with role:", userData);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setShowSignUp(false);
      
      // Initialize empty applications for new user
      setUserApplications([]);
      
      return userData;
    } catch (error) {
      console.error("Registration error:", error.response?.data?.message || error.message);
      alert("Registration failed: " + (error.response?.data?.message || "Server error"));
      throw error;
    }
  };

  // Function to apply for a project
  const applyForProject = async (projectId, solutionLink) => {
    if (!user || !user._id) {
      alert("You must be logged in to apply for projects");
      return null;
    }
    
    try {
      const applicationData = {
        userId: user._id,
        projectId,
        solutionLink,
        submittedAt: new Date(),
        status: "Pending"
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/applications`, applicationData);
      
      // Update local applications state
      const newApplication = response.data;
      
      // Find the project details from our projects list
      const projectDetails = projects.find(p => p._id === projectId);
      
      // Add project details to the application object
      if (projectDetails) {
        newApplication.project = {
          name: projectDetails.name ? String(projectDetails.name) : '',
          logo: projectDetails.logo ? String(projectDetails.logo) : '',
          description: projectDetails.description ? String(projectDetails.description) : ''
        };
      }
      
      setUserApplications(prev => [newApplication, ...prev]);
      
      console.log("✅ Successfully applied for project:", projectId);
      return newApplication;
    } catch (error) {
      console.error("❌ Error applying for project:", error);
      alert("Failed to submit application: " + (error.response?.data?.message || "Server error"));
      return null;
    }
  };

  // Manual function to update user data in context and storage
  const updateUserData = (userData) => {
    if (!userData) return;
    
    const enhancedUser = enhanceUserData(userData);
    setUser(enhancedUser);
    
    // Update in storage where it exists
    if (localStorage.getItem("user")) {
      localStorage.setItem("user", JSON.stringify(enhancedUser));
    }
    if (sessionStorage.getItem("user")) {
      sessionStorage.setItem("user", JSON.stringify(enhancedUser));
    }
    
    // If user ID changed, fetch applications for the new user
    if (enhancedUser && enhancedUser._id) {
      fetchUserApplications(enhancedUser._id);
    }
    
    return enhancedUser;
  };

  // Improved logout function
  const logout = () => {
    console.log("Logging out user:", user);
    setUser(null);
    setUserApplications([]); // Clear applications on logout
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    console.log("User logged out successfully");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser: updateUserData, // Replace setUser with enhanced version
        showRecruterLogin,
        setShowRecruterLogin,
        showSignUp,
        setShowSignUp,
        projects: projects || [], // ensures array
        userApplications, // expose applications to components
        fetchUserApplications, // expose function to components
        applyForProject, // expose function to components
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};