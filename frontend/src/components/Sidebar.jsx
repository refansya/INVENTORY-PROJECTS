import React from "react";
import {
  FaBox,
  FaCog,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaTable,
  FaTruck,
  FaUsers,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext"; 

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <FaHome />, isParent: true },
    { name: "Categories", path: "/admin-dashboard/Categories", icon: <FaTable /> },
    { name: "Products", path: "/admin-dashboard/Products", icon: <FaBox /> },
    { name: "Suppliers", path: "/admin-dashboard/Suppliers", icon: <FaTruck /> },
    { name: "StockOpname", path: "/admin-dashboard/StockOpname", icon: <FaBox /> },
    { name: "BarangIn", path: "/admin-dashboard/BarangIn", icon: <FaShoppingCart /> },
    { name: "BarangOut", path: "/admin-dashboard/BarangOut", icon: <FaShoppingCart /> },
    { name: "Users", path: "/admin-dashboard/Users", icon: <FaUsers /> },
    { name: "Profile", path: "/admin-dashboard/Profile", icon: <FaCog /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-white w-16 md:w-64 fixed">
      <div className="h-16 flex flex-col items-center justify-center">
        <span className="hidden md:block text-xl font-bold">Inventory</span>
        <span className="md:hidden text-xl font-bold">IMS</span>

        {/* Hello User */}
        {user && (
          <span className="hidden md:block text-sm mt-2">
            Hello, {user.name || "User"}
          </span>
        )}
      </div>

      {/* Menu */}
      <ul className="space-y-2 p-2 flex-1">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              end={item.isParent}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start p-2 rounded-md hover:bg-gray-700 transition duration-200 ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="ml-4 hidden md:block">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center md:justify-start p-2 m-2 rounded-md hover:bg-red-600 transition duration-200"
      >
        <FaSignOutAlt className="text-xl" />
        <span className="ml-4 hidden md:block">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
