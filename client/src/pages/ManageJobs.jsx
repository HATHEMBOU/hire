import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import axios from "axios";
import { AppContext } from "../context/AppContext";


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ManageJobs = () => {
  const { user } = useContext(AppContext);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const endpoint = user.role === "admin" ? "/api/admin/projects" : "/api/projects";
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        
        // Filtrer les projets où companyId correspond à l'email de l'utilisateur
        const filteredProjects = user.role === "company" 
          ? response.data.filter(p => p.companyId === user.email)
          : response.data;
        
        console.log("Projets récupérés:", filteredProjects);
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Impossible de charger les projets");
      }
    };
    fetchProjects();
  }, [user]);

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      console.log("Tentative de mise à jour du projet avec ID:", id);
      console.log("Valeur actuelle de visibilité:", currentVisibility);
      console.log("Nouvelle valeur de visibilité:", !currentVisibility);
      
      // Vérifier si l'ID est au format MongoDB ou UUID
      if (!id.match(/^[0-9a-fA-F]{24}$/) && id.includes('-')) {
        console.warn("L'ID semble être un UUID et non un ObjectID MongoDB");
      }
      
      const response = await axios.put(
        `${API_BASE_URL}/api/projects/${id}`, 
        { 
          visible: !currentVisibility 
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Réponse du serveur:", response.data);
      
      if (response.status === 200) {
        setProjects(projects.map(p => p._id === id ? { ...p, visible: !currentVisibility } : p));
        setError(null);
      } else {
        console.error("Failed to update visibility, server returned:", response.status);
        setError("Échec de la mise à jour de la visibilité");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      if (error.response) {
        console.error("Error details:", error.response.data);
        setError(`Erreur: ${error.response.data.error || "Échec de la mise à jour"}`);
      } else {
        setError("Erreur de connexion au serveur");
      }
    }
  };

  const deleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/admin/projects/${id}`);
        setProjects(projects.filter(p => p._id !== id));
        setError(null);
      } catch (error) {
        console.error("Error deleting project:", error);
        setError("Impossible de supprimer le projet");
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Jobs</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deadline</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applicants</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Visible</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project._id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}>
                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{project._id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{project.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{moment(project.postedDate).format("ll")}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{project.location}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{project.applicants || 0}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.visible !== false}
                      onChange={() => toggleVisibility(project._id, project.visible)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs font-medium text-blue-700 hover:text-blue-900">Edit</button>
                    {user.role === "admin" && (
                      <button onClick={() => deleteProject(project._id)} className="px-3 py-1 text-xs font-medium text-red-700 hover:text-red-900">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {projects.length === 0 && <div className="text-center py-8 text-gray-500">No jobs found</div>}
    </div>
  );
};

export default ManageJobs;