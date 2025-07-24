import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "./Button";
import api from "../lib/http";
import { Brain, BookOpen, Bookmark, FileText } from "lucide-react";

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

  // Jika tidak ada token, redirect ke halaman login
  const token = localStorage.getItem("access_token");
  if (!token) {
    return null;
  }

  return (
    <>
      <nav className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 hover:opacity-80 smooth-transition"
            >
              <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xl font-light text-gray-800">Chiral</span>
              <span className="hidden sm:block text-gray-600 text-sm font-light">
                Dashboard
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/articles"
                className="text-gray-700 hover:text-orange-600 smooth-transition font-light"
              >
                Articles
              </Link>
              <Link
                to="/highlights"
                className="text-gray-700 hover:text-orange-600 smooth-transition font-light"
              >
                Highlights
              </Link>
              <Link
                to="/notes"
                className="text-gray-700 hover:text-orange-600 smooth-transition font-light"
              >
                Notes
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              {/* <div className="hidden md:flex items-center space-x-2">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <span className="text-gray-700 font-light">
                  {user?.name || "Loading..."}
                </span>
              </div> */}
              {/* Dropdown Toggle */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="lg:hidden glass-button p-2 rounded-xl text-gray-600 hover:text-gray-900 smooth-transition"
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
                className="text-red-600 hover:text-red-700 glass-button rounded-xl border-0"
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
                <span className="hidden xl:block ml-1 font-light">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {dropdownOpen && (
          <div className="lg:hidden border-t border-white/20 glass">
            <div className="px-4 py-3 space-y-3">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 pb-3 border-b border-white/20">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "User"}
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 gradient-secondary rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <div className="font-light text-gray-800">
                    {user?.name || "Loading..."}
                  </div>
                  <div className="text-sm text-gray-600 font-light">
                    {user?.email || ""}
                  </div>
                </div>
              </div>

              {/* Navigation Links Mobile */}
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 font-light smooth-transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/articles"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 font-light smooth-transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Articles</span>
                </Link>
                <Link
                  to="/highlights"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 font-light smooth-transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>My Highlights</span>
                </Link>
                <Link
                  to="/notes"
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 font-light smooth-transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <FileText className="w-4 h-4" />
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
