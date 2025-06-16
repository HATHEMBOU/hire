import React, { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AppContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <div className="shadow py-4">
        <div className="px-5 flex justify-between items-center">
          <img
            onClick={() => navigate("/")}
            className="w-40 max-sm:w-32 cursor-pointer transition-opacity hover:opacity-80"
            src={assets.hiho}
            alt="Logo"
          />
          <div className="flex items-center gap-3">
            <p className="max-sm:hidden">Welcome, {user?.name}</p>
            <div className="relative group">
              <img className="w-8 border rounded-full" src={user?.image || assets.company_icon} alt="Profile" />
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12">
                <ul className="list-none m-0 p-2 bg-white rounded-md border text-sm">
                  <li onClick={handleLogout} className="py-1 px-2 cursor-pointer pr-10 hover:bg-gray-100">
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <div className="inline-block min-h-screen border-r-2">
          <ul className="flex flex-col items-start pt-5 text-gray-800">
            {user?.role === "company" && (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && "bg-blue-100 border-r-4 border-blue-500"}`
                }
                to={"/dashboard/addprodarena"}
              >
                <img className="min-w-4" src={assets.add_icon} alt="" />
                <p className="max-sm:hidden">Add ProdArena</p>
              </NavLink>
            )}
<NavLink
  className={({ isActive }) =>
    `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && "bg-blue-100 border-r-4 border-blue-500"}`
  }
  to={"/dashboard/managejobs"} // Corrected from "Managejobes"
>
  <img className="min-w-4" src={assets.home_icon} alt="" />
  <p className="max-sm:hidden">Manage Projects</p>
</NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && "bg-blue-100 border-r-4 border-blue-500"}`
              }
              to={"/dashboard/viewapplications"}
            >
              <img className="min-w-4" src={assets.person_tick_icon} alt="" />
              <p className="max-sm:hidden">View Applications</p>
            </NavLink>
            
          </ul>
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
