import React from "react";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  PackageSearch,
  Package,
  X
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

  const links = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },

    {
      name: "Add Product",
      icon: PlusCircle,
      path: "/admin/add-product",
    },

    {
      name: "Products",
      icon: ListChecks,
      path: "/admin/list-products"
    },

    {
      name: "Orders",
      icon: PackageSearch,
      path: "/admin/orders",
    },
    {
      name: "Reviews",
      icon: Package,
      path: "/admin/reviews" // 👈 Corrected path to match admin sub-routing structure
    }
  ];

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#C19A6B] text-white shadow-lg"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Overlay */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Mobile Sidebar */}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 transform transition-transform duration-300 md:hidden ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800">

          <div className="flex items-center gap-2">

            <div className="bg-[#C19A6B] p-2 rounded-lg">
              <Package
                size={20}
                className="text-white"
              />
            </div>

            <span className="font-bold text-lg text-white">
              Store Admin
            </span>

          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white"
          >
            <X size={22} />
          </button>

        </div>

        <nav className="p-4 space-y-2">

          {links.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={navClass}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );

          })}

        </nav>

      </aside>

      {/* Desktop Sidebar */}

      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 flex-col shadow-xl">

        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">

          <div className="bg-[#C19A6B] p-2 rounded-lg">

            <Package
              size={20}
              className="text-white"
            />

          </div>

          <div>

            <h1 className="text-white font-bold text-lg">
              Trylo Admin
            </h1>

            <p className="text-gray-400 text-xs">
              Admin Panel
            </p>

          </div>

        </div>

        <nav className="flex-1 p-4 space-y-2">

          {links.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={navClass}
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );

          })}

        </nav>

      </aside>
    </>
  );
};

export default Sidebar;