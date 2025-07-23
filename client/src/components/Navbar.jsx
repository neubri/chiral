import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");

        Swal.fire({
          title: "Logged out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  if (!user) {
    return null; // Don't show navbar if not logged in
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">📚 Chiral</div>
            <span className="hidden sm:block text-gray-600 text-sm">
              Learning Platform
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/articles"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Browse Articles
            </Link>
            <Link
              to="/highlights"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              My Highlights
            </Link>
            <Link
              to="/notes"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              My Notes
            </Link>
            <Link
              to="/highlights"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              My Highlights
            </Link>
            <Link
              to="/notes"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Learning Notes
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-gray-700 font-medium">{user.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
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
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          <Link
            to="/dashboard"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            📊 Dashboard
          </Link>
          <Link
            to="/articles"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            📖 Browse Articles
          </Link>
          <Link
            to="/highlights"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            🔖 My Highlights
          </Link>
          <Link
            to="/notes"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            📝 Learning Notes
          </Link>
        </div>
      </div>
    </nav>
  );
}
