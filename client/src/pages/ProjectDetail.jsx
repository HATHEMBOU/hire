import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import Link for navigation
import { AppContext } from "../context/AppContext";
import { assets, Companies } from "../assets/assets";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import moment from "moment";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import JoinChallengeModal from "../components/JoinChallengeModal";

// Helper to format prize money for readability
const formatPrize = (amount) => {
  if (!amount && amount !== 0) return "N/A";
  const numericAmount = parseInt(String(amount).replace(/[^0-9]/g, ""), 10);
  if (isNaN(numericAmount)) return "N/A";
  if (numericAmount >= 1_000_000_000) return (numericAmount / 1_000_000_000).toLocaleString("en-US") + " B $";
  if (numericAmount >= 1_000_000) return (numericAmount / 1_000_000).toLocaleString("en-US") + " M $";
  if (numericAmount >= 1_000) return (numericAmount / 1_000).toLocaleString("en-US") + " K $";
  return numericAmount.toLocaleString("en-US") + " $";
};

const ProjectDetailItem = ({ icon, text }) => (
  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-gray-200/50">
    <img src={icon} alt="" className="w-5 h-5" />
    <span className="font-medium text-gray-700">{text}</span>
  </div>
);

const JoinButton = ({ className = "", onClick }) => (
  <button
    onClick={onClick}
    className={`bg-[#0A2463] p-3 px-8 text-white rounded-full font-semibold text-sm shadow-md hover:bg-[#08184a] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${className}`}
  >
    <span>Join Challenge</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  </button>
);

const ProjectDetail = () => {
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projects, user, setShowRecruterLogin } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJoin = () => {
    if (!user) {
      setShowRecruterLogin(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    setIsLoading(true);
    if (projects && projects.length > 0) {
      const currentProject = projects.find((project) => project._id === id);
      if (currentProject) {
        // Find company data or use a fallback
        const company = Companies.find((c) => c._id === currentProject.companyId) || {
          name: "Unknown Company",
          image: assets.default_company || "",
          _id: currentProject.companyId || "unknown", // Preserve the ID if it exists
          description: "Information about this company is not available."
        };
        setProjectData({ ...currentProject, company });
        
        // Find related projects only if there's a valid companyId
        if (currentProject.companyId) {
          const related = projects
            .filter((project) => project._id !== id && project.companyId === currentProject.companyId)
            .slice(0, 3);
          setRelatedProjects(related);
        }
      }
    }
    setIsLoading(false);
  }, [id, projects]);

  if (isLoading) return <Loading />;
  
  if (!projectData) return (
    <>
      <Navbar />
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-700">Challenge Not Found</h2>
          <p className="text-gray-500 mt-2">The challenge you're looking for doesn't exist or has been removed.</p>
          <Link to="/projects" className="mt-6 inline-block bg-[#0A2463] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#08184a] transition-colors">
            Back to Challenges
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );

  const { title, company, location, difficulty, prize, postedDate, description, duration } = projectData;
  const formattedDate = postedDate ? moment(postedDate).format("MMM DD, YYYY") : "Date not available";
  const timeAgo = postedDate ? moment(postedDate).fromNow() : "Recently";

  // Ensure company exists and has required properties for rendering
  const companyName = company?.name || "Unknown Company";
  const companyImage = company?.image || assets.default_company || "";
  const companyId = company?._id || "unknown";
  const companyDesc = company?.description || `${companyName} is hosting innovation challenges to discover talented creators.`;
  const locationText = location || "Remote";

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
        <main className="container mx-auto px-4 pt-6 pb-16">
          {/* --- BREADCRUMBS --- */}
          <nav className="flex mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#0A2463]">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/projects" className="hover:text-[#0A2463]">Challenges</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium truncate">{title}</span>
          </nav>

          {/* --- HEADER --- */}
          <header className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200/50">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <img
                className="h-24 w-24 md:h-28 md:w-28 bg-white rounded-2xl p-2 object-contain border border-gray-100 shadow-md"
                src={companyImage}
                alt={`${companyName} logo`}
                onError={(e) => { e.target.src = assets.default_company || ""; }}
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">{title}</h1>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{difficulty || "Not specified"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start flex-wrap gap-x-2 gap-y-1 text-gray-600 mb-4">
                  <span className="font-medium text-gray-700">{companyName}</span>
                  <span>•</span>
                  <span>{locationText}</span>
                  <span>•</span>
                  <span title={formattedDate}>{timeAgo}</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  <ProjectDetailItem icon={assets.money_icon} text={formatPrize(prize)} />
                  <ProjectDetailItem icon={assets.location_icon} text={locationText} />
                  <ProjectDetailItem icon={assets.person_icon} text={difficulty || "Not specified"} />
                  {duration && <ProjectDetailItem icon={assets.suitcase_icon} text={duration} />}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2 shrink-0 mt-4 md:mt-0">
                <JoinButton onClick={handleJoin} />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Posted {formattedDate}</span>
                </div>
              </div>
            </div>
          </header>

          {/* --- MAIN CONTENT GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- LEFT COLUMN: DESCRIPTION --- */}
            <div className="lg:col-span-2">
              <section className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-gray-50 border-b px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-800">Challenge Description</h2>
                </div>
                <div className="p-6">
                  <div
                    className="prose prose-blue max-w-none prose-p:text-gray-600 prose-li:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: description || "No description provided for this challenge." }}
                  />
                </div>
              </section>
            </div>

            {/* --- RIGHT COLUMN: SIDEBAR --- */}
            <div className="space-y-6">
              {/* Related Challenges Card */}
              {relatedProjects.length > 0 && (
                <aside className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-800">More from {companyName}</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {relatedProjects.map((project) => (
                      <ProductCard key={project._id} product={project} />
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>
      </div>
      <JoinChallengeModal isOpen={isModalOpen} onClose={handleCloseModal} projectId={id} projectTitle={title} />
      <Footer />
    </>
  );
};

export default ProjectDetail;
