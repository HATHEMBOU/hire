// server/server.js

// --- Core Imports ---
import express from "express";
import cors from "cors";
import "dotenv/config"; // Loads .env variables into process.env
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// --- Configuration & Utilities ---
import connectDB from "./config/db.js";
import "./config/instrument.js"; // Assuming this initializes Sentry or similar
import *:// Sentry setup and webhook handling need specific care
import { clerkWebhooks } from "./controllers/webhooks.js"; // Make sure this path is correct

// --- Models ---
// It's often better practice to import models within controllers/routes where needed,
// but keeping them here based on your original structure for now.
import User from "./models/User.js";
import Company from "./models/Company.js";
import Project from "./models/Project.js";
import ManageProject from "./models/ManageProject.js";
import ProjectJoined from "./models/ProjectJoined.js";
import ViewApplication from "./models/ViewApplication.js";
import Application from "./models/Application.js";

// --- Route Imports ---
// Ensure correct file paths and case sensitivity
import projectJoinedRoutes from './routes/projectJoinedRoutes.js';
import applicationRoutes from "./routes/ApplicationRoutes.js";
import viewApplicationRoutes from "./routes/viewApplicationRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import manageProjectRoutes from "./routes/manageProjectRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// --- Initialize Express App ---
const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'https://enchanting-lollipop-cc8ee1.netlify.app', // Your Deployed Netlify Frontend URL
  'http://localhost:5173'                          // Your Local Frontend Dev URL (Optional)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin OR from allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If frontend sends cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight requests
  allowedHeaders: ['Content-Type', 'Authorization'] // Headers frontend might send
};

// Apply CORS Middleware FIRST
app.use(cors(corsOptions));

// Handle Preflight Requests (important for complex CORS scenarios)
app.options('*', cors(corsOptions)); // Allow preflight requests for all routes

// --- Standard Middleware ---
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// --- Sentry Initialization (if used) ---
// Sentry.init({ dsn: process.env.SENTRY_DSN });
// Consider adding Sentry request handler here if needed: app.use(Sentry.Handlers.requestHandler());

// --- API Routes ---
app.get("/", (req, res) => res.send("API working")); // Health check / base route

// Use imported route files
app.use("/api/upload", uploadRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/viewapplications", viewApplicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projectjoined", projectJoinedRoutes);
app.use("/api/manageprojects", manageProjectRoutes);
app.use("/api/projects", projectRoutes);

// Inline routes (Consider moving these to respective route files later for better organization)
// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Send only necessary, non-sensitive user data
    res.json({ _id: user._id, name: user.name, email: user.email, image: user.image, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    // Sentry.captureException(error); // Uncomment if using Sentry
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Register Route
app.post("/api/register", async (req, res) => {
  const { email, password, name, image, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      image,
      role: role || "user" // Default to 'user' if role not provided
    });
    await user.save();
    // Send only necessary, non-sensitive user data
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    // Sentry.captureException(error); // Uncomment if using Sentry
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Company Routes (Consider moving to routes/companyRoutes.js)
app.post("/api/companies", async (req, res) => {
  const { name, email, image } = req.body;
  try {
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) return res.status(400).json({ message: "Company email already exists" });
    const company = new Company({ _id: name.toLowerCase().replace(/\s+/g, ""), name, email, image });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    console.error("Company creation error:", error);
    // Sentry.captureException(error); // Uncomment if using Sentry
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/companies", async (req, res) => {
  try {
    const companies = await Company.find();
    // It's okay if no companies are found, just return an empty array
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    // Sentry.captureException(error); // Uncomment if using Sentry
    return res.status(500).json({ message: "Error fetching companies", error: error.message });
  }
});

// Get applications for a specific project (Consider moving to applicationRoutes.js)
app.get("/api/projects/:id/applications", async (req, res) => {
  try {
    const applications = await Application.find({ projectId: req.params.id })
      .populate("userId", "name email image"); // Populate user details
    // It's okay if no applications are found, just return an empty array
    res.json(applications);
  } catch (error) {
    console.error("Error fetching project applications:", error);
    // Sentry.captureException(error); // Uncomment if using Sentry
    return res.status(500).json({ message: "Error fetching applications", error: error.message });
  }
});

// Admin: Delete a project (Consider moving to projectRoutes.js with admin middleware)
app.delete("/api/admin/projects/:id", async (req, res) => {
  // Add authentication/authorization middleware here to check if user is admin
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    // Sentry.captureException(error); // Uncomment if using Sentry
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// --- Webhook Route ---
// Note: Webhooks often require raw body parsing. If Clerk needs this,
// this route might need to be placed *before* express.json(). Test carefully.
app.post("/webhooks", (req, res) => clerkWebhooks(req, res, mongoose));


// --- Sentry Error Handler (if used) ---
// Must be placed *after* all controllers and routes
// app.use(Sentry.Handlers.errorHandler());

// --- Basic Error Handler ---
// Catches errors not handled by Sentry or specific routes
app.use(function onError(err, req, res, next) {
  console.error("Unhandled Error:", err); // Log the error for debugging
  res.statusCode = err.status || 500; // Use error status or default to 500
  res.json({
       message: err.message || "An unexpected error occurred.",
       // Optionally include stack trace in development only
       // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000; // Use Render's port or default

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Accepting requests from: ${allowedOrigins.join(', ')}`); // Log allowed origins
    });
  })
  .catch(err => {
    console.error("CRITICAL: Failed to connect to MongoDB or start server:", err);
    process.exit(1); // Exit if DB connection fails
  });