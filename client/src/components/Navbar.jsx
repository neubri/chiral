import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "./Button";
import api from "../lib/http";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      let userData = localStorage.getItem("user");

      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      } else {
        // If no user data in localStorage, fetch from API
        try {
          const response = await api.get("/auth/profile");
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If can't fetch user data, redirect to login
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/");
  };

  // Quick Actions untuk user yang sudah login
  const quickActions = [
    {
      title: "Browse Articles",
      description: "Discover new articles to read",
      icon: "📚",
      path: "/articles",
      variant: "primary",
    },
    {
      title: "My Highlights",
      description: "View saved highlights",
      icon: "🔖",
      path: "/highlights",
      variant: "outline",
    },
    {
      title: "My Notes",
      description: "Access your learning notes",
      icon: "📝",
      path: "/notes",
      variant: "outline",
    },
  ];

  // Jika tidak ada token, redirect ke halaman login
  const token = localStorage.getItem("access_token");
  if (!token) {
    return null;
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Chiral</span>
              <span className="hidden sm:block text-gray-600 text-sm">
                Learning Platform
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/articles"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Articles
              </Link>
              <Link
                to="/highlights"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Highlights
              </Link>
              <Link
                to="/notes"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Notes
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {" "}
              {/* User Info */}
              <div className="hidden md:flex items-center space-x-2">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <span className="text-gray-700 font-medium">
                  {user?.name || "Loading..."}
                </span>
              </div>
              {/* Dropdown Toggle */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden xl:block ml-1">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {dropdownOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "User"}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {user?.name || "Loading..."}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user?.email || ""}
                  </div>
                </div>
              </div>

              {/* Navigation Links Mobile */}
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/articles"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>�</span>
                  <span>Browse Articles</span>
                </Link>
                <Link
                  to="/highlights"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>🔖</span>
                  <span>My Highlights</span>
                </Link>
                <Link
                  to="/notes"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>📝</span>
                  <span>My Notes</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
