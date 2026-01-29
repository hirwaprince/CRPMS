// src/components/Sidebar.tsx

import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCar,
  FaTools,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartBar,
  FaSignOutAlt,
  FaTachometerAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/cars", icon: FaCar, label: "Cars" },
    { path: "/services", icon: FaTools, label: "Services" },
    { path: "/service-records", icon: FaClipboardList, label: "Service Records" },
    { path: "/payments", icon: FaMoneyBillWave, label: "Payments" },
    { path: "/reports", icon: FaChartBar, label: "Reports" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-xl z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Logo size="md" showText={true} textColor="text-white" />
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white text-gray-900 font-semibold"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <item.icon className="text-lg" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-medium text-white">{user?.username || "User"}</p>
            <p className="text-xs text-gray-400">{user?.fullName || "Chief Mechanic"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}