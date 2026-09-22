import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import fbsLogo from "../assets/fbs-logo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email: email.trim() });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    if (!otp.trim() || !newPassword.trim()) {
      setError("OTP and new password are required.");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-fbs-dark flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={fbsLogo} alt="FBS Logo" className="w-16 h-16 object-contain" />
        </div>
        <div className="bg-fbs-card border border-fbs-border rounded-2xl px-8 py-9">
          <h2 className="text-white text-xl font-semibold mb-1">Reset password</h2>
          <p className="text-gray-400 text-sm mb-6">
            Use the OTP sent to your Student Management email.
          </p>
          <form onSubmit={otpSent ? handleReset : handleSendOtp} noValidate>
            <div className="mb-5">
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
                placeholder="you@fbs.com"
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green disabled:opacity-50"
              />
            </div>
            {otpSent && (
              <>
                <div className="mb-5">
                  <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                    OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-fbs-green"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-fbs-green"
                  />
                </div>
              </>
            )}
            {error && (
              <div className="mb-4 px-4 py-2.5 bg-red-900/30 border border-red-700/40 rounded-lg">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm py-2.5 rounded-lg disabled:opacity-50">
              {loading ? "Please wait..." : otpSent ? "Reset password" : "Send OTP"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-fbs-green hover:text-fbs-yellow text-sm font-medium">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
