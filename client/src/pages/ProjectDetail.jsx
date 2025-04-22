import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets, Companies } from "../assets/assets";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import moment from "moment";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import JoinChallengeModal from "../components/JoinChallengeModal";

const formatPrize = (amount) => {
  if (!amount && amount !== 0) return "N/A";
  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ""), 10);
  if (numericAmount >= 1_000_000_000) return (numericAmount / 1_000_000_000).toLocaleString("fr-DZ") + " B DA";
  if (numericAmount >= 1_000_000) return (numericAmount / 1_000_000).toLocaleString("fr-DZ") + " M DA";
  if (numericAmount >= 1_000) return (numericAmount / 1_000).toLocaleString("fr-DZ") + " k DA";
  return numericAmount.toLocaleString("fr-DZ") + " DA";
};

const ProjectDetailItem = ({ icon, text }) => (
  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
    <img src={icon} alt="" className="w-5 h-5" />
    <span className="font-medium text-gray-700">{text}</span>
  </div>
);

const JoinButton = ({ className = "", onClick }) => (
  <button
    onClick={onClick}
    className={`bg-[#0A2463] p-3 px-8 text-white rounded-full font-semibold text-sm shadow-md hover:bg-[#08184a] hover:shadow-lg transition-all duration-300 flex items-center gap-2 ${className}`}
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
    if (projects && projects.length > 0) {
      const currentProject = projects.find((project) => project._id === id);
      if (currentProject) {
        const company = Companies.find((c) => c._id === currentProject.companyId) || {
          name: "Unknown Company",
          image: assets.default_company || "",
          _id: "unknown",
          description: "Information about this company is not available"
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
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [id, projects]);

  if (isLoading) return <Loading />;
  if (!projectData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-700">Challenge Not Found</h2>
        <p className="text-gray-500 mt-2">The challenge you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>
  );

  const { title, company, location, difficulty, prize, postedDate, description, duration } = projectData;
  const formattedDate = postedDate ? moment(postedDate).format("MMM DD, YYYY") : "Date not available";
  const timeAgo = postedDate ? moment(postedDate).fromNow() : "Recently";

  // Ensure company exists and has required properties
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
          <nav className="flex mb-6 text-sm text-gray-500">
            <a href="/" className="hover:text-[#0A2463]">Home</a>
            <span className="mx-2">/</span>
            <a href="/projects" className="hover:text-[#0A2463]">Challenges</a>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium truncate">{title}</span>
          </nav>

          <header className="bg-gradient-to-tr from-sky-100 to-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-sky-200/50">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-sky-50 rounded-2xl transform rotate-6 opacity-30"></div>
                <img
                  className="relative h-24 w-24 md:h-28 md:w-28 bg-white rounded-2xl p-4 object-contain border border-sky-100 shadow-md"
                  src={companyImage}
                  alt={`${companyName} logo`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = assets.default_company || "";
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">{title}</h1>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{difficulty || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <span className="font-medium text-gray-700">{companyName}</span>
                  <span>•</span>
                  <span>{locationText}</span>
                  <span>•</span>
                  <span title={formattedDate}>{timeAgo}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 mb-2">
                  <ProjectDetailItem icon={assets.money_icon} text={formatPrize(prize)} />
                  <ProjectDetailItem icon={assets.location_icon} text={locationText} />
                  <ProjectDetailItem icon={assets.person_icon} text={difficulty || "Not specified"} />
                  {duration && <ProjectDetailItem icon={assets.suitcase_icon} text={duration} />}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <JoinButton onClick={handleJoin} />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Posted {formattedDate}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-[#0A2463]/10 to-transparent border-b px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-800">Challenge Description</h2>
                </div>
                <div className="p-6">
                  <div
                    className="prose prose-blue max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: description || "No description provided for this challenge." }}
                  />
                </div>
              </section>

              <section id="join-form" className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-[#0A2463]/10 to-transparent border-b px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-800">Join this Challenge</h2>
                </div>
                <div className="p-6 text-center sm:text-left">
                  <p className="text-gray-600 mb-6">Ready to showcase your innovation skills? Join this challenge now!</p>
                  <JoinButton className="mx-auto sm:mx-0" onClick={handleJoin} />
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <aside className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                
              </aside>

              {relatedProjects.length > 0 && (
                <aside className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-[#0A2463]/10 to-transparent border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-800">Similar Challenges</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {relatedProjects.map((project, index) => (
                      <ProductCard key={project._id || index} product={project} />
                    ))}
                    <a href={`/organizer/${companyId}`} className="block text-center mt-4 text-[#0A2463] hover:text-[#08184a] font-medium">
                      View all challenges from {companyName} →
                    </a>
                  </div>
                </aside>
              )}

              <aside className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-[#0A2463]/10 to-transparent border-b px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-800">Challenge Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium p-2 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save Challenge
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium p-2 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Challenge
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium p-2 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report Challenge
                  </button>
                </div>
              </aside>
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