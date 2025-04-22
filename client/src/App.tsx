import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import ProjectDetail from "./pages/ProjectDetail";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { AppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/Viewapplications";
import AddProdArena from "./pages/AddProdArena";
import "quill/dist/quill.snow.css";
import ErrorBoundary from "./components/ErrorBoundary"; // Import your ErrorBoundary

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AppContext);
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/" />;
};

const App = () => {
  const { showRecruterLogin, showSignUp } = useContext(AppContext);

  return (
    <div>
      {showRecruterLogin && <Login />}
      {showSignUp && <SignUp />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/applications" element={<Applications />} />
        
        {/* Wrap with ErrorBoundary */}
        <Route
          path="/projects/:id"
          element={
            <ErrorBoundary>
              <ProjectDetail />
            </ErrorBoundary>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "company"]}>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route
            path="managejobs"
            element={
              <ErrorBoundary>
                <ManageJobs />
              </ErrorBoundary>
            }
          />
          <Route
            path="viewapplications"
            element={
              <ErrorBoundary>
                <ViewApplications />
              </ErrorBoundary>
            }
          />
          <Route
            path="addprodarena"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <ErrorBoundary>
                  <AddProdArena />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
