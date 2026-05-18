import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = "http://localhost:8080/api";

function studentAxios() {
  const token = localStorage.getItem("studentToken");
  return axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${token}` },
  });
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Icon({ d, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  sessions:
    "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  concern:
    "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  chevronL: "M15 18l-6-6 6-6",
  chevronR: "M9 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-fbs-border border-t-fbs-green rounded-full animate-spin" />
    </div>
  );
}

function Toast({ message, type = "success" }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm shadow-lg
      ${type === "success" ? "bg-fbs-card border-fbs-green/30 text-fbs-green" : "bg-fbs-card border-red-500/30 text-red-400"}`}>
      {message}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    PRESENT: "bg-fbs-green/10 border-fbs-green/30 text-fbs-green",
    ABSENT: "bg-red-900/10 border-red-700/30 text-red-400",
    LATE: "bg-yellow-900/10 border-yellow-700/30 text-yellow-400",
    PENDING: "bg-yellow-900/10 border-yellow-700/30 text-yellow-400",
    RESOLVED: "bg-fbs-green/10 border-fbs-green/30 text-fbs-green",
    REJECTED: "bg-red-900/10 border-red-700/30 text-red-400",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg[status] || "bg-fbs-card border-fbs-border text-gray-400"}`}>
      {status}
    </span>
  );
}

function AttendanceRing({ pct }) {
  const r = 36,
    circ = 2 * Math.PI * r,
    dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#a3e635" : pct >= 60 ? "#facc15" : "#f87171";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#2e2e2e"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-white text-lg font-bold leading-none">
          {pct.toFixed(0)}%
        </p>
        <p className="text-gray-500 text-[10px]">attended</p>
      </div>
    </div>
  );
}

// ── Tab 1: Dashboard ──────────────────────────────────────────────────────────
function DashboardTab({ data }) {
  const sessions = data?.last30Days || [];
  const present = sessions.filter((r) => r.status === "PRESENT").length;
  const absent = sessions.filter((r) => r.status === "ABSENT").length;
  const late = sessions.filter((r) => r.status === "LATE").length;
  const pct = data?.attendancePercentage ?? 0;

  return (
    <div className="space-y-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <AttendanceRing pct={pct} />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {[
              {
                label: "Total Classes",
                value: data?.totalClasses ?? 0,
                color: "text-white",
              },
              { label: "Present", value: present, color: "text-fbs-green" },
              { label: "Absent", value: absent, color: "text-red-400" },
              { label: "Late", value: late, color: "text-yellow-400" },
            ].map((c) => (
              <div
                key={c.label}
                className="bg-fbs-dark border border-fbs-border rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
        {pct < 75 && (
          <div className="mt-4 px-4 py-3 bg-red-900/10 border border-red-700/20 rounded-xl">
            <p className="text-red-400 text-xs">
              ⚠️ Your attendance is below 75%. Please attend classes regularly.
            </p>
          </div>
        )}
      </div>
      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-fbs-border">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Recent Sessions
          </p>
        </div>
        <div className="divide-y divide-fbs-border">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No sessions yet
            </div>
          ) : (
            [...sessions]
              .reverse()
              .slice(0, 5)
              .map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3">
                  <p className="text-white text-sm">{fmtDate(r.sessionDate)}</p>
                  <StatusBadge status={r.status} />
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Calendar ───────────────────────────────────────────────────────────
function CalendarTab({ data }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const monthName = new Date(year, mon - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(delta) {
    const d = new Date(year, mon - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const dateMap = {};
  (data?.last30Days || []).forEach((r) => {
    const d = r.sessionDate?.split("T")[0];
    if (d) dateMap[d] = r.status;
  });

  const calStyle = {
    PRESENT: "bg-fbs-green/20 border-fbs-green/40 text-fbs-green",
    ABSENT: "bg-red-900/20 border-red-700/40 text-red-400",
    LATE: "bg-yellow-900/20 border-yellow-700/40 text-yellow-400",
  };

  return (
    <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-fbs-border">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1.5 rounded-lg hover:bg-fbs-dark text-gray-400 hover:text-white transition-colors">
          <Icon d={ICONS.chevronL} size={16} />
        </button>
        <p className="text-white font-semibold text-sm">{monthName}</p>
        <button
          onClick={() => changeMonth(1)}
          className="p-1.5 rounded-lg hover:bg-fbs-dark text-gray-400 hover:text-white transition-colors">
          <Icon d={ICONS.chevronR} size={16} />
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-gray-600 font-semibold py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const status = dateMap[dateStr];
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg border text-xs font-medium
                ${status ? calStyle[status] : "border-transparent text-gray-600"}`}>
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-fbs-border">
          {[
            { label: "Present", color: "bg-fbs-green" },
            { label: "Absent", color: "bg-red-400" },
            { label: "Late", color: "bg-yellow-400" },
            { label: "No Session", color: "bg-fbs-border" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${l.color}`} />
              <span className="text-[10px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Sessions ───────────────────────────────────────────────────────────
function SessionsTab({ data }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;
  const sessions = [...(data?.last30Days || [])].reverse();
  const [filter, setFilter] = useState("ALL");
  useEffect(() => {
    setPage(1);
  }, [filter]);
  const counts = {
    ALL: sessions.length,
    PRESENT: sessions.filter((s) => s.status === "PRESENT").length,
    ABSENT: sessions.filter((s) => s.status === "ABSENT").length,
    LATE: sessions.filter((s) => s.status === "LATE").length,
  };
  const filtered =
    filter === "ALL" ? sessions : sessions.filter((s) => s.status === filter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-fbs-card border border-fbs-border rounded-xl p-1">
        {["ALL", "PRESENT", "ABSENT", "LATE"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${filter === f ? "bg-fbs-green text-gray-900" : "text-gray-400 hover:text-white"}`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>
      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No sessions found
          </div>
        ) : (
          <>
            {/* Sessions List */}
            <div className="divide-y divide-fbs-border">
              {paginated.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3.5">
                  <p className="text-white text-sm">{fmtDate(r.sessionDate)}</p>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>

            {/* ✅ Pagination UI HERE */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-fbs-border">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30">
                Previous
              </button>

              <span className="text-xs text-gray-500">
                Page {page} of {totalPages || 1}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30">
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Tab 4: Concerns ───────────────────────────────────────────────────────────
function ConcernTab({ data }) {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "ABSENCE_EXPLANATION",
    sessionId: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  }

  async function fetchConcerns() {
    setLoading(true);
    try {
      const res = await studentAxios().get("/public/concerns");
      setConcerns(res.data || []);
    } catch {
      showToast("Failed to load concerns", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConcerns();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.reason.trim()) {
      showToast("Please enter a reason", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        reason: form.reason.trim(),
        ...(form.type === "CORRECTION" && form.sessionId
          ? { sessionId: Number(form.sessionId) }
          : {}),
      };
      await studentAxios().post("/public/concerns", payload);
      showToast("Concern submitted successfully");
      setShowForm(false);
      setForm({ type: "ABSENCE_EXPLANATION", sessionId: "", reason: "" });
      fetchConcerns();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const sessions = data?.last30Days || [];

  return (
    <div className="space-y-4">
      {!showForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
            <Icon d={ICONS.plus} size={14} /> Raise Concern
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-fbs-card border border-fbs-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Raise a Concern</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                Type
              </label>
              <div className="flex gap-3">
                {[
                  {
                    value: "ABSENCE_EXPLANATION",
                    label: "Absence Explanation",
                  },
                  { value: "CORRECTION", label: "Correction Request" },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, type: t.value, sessionId: "" }))
                    }
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-colors
                      ${form.type === t.value ? "bg-fbs-green text-gray-900 border-fbs-green" : "bg-fbs-dark border-fbs-border text-gray-400 hover:border-fbs-green/40"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {form.type === "CORRECTION" && (
              <div className="mb-4">
                <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                  Session
                </label>
                <select
                  value={form.sessionId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sessionId: e.target.value }))
                  }
                  className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-fbs-green cursor-pointer">
                  <option value="" disabled>
                    Select absent session
                  </option>
                  {sessions
                    .filter((s) => s.status === "ABSENT")
                    .map((s, i) => (
                      <option key={i} value={s.sessionId || s.id}>
                        {fmtDate(s.sessionDate)}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                Reason
              </label>
              <textarea
                value={form.reason}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder={
                  form.type === "CORRECTION"
                    ? "I was present but marked absent..."
                    : "I was on medical leave..."
                }
                rows={3}
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold rounded-lg text-sm disabled:opacity-50">
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-fbs-border">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            My Concerns
          </p>
        </div>
        {loading ? (
          <Spinner />
        ) : concerns.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No concerns raised yet
          </div>
        ) : (
          <div className="divide-y divide-fbs-border">
            {concerns.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-900/20 border border-blue-700/30 px-2 py-0.5 rounded-full">
                    {c.type.replace("_", " ")}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                {c.sessionDate && (
                  <p className="text-gray-500 text-xs mb-1">
                    Session: {fmtDate(c.sessionDate)}
                  </p>
                )}
                <p className="text-gray-300 text-sm mb-1">{c.reason}</p>
                {c.trainerRemarks && (
                  <p className="text-xs text-gray-500 mt-2 bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2">
                    <span className="text-gray-400 font-medium">Trainer: </span>
                    {c.trainerRemarks}
                    {c.resolvedBy && (
                      <span className="text-gray-600"> · {c.resolvedBy}</span>
                    )}
                  </p>
                )}
                <p className="text-gray-600 text-[10px] mt-2">
                  {fmtDateTime(c.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
  { id: "calendar", label: "Calendar", icon: ICONS.calendar },
  { id: "sessions", label: "Sessions", icon: ICONS.sessions },
  { id: "concerns", label: "Concerns", icon: ICONS.concern },
];

export default function StudentPortal() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/student/login");
      return;
    }
    axios
      .get(`${BASE}/public/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setData(r.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("studentToken");
          navigate("/student/login");
        } else setError("Failed to load attendance data");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentFrn");
    navigate("/student/login");
  }

  if (loading)
    return (
      <div className="min-h-screen bg-fbs-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fbs-border border-t-fbs-green rounded-full animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-fbs-dark flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-fbs-dark text-white">
      <header className="bg-fbs-darker border-b border-fbs-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-fbs-card border border-fbs-border rounded-xl flex items-center justify-center">
            <span className="text-fbs-green text-sm font-bold">
              {data?.studentName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              {data?.studentName}
            </p>
            <p className="text-gray-500 text-xs font-mono">{data?.frn}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-fbs-card border border-fbs-border rounded-lg text-gray-400 hover:text-red-400 hover:border-red-900/30 text-xs font-medium transition-colors">
          <Icon d={ICONS.logout} size={14} /> Logout
        </button>
      </header>

      <div className="bg-fbs-darker border-b border-fbs-border px-6">
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-colors
                ${activeTab === t.id ? "border-fbs-green text-fbs-green" : "border-transparent text-gray-400 hover:text-white"}`}>
              <Icon d={t.icon} size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {activeTab === "dashboard" && <DashboardTab data={data} />}
        {activeTab === "calendar" && <CalendarTab data={data} />}
        {activeTab === "sessions" && <SessionsTab data={data} />}
        {activeTab === "concerns" && <ConcernTab data={data} />}
      </main>

      <footer className="text-center py-4 text-gray-600 text-xs border-t border-fbs-border">
        FBS Attendance System &nbsp;•&nbsp; v1.0 &nbsp;•&nbsp; Student Portal
      </footer>
    </div>
  );
}
