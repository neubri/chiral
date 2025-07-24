import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useAuth } from "../store/hooks";
import { loginUser } from "../store/slices/authSlice";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { Brain } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, dispatch } = useAuth();

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        // Handle login error
        const errorMessage = resultAction.payload || "Login failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-calm px-4 py-8">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4">
              <Brain className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-light text-gray-800 mb-2">Chiral</h1>
            <p className="text-gray-600 text-sm font-light">
              AI-Powered Note Taking
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
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
                type="password"
                className="w-full px-4 py-3 glass-card rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none smooth-transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full gradient-secondary text-white font-medium py-3 px-4 rounded-xl smooth-transition hover:shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="glass-card px-4 py-1 rounded-full text-gray-600 text-xs font-light">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex items-center justify-center mb-6">
            <GoogleLoginButton
              disabled={loading}
              onSuccess={(data) => {
                console.log("Google login success:", data);
                navigate("/dashboard");
              }}
              onError={(error) => {
                console.error("Google login error:", error);
              }}
            />
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm font-light">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-orange-600 hover:text-orange-700 font-medium smooth-transition"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
