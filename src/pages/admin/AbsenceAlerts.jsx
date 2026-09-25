import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import DashboardLayout from "../../components/DashboardLayout";

// ── Icons ─────────────────────────────────────────────────────────────
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
  alert:
    "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  check: "M5 13l4 4L19 7",
  reply: "M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
};

// ── Toast ─────────────────────────────────────────────────────────────
function Toast({ message, type = "success" }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-6 right-4 z-50 max-w-[calc(100%-2rem)] px-4 py-3 rounded-xl border text-sm shadow-lg md:right-6
      ${
        type === "success"
          ? "bg-fbs-card border-fbs-green/30 text-fbs-green"
          : "bg-fbs-card border-red-500/30 text-red-400"
      }`}>
      {message}
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function AbsenceAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [replyModal, setReplyModal] = useState(null); // alert object
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  }

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/absence-alerts");
      setAlerts(res.data || []);
    } catch {
      showToast("Failed to load alerts", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function handleLogReply() {
    if (!replyModal) return;
    setSubmitting(true);
    try {
      await axiosInstance.put(`/admin/absence-alerts/${replyModal.id}/reply`, {
        replyText,
      });
      showToast("Reply logged successfully");
      setReplyModal(null);
      setReplyText("");
      fetchAlerts();
    } catch {
      showToast("Failed to log reply", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Filter + Search ───────────────────────────────────────────────
  const counts = {
    ALL: alerts.length,
    AWAITING: alerts.filter((a) => !a.replied).length,
    REPLIED: alerts.filter((a) => a.replied).length,
  };

  const filtered = alerts.filter((a) => {
    const matchFilter =
      filter === "ALL" ||
      (filter === "AWAITING" && !a.replied) ||
      (filter === "REPLIED" && a.replied);
    const matchSearch =
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.frn?.toLowerCase().includes(search.toLowerCase()) ||
      a.batchName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout
      pageTitle="Absence Alerts"
      pageSubtitle="Track and respond to consecutive absence alerts">
      {/* ── Stats ── */}
      <div className="mb-6 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: "Total Alerts", value: counts.ALL, color: "text-white" },
          {
            label: "Awaiting Reply",
            value: counts.AWAITING,
            color: "text-red-400",
          },
          { label: "Replied", value: counts.REPLIED, color: "text-fbs-green" },
        ].map((c) => (
          <div
            key={c.label}
            className="min-w-0 rounded-2xl border border-fbs-border bg-fbs-card p-4 last:col-span-2 sm:p-5 sm:last:col-span-1">
            <p className="mb-1 truncate text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold sm:text-3xl ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon d={ICONS.search} size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by name, FRN or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-card py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-fbs-green"
          />
        </div>
        <div className="-mx-1 overflow-x-auto px-1">
        <div className="flex w-max min-w-full gap-1 rounded-lg border border-fbs-border bg-fbs-card p-1">
          {["ALL", "AWAITING", "REPLIED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                ${filter === f ? "bg-fbs-green text-black" : "text-gray-400 hover:text-white"}`}>
              {f}{" "}
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px]
                ${filter === f ? "bg-black/20 text-black" : "bg-fbs-border text-gray-400"}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-fbs-border border-t-fbs-green rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No alerts found
          </div>
        ) : (
          <div>
            <div className="hidden overflow-x-auto md:block">
            <div className="grid min-w-[960px] grid-cols-[2fr_1.5fr_1.5fr_1.2fr_1.5fr_1.5fr_1fr] border-b border-fbs-border px-5 py-3 text-xs uppercase text-gray-500">
              <div>Student</div>
              <div>FRN</div>
              <div>Batch</div>
              <div>Consecutive</div>
              <div>Alert Sent</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="min-w-[960px] space-y-2 p-3">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="group relative grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr_1.5fr_1.5fr_1fr] items-center rounded-xl border border-fbs-border bg-fbs-dark/30 px-4 py-3 transition-all duration-200 hover:-translate-y-[2px] hover:bg-fbs-dark/50 hover:shadow-lg">
                  {/* STUDENT */}
                  <div className="text-white text-sm font-medium">
                    {a.studentName}
                  </div>

                  {/* FRN */}
                  <div className="text-gray-400 text-xs font-mono">{a.frn}</div>

                  {/* BATCH */}
                  <div className="text-gray-400 text-xs">{a.batchName}</div>

                  {/* CONSECUTIVE */}
                  <div>
                    <span
                      className={`flex items-center gap-1.5 font-semibold text-sm ${
                        a.consecutiveCount >= 5
                          ? "text-red-400"
                          : a.consecutiveCount >= 3
                            ? "text-yellow-400"
                            : "text-gray-400"
                      }`}>
                      <Icon d={ICONS.alert} size={13} />
                      {a.consecutiveCount} days
                    </span>
                  </div>

                  {/* ALERT SENT */}
                  <div className="text-gray-400 text-xs">
                    {formatDate(a.alertSentAt)}
                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        a.replied
                          ? "bg-fbs-green/10 border-fbs-green/20 text-fbs-green"
                          : "bg-red-900/20 border-red-700/30 text-red-400"
                      }`}>
                      {a.replied ? "Replied" : "Awaiting"}
                    </span>

                    {a.replied && a.replyLoggedAt && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        by {a.replyLoggedBy} · {formatDate(a.replyLoggedAt)}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setReplyModal(a);
                        setReplyText(a.replied ? a.replyText || "" : "");
                      }}
                      className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all
      ${
        a.replied
          ? "border border-fbs-border text-gray-300 hover:border-fbs-green hover:text-white"
          : "bg-fbs-green text-black hover:bg-fbs-green/90"
      }`}>
                      <Icon d={ICONS.reply} size={12} />
                      {a.replied ? "View Reply" : "Log Reply"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </div>
            <div className="divide-y divide-fbs-border md:hidden">
              {filtered.map((a) => (
                <div key={a.id} className="space-y-2 px-4 py-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{a.studentName}</p>
                      <p className="truncate font-mono text-xs text-gray-400">{a.frn}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                        a.replied
                          ? "border-fbs-green/20 bg-fbs-green/10 text-fbs-green"
                          : "border-red-700/30 bg-red-900/20 text-red-400"
                      }`}>
                      {a.replied ? "Replied" : "Awaiting"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{a.batchName}</p>
                  <p className={`text-sm font-semibold ${
                    a.consecutiveCount >= 5
                      ? "text-red-400"
                      : a.consecutiveCount >= 3
                        ? "text-yellow-400"
                        : "text-gray-400"
                  }`}>
                    {a.consecutiveCount} consecutive days
                  </p>
                  <p className="text-xs text-gray-400">Alert sent {formatDate(a.alertSentAt)}</p>
                  <button
                    onClick={() => {
                      setReplyModal(a);
                      setReplyText(a.replied ? a.replyText || "" : "");
                    }}
                    className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                      ${
                        a.replied
                          ? "border border-fbs-border text-gray-300"
                          : "bg-fbs-green text-black"
                      }`}>
                    <Icon d={ICONS.reply} size={12} />
                    {a.replied ? "View Reply" : "Log Reply"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Reply Modal ── */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="relative bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => {
                setReplyModal(null);
                setReplyText("");
              }}
              className="absolute right-4 top-4 flex min-h-11 min-w-11 items-center justify-center text-sm text-gray-500 hover:text-white">
              ✕
            </button>
            <h3 className="text-white font-semibold mb-1">
              {replyModal.replied ? "Student Reply" : "Log Student Reply"}
            </h3>
            <p className="text-gray-400 text-sm mb-1">
              {replyModal.studentName} —{" "}
              <span className="font-mono text-xs">{replyModal.frn}</span>
            </p>
            <div className="text-xs text-gray-500 mb-4 space-y-0.5">
              <p>{replyModal.consecutiveCount} consecutive absences</p>
              <p>Alert sent {formatDate(replyModal.alertSentAt)}</p>
            </div>
            <p className="text-xs text-gray-500 mb-1">Student Reply</p>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Paste student's reply or reason here..."
              rows={4}
              readOnly={replyModal.replied}
              className={`w-full bg-fbs-dark border rounded-lg px-4 py-3 text-white text-sm
    resize-none mb-4 transition-colors
    ${
      replyModal.replied
        ? "border-gray-700 opacity-70 cursor-not-allowed"
        : "border-fbs-border focus:border-fbs-green"
    }`}
            />

            <div className="flex gap-3 justify-end items-center">
              <button
                onClick={() => {
                  setReplyModal(null);
                  setReplyText("");
                }}
                className="min-h-11 px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white">
                {replyModal.replied ? "Close" : "Cancel"}
              </button>

              {!replyModal.replied && (
                <button
                  onClick={handleLogReply}
                  disabled={submitting || !replyText.trim()}
                  className="min-h-11 rounded-lg bg-fbs-green px-5 py-2 text-sm font-semibold text-black transition-all duration-100 hover:bg-fbs-green/90 active:scale-95 disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Reply"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}
