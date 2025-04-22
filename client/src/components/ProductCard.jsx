import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, Award } from "lucide-react";
// Import the image directly - this ensures Webpack/bundler processes it
import projectImage from "../assets/images/project.jpg"; // Adjust path as needed

// Component for handling project images with reliable fallbacks
const ProjectImage = ({ title }) => {
  const [useImageFallback, setUseImageFallback] = React.useState(false);
  
  const handleImageError = () => {
    console.log("Image failed to load, using CSS fallback");
    setUseImageFallback(true);
  };
  
  // If the image fails to load, use a colored div as fallback
  if (useImageFallback) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100">
        <div className="text-gray-500 font-medium text-center px-4">
          {title}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-gradient-to-r from-blue-100 to-indigo-100">
      <img
        src={projectImage} // Use the imported image
        alt={title}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  );
};

const ProductCard = ({ product, viewMode }) => {
  const navigate = useNavigate();

  // Safety check - if product is invalid, don't render anything
  if (!product || typeof product !== "object") {
    console.warn("Invalid product data received by ProductCard");
    return null;
  }

  // Get properties with safe fallbacks
  const title = product.title || "Untitled Project";
  const category = product.category || "Uncategorized";
  const difficulty = product.difficulty || "Unknown";
  const description = product.description || "No description available";

  // Format date with safe checks
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  // Get appropriate color based on difficulty level
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCardClick = () => {
    if (product._id) {
      navigate(`/projects/${product._id}`);
    } else {
      console.warn("Product has no ID, cannot navigate");
    }
  };

  // List view layout
  if (viewMode === "list") {
    return (
      <div
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row"
        onClick={handleCardClick}
      >
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <ProjectImage title={title} />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>
        
        <div className="p-5 md:w-2/3">
          <div className="text-xs uppercase font-medium text-blue-600 mb-2">{category}</div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{product.estimatedTime || "N/A"}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(product.createdAt)}</span>
            </div>
            
            {product.prize && (
              <div className="flex items-center">
                <Award size={14} className="mr-1" />
                <span>${product.prize}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default grid view layout
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48">
        <ProjectImage title={title} />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="text-xs uppercase font-medium text-blue-600 mb-2">{category}</div>
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{product.estimatedTime || "N/A"}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(product.createdAt)}</span>
          </div>
          
          {product.prize && (
            <div className="flex items-center">
              <Award size={14} className="mr-1" />
              <span>${product.prize}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;