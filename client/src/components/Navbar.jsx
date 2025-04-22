import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  // Destructure what's available in the context including logout function
  const { user, logout, setShowRecruterLogin, setShowSignUp } = useContext(AppContext);
  const navigate = useNavigate();

  // Debug logging to check user data
  useEffect(() => {
    console.log("Current user in Navbar:", user);
    console.log("Current user role:", user?.role);
  }, [user]);

  // Updated nav items to match actual routes in App.js
  const getNavItems = () => {
    console.log("Determining nav items based on role:", user?.role);
    
    if (user?.role === "company") {
      return [
        { path: "/", label: "Home" },
        { path: "/dashboard/managejobs", label: "Manage Jobs" },
        { path: "/dashboard/viewapplications", label: "View Applications" },
        { path: "/dashboard/addprodarena", label: "Add Prod Arena" },
      ];
    } else if (user?.role === "admin") {
      return [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/dashboard/managejobs", label: "Manage Jobs" },
        { path: "/dashboard/viewapplications", label: "View Applications" },
      ];
    } else {
      console.log("Using default nav items because role is:", user?.role);
      return [
        { path: "/", label: "Home" },
        { path: "/applications", label: "Applications" }
      ];
    }
  };

  // Get nav items based on user role
  const navItems = getNavItems();

  // Handle sign out using context's logout function
  const handleSignOut = () => {
    console.log("Signing out user:", user);
    logout();
    navigate("/");
    console.log("Sign out completed");
  };

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 transition-transform hover:scale-105"
            aria-label="HireNext Home"
          >
            <img
              src={assets.hiho}
              alt="HireNext Logo"
              className="h-9 md:h-11 w-auto object-contain"
              loading="lazy"
            />
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-gray-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 hidden lg:inline-block">
                    Welcome, {user.name || "User"} 
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-3 py-2 rounded-md hover:bg-gray-100"
                    type="button"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowRecruterLogin(true)}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowSignUp(true)}
                  className="bg-[#00B4D8] hover:bg-[#0094b8] text-white px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;