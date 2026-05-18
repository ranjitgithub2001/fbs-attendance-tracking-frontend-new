import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import fbsLogo from "../assets/fbs-logo.png";

export default function RegisterRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    qualification: "",
    expertise: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!form.department.trim()) {
      setError("Department is required");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/trainer-requests/public/register", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        qualification: form.qualification.trim(),
        expertise: form.expertise.trim(),
        reason: form.reason.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const DEPARTMENTS = [
    "Java / Spring Boot",
    "Python / Django",
    "React / Frontend",
    "Angular",
    "Node.js",
    "Data Science / ML",
    "DevOps / Cloud",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-fbs-dark flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-2/5 bg-fbs-darker flex-col items-center justify-center px-8 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 left-0 w-2 h-full bg-fbs-yellow" />
        <div className="absolute top-0 left-2 w-1.5 h-full bg-fbs-green" />
        <div
          className="absolute top-0 right-0 w-28 h-full opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #8DC63F 1.5px, transparent 1.5px)",
            backgroundSize: "13px 13px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-fbs-card rounded-2xl flex items-center justify-center mb-5 shadow-lg">
            <img
              src={fbsLogo}
              alt="FBS Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-white text-base font-semibold text-center mb-1">
            FirstBit Solutions
          </h1>
          <p className="text-fbs-green text-xs text-center mb-5 tracking-wide">
            ... Learn IT, Bit by Bit ...
          </p>
          <div className="bg-fbs-card border border-fbs-border rounded-md px-4 py-2 mb-6">
            <p className="text-gray-400 text-xs text-center">
              Training &nbsp;|&nbsp; Placement &nbsp;|&nbsp; Internship
            </p>
          </div>
          <div className="w-10 h-0.5 bg-fbs-yellow mb-5" />
          <p className="text-fbs-green text-xs font-medium text-center mb-1">
            Attendance Tracking System
          </p>
          <p className="text-gray-500 text-xs text-center leading-relaxed">
            Request access for authorized
            <br />
            staff and trainers only
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 min-h-screen">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex md:hidden justify-center mb-8">
            <img
              src={fbsLogo}
              alt="FBS Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          <div className="bg-fbs-card border border-fbs-border rounded-2xl px-8 py-9">
            {/* ── Success state ── */}
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-fbs-green/10 border border-fbs-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-white text-lg font-semibold mb-2">
                  Request Submitted!
                </h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Your access request has been sent to the admin. You'll receive
                  your credentials via email once approved.
                </p>
                <Link
                  to="/login"
                  className="block w-full bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition-colors text-center">
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-white text-xl font-semibold mb-1">
                  Request Access
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Fill in the form — admin will review and send your credentials
                </p>

                {error && (
                  <div className="mb-4 px-4 py-2.5 bg-red-900/30 border border-red-700/40 rounded-lg">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                    />
                  </div>
                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="trainer@fbs.com"
                      className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                    />
                  </div>
                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                    />
                  </div>
                  {/* Qualification */}
                  <div className="mb-4">
                    <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={form.qualification}
                      onChange={(e) => set("qualification", e.target.value)}
                      placeholder="e.g. B.Tech, MCA, BCA"
                      className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                      Expertise / Subject
                    </label>
                    <input
                      type="text"
                      value={form.expertise}
                      onChange={(e) => set("expertise", e.target.value)}
                      placeholder="e.g. Java, React, Python"
                      className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                    />
                  </div>

                  {/* Reason */}
                  <div className="mb-6">
                    <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                      Reason / Message
                    </label>
                    <textarea
                      value={form.reason}
                      onChange={(e) => set("reason", e.target.value)}
                      placeholder="Briefly describe your role and why you need access..."
                      rows={3}
                      className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-fbs-border text-center">
                  <p className="text-gray-500 text-xs mb-2">
                    Already have an account?
                  </p>
                  <Link
                    to="/login"
                    className="text-fbs-green hover:text-fbs-yellow text-sm font-medium transition-colors">
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="text-gray-600 text-xs text-center mt-6">
            FBS Attendance Tracking System &nbsp;•&nbsp; v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
