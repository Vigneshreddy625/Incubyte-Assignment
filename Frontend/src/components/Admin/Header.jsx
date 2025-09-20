import React from "react";
import { Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ logout }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer p-2 rounded-lg"
              title="Go to Dashboard"
            >
              <Home className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={logout}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
