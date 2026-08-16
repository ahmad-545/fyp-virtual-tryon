import React from "react";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import adminlogo from "../../assets/logo2.png";

const Navbar = ({ setSidebarOpen }) => {

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/";
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">

      {/* Navbar height h-16 se h-20 kar di gayi hai taake barha logo easily fit aa jaye */}
      <div className="h-20 flex items-center justify-between px-4 sm:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <Menu size={24} />
          </button>

          {/* Logo container with larger responsive scaling */}
          <div className="flex items-center">
            <img
              src={adminlogo}
              alt="Admin Logo"
              className="h-25 sm:h-25 w-auto object-contain"
            />
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          <div className="hidden md:flex items-center gap-2">

            <div className="w-10 h-10 rounded-full bg-[#C19A6B] flex items-center justify-center">

              <ShieldCheck
                size={20}
                className="text-white"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-gray-800">
                Store Admin
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-black hover:bg-gray-900 transition text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>

    </header>
  );
};

export default Navbar;