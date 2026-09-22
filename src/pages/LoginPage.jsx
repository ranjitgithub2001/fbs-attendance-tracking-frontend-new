import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import fbsLogo from "../assets/fbs-logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function getRedirectPath(role) {
    if (role === "ADMIN") return "/admin/dashboard";
    return "/trainer/dashboard";
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });
      const { token, role, fullName, userId } = res.data;
      login({ email: email.trim(), role, fullName, userId }, token);
      navigate(getRedirectPath(role));
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-fbs-dark flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-2/5 bg-fbs-darker flex-col items-center justify-center px-8 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 left-0 w-2 h-full bg-fbs-yellow" />
        <div className="absolute top-0 left-2 w-1.5 h-full bg-fbs-green" />
        <div className="absolute top-0 right-0 w-28 h-full opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #8DC63F 1.5px, transparent 1.5px)", backgroundSize: "13px 13px" }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-fbs-card rounded-2xl flex items-center justify-center mb-5 shadow-lg">
            <img src={fbsLogo} alt="FBS Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-white text-base font-semibold text-center mb-1">FirstBit Solutions</h1>
          <p className="text-fbs-green text-xs text-center mb-5 tracking-wide">... Learn IT, Bit by Bit ...</p>
          <div className="bg-fbs-card border border-fbs-border rounded-md px-4 py-2 mb-6">
            <p className="text-gray-400 text-xs text-center">Training &nbsp;|&nbsp; Placement &nbsp;|&nbsp; Internship</p>
          </div>
          <div className="w-10 h-0.5 bg-fbs-yellow mb-5" />
          <p className="text-fbs-green text-xs font-medium text-center mb-1">Attendance Tracking System</p>
          <p className="text-gray-500 text-xs text-center leading-relaxed">
            Internal portal for authorized<br />staff and trainers only
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 min-h-screen">
        <div className="w-full max-w-sm">
          <div className="flex md:hidden justify-center mb-8">
            <img src={fbsLogo} alt="FBS Logo" className="w-16 h-16 object-contain" />
          </div>

          <div className="bg-fbs-card border border-fbs-border rounded-2xl px-8 py-9">
            <h2 className="text-white text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-6">Sign in with your email and password</p>

            <form onSubmit={handlePasswordLogin} noValidate>
              <div className="mb-5">
                <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@fbs.com"
                  className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                />
              </div>

              <div className="mb-5">
                <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 pr-10 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white p-1">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.1.164-2.162.47-3.15M6.18 6.18A9.953 9.953 0 0112 5c5.523 0 10 4.477 10 10 0 1.367-.257 2.68-.72 3.89M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3 text-right mb-2">
                <Link to="/forgot-password" className="text-fbs-green hover:text-fbs-yellow text-sm font-medium">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="mb-4 px-4 py-2.5 bg-red-900/30 border border-red-700/40 rounded-lg">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-1">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-fbs-border text-center">
              <p className="text-gray-500 text-xs mb-2">Don't have an account?</p>
              <Link to="/register-request" className="text-fbs-green hover:text-fbs-yellow text-sm font-medium transition-colors">
                Register / Request Access
              </Link>
            </div>
          </div>

          <p className="text-gray-600 text-xs text-center mt-6">
            FBS Attendance Tracking System &nbsp;•&nbsp; v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
