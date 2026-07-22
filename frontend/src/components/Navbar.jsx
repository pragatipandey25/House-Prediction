import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = {
    candidate: [
      { to: "/candidate/dashboard", label: "Dashboard" },
      { to: "/candidate/resume", label: "My Resume" },
      { to: "/candidate/jobs", label: "Browse Jobs" },
      { to: "/candidate/applications", label: "My Applications" },
    ],
    employer: [
      { to: "/employer/dashboard", label: "Dashboard" },
      { to: "/employer/jobs", label: "My Jobs" },
      { to: "/employer/jobs/create", label: "Post Job" },
    ],
    admin: [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/admin/users", label: "Users" },
      { to: "/admin/jobs", label: "Jobs" },
      { to: "/admin/applications", label: "Applications" },
    ],
  };

  const links = navLinks[user.role] || [];

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={
                user.role === "candidate"
                  ? "/candidate/dashboard"
                  : user.role === "employer"
                    ? "/employer/dashboard"
                    : "/admin/dashboard"
              }
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                AI
              </div>
              <span className="font-bold text-gray-800 text-lg hidden sm:block">
                CVAnalyzer
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                {user.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              Logout
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
