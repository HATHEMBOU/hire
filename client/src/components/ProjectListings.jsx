import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import ProductCard from "./ProductCard";
import { Search, Filter, Grid3x3, List, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProjectListings = () => {
  const { projects } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Constants
  const projectsPerPage = 6;
  const projectCategories = useMemo(() => ["Web Development", "Mobile", "Data Science", "UI/UX", "AI/ML"], []);

  // Process projects data
  useEffect(() => {
    setIsLoading(true);

    // Safety check for projects array
    if (!Array.isArray(projects)) {
      console.warn("⚠️ 'projects' is not an array:", projects);
      setFilteredProjects([]);
      setIsLoading(false);
      return;
    }

    // Filter out invalid projects
    const validProjects = projects.filter(
      (project) =>
        project &&
        typeof project === "object" &&
        project._id &&
        typeof project.title === "string"
    );

    // Create unique projects map
    const uniqueProjects = Array.from(
      new Map(validProjects.map((project) => [project._id, project])).values()
    );

    // Apply processing with delay for smoother UX
    setTimeout(() => {
      setFilteredProjects(uniqueProjects);
      setIsLoading(false);
    }, 400);
  }, [projects]);

  // Apply filtering and sorting
  const displayedProjects = useMemo(() => {
    let result = [...filteredProjects];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(term) || 
        (project.description && project.description.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (activeFilter !== "all") {
      result = result.filter(project => 
        project.category && project.category.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        return result.slice().reverse();
      case "oldest":
        return result;
      case "alphabetical":
        return result.slice().sort((a, b) => a.title.localeCompare(b.title));
      default:
        return result;
    }
  }, [filteredProjects, searchTerm, activeFilter, sortOption]);

  // Calculate pagination
  const totalPages = Math.ceil(displayedProjects.length / projectsPerPage);
  const currentProjects = displayedProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, sortOption]);

  // Pagination controls
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of listings
    document.getElementById("project-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  // Handle reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setActiveFilter("all");
    setSortOption("newest");
    setCurrentPage(1);
  }, []);

  // Skeleton loader for projects
  const ProjectSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="bg-gray-200 h-48 w-full animate-pulse"></div>
          <div className="p-5">
            <div className="bg-gray-200 h-5 w-3/4 mb-3 rounded animate-pulse"></div>
            <div className="bg-gray-200 h-4 w-full mb-2 rounded animate-pulse"></div>
            <div className="bg-gray-200 h-4 w-5/6 mb-4 rounded animate-pulse"></div>
            <div className="flex justify-between items-center">
              <div className="bg-gray-200 h-8 w-24 rounded-full animate-pulse"></div>
              <div className="bg-gray-200 h-8 w-8 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 mb-4">
        <Filter size={24} className="text-blue-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">No projects found</h3>
      <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
      <button 
        onClick={resetFilters}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg mx-auto hover:bg-blue-700 transition-colors"
      >
        <RefreshCw size={16} />
        <span>Reset filters</span>
      </button>
    </div>
  );

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="container 2xl:px-20 mx-auto py-8">
        <section className="w-full text-gray-800 px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-gray-200 h-8 w-48 rounded animate-pulse"></div>
            <div className="bg-gray-200 h-8 w-32 rounded animate-pulse"></div>
          </div>
          <div className="bg-gray-200 h-12 w-full rounded mb-8 animate-pulse"></div>
          <ProjectSkeleton />
        </section>
      </div>
    );
  }

  return (
    <div className="container 2xl:px-20 mx-auto py-8">
      {/* Project Listings */}
      <section className="w-full text-gray-800 px-4">
        {/* Header & Meta */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h3 className="font-bold text-3xl text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500" id="project-list">
              Latest Challenges
            </h3>
            <p className="text-gray-600 mt-1">Join a challenge and showcase your innovation skills</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 font-medium">
              {displayedProjects.length} {displayedProjects.length === 1 ? "project" : "projects"} found
            </span>
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex-shrink-0 min-w-48">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E\")", backgroundPosition: "right 0.75rem center", paddingRight: "2.5rem" }}
              >
                <option value="all">All Categories</option>
                {projectCategories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort Order */}
            <div className="flex-shrink-0 min-w-48">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E\")", backgroundPosition: "right 0.75rem center", paddingRight: "2.5rem" }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
            
            {/* Reset Button - Visible if filters are applied */}
            {(searchTerm || activeFilter !== "all" || sortOption !== "newest") && (
              <button 
                onClick={resetFilters}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Grid */}
        <AnimatePresence mode="wait">
          {currentProjects.length > 0 ? (
            <motion.div
              key="projects-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "flex flex-col gap-4"
              }
            >
              {currentProjects.map((project) => {
                if (!project || typeof project !== "object" || !project.title) {
                  return null;
                }
                
                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <ProductCard 
                      product={project} 
                      viewMode={viewMode}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyState />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Dynamic page buttons - show first, last, and pages around current */}
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                
                // Show first page, last page, and pages around current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        currentPage === pageNumber
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-blue-50"
                      }`}
                      aria-label={`Page ${pageNumber}`}
                      aria-current={currentPage === pageNumber ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                
                // Show dots if there's a gap
                if (
                  (pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={pageNumber} className="w-10 h-10 flex items-center justify-center text-gray-400">
                      ...
                    </span>
                  );
                }
                
                return null;
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectListings;