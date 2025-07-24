import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import http from "../lib/http";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);

      await http.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      let message = "Something went wrong";

      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-calm px-4 py-8">
      <div className="max-w-md w-full">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4">
              <span className="text-2xl">�</span>
            </div>
            <h2 className="text-3xl font-light text-gray-800 mb-2">
              Join Chiral
            </h2>
            <p className="text-gray-600 text-sm font-light">
              Start your AI-powered learning journey
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-secondary text-white font-medium py-3 px-4 rounded-xl smooth-transition hover:shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="glass-card px-4 py-1 rounded-full text-gray-600 text-xs font-light">
                    Or sign up with
                  </span>
                </div>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex items-center justify-center mb-6">
              <GoogleLoginButton
                disabled={loading}
                onSuccess={(data) => {
                  console.log("Google signup success:", data);
                  navigate("/dashboard");
                }}
                onError={(error) => {
                  console.error("Google signup error:", error);
                }}
              />
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 font-light">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-orange-600 hover:text-orange-700 smooth-transition"
                >
                  Sign in here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
