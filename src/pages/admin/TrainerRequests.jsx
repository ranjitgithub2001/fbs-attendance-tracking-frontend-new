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
  check: "M5 13l4 4L19 7",
  close: "M18 6L6 18M6 6l12 12",
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

// ── Status Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-yellow-900/20 border-yellow-700/30 text-yellow-400",
    APPROVED: "bg-fbs-green/10 border-fbs-green/20 text-fbs-green",
    REJECTED: "bg-red-900/20 border-red-700/30 text-red-400",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${map[status]}`}>
      {status}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function TrainerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [filter, setFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortOrder, setSortOrder] = useState("LATEST"); // or "OLDEST"

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  }

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/trainer-requests");
      setRequests(res.data || []);
    } catch {
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, [search, filter]);

  async function handleAction(id, action) {
    try {
      await axiosInstance.put(`/trainer-requests/${id}/${action}`);
      showToast(`Request ${action.toLowerCase()} successfully`);
      fetchRequests();
    } catch {
      showToast("Action failed", "error");
    }
  }

  const filtered = requests
    .filter((r) => {
      const matchesSearch = r.trainerName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter = filter === "ALL" || r.status === filter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const diff = new Date(b.createdAt) - new Date(a.createdAt);
      return sortOrder === "LATEST" ? diff : -diff;
    });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };
  function timeAgo(date) {
    if (!date) return "N/A";

    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  function formatRequestType(type) {
    const map = {
      UNPLANNED_HOLIDAY: "Unplanned Holiday",
      HOLIDAY: "Planned Holiday",
      CORRECTION: "Attendance Correction",
      BATCH_ACCESS: "Batch Access Request",
    };

    // fallback (in case new types come later)
    if (!map[type]) {
      return type
        ?.toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return map[type];
  }

  return (
    <DashboardLayout
      pageTitle="Trainer Requests"
      pageSubtitle="Manage trainer approvals">
      {/* Search + Filter */}
      <div className="mb-4 flex min-w-0 flex-col gap-3">
        <div className="relative min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon d={ICONS.search} size={14} />
          </span>
          <input
            type="text"
            placeholder="Search trainer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-card py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-fbs-green"
          />
        </div>
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="flex w-max min-w-full gap-3">
        <div className="flex shrink-0 gap-1 rounded-lg border border-fbs-border bg-fbs-card p-1">
          {["LATEST", "OLDEST"].map((s) => (
            <button
              key={s}
              onClick={() => setSortOrder(s)}
              className={`min-h-11 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
      ${
        sortOrder === s
          ? "bg-fbs-green text-black"
          : "text-gray-400 hover:text-white"
      }`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 gap-1 rounded-lg border border-fbs-border bg-fbs-card p-1">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
              className={`min-h-11 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
      ${
        filter === f
          ? "bg-fbs-green text-black"
          : "text-gray-400 hover:text-white"
      }`}>
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
      </div>

      {/* Table */}
      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No requests found
          </div>
        ) : (
          <div>
            <div className="hidden overflow-x-auto md:block">
            <div className="grid min-w-[800px] grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr] border-b border-fbs-border px-5 py-3 text-xs uppercase text-gray-500">
              <div>Trainer</div>
              <div>Email</div>
              <div>Request Type</div>
              <div>Status</div>
              <div>Created</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="min-w-[800px] space-y-2 p-3">
              {paginatedData.map((r) => (
                <div
                  key={r.id}
                  className="group relative grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr] items-center rounded-xl border border-fbs-border bg-fbs-dark/30 px-4 py-3 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-fbs-dark/50 hover:shadow-lg">
                  {/* TRAINER */}
                  <div className="text-white text-sm font-medium">
                    {r.trainerName}
                  </div>

                  {/* EMAIL */}
                  <div
                    className="text-gray-400 text-xs truncate max-w-[200px]"
                    title={r.email}>
                    {r.email}
                  </div>

                  {/* REQUEST TYPE */}
                  <div className="text-gray-400 text-xs">
                    {formatRequestType(r.requestType)}
                  </div>

                  {/* STATUS */}
                  <div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="text-gray-400 text-xs">
                    {timeAgo(r.createdAt)}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end items-center gap-2 min-h-[32px]">
                    {/* ONLY VIEW BUTTON */}
                    <button
                      onClick={() => setSelectedRequest(r)}
                      className="min-h-11 text-xs text-blue-400 hover:underline sm:min-h-0">
                      View
                    </button>

                    {/* OPTIONAL: status indicator */}
                    {r.status !== "PENDING" && (
                      <span className="text-[12px] text-gray-500 ml-2">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </div>
            <div className="divide-y divide-fbs-border md:hidden">
              {paginatedData.map((r) => (
                <div key={r.id} className="space-y-2 px-4 py-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{r.trainerName}</p>
                      <p className="truncate text-xs text-gray-400">{r.email}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatRequestType(r.requestType)} · {timeAgo(r.createdAt)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRequest(r)}
                      className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-fbs-border text-xs text-blue-400">
                      View
                    </button>
                    {r.status !== "PENDING" && (
                      <span className="text-xs text-gray-500">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-fbs-border bg-fbs-card p-4 md:p-5">
            {/* HEADER */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex min-h-11 min-w-11 items-center justify-center text-sm text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <b>Trainer:</b> {selectedRequest.trainerName}
              </p>
              <p>
                <b>Email:</b> {selectedRequest.email}
              </p>
              <p>
                <b>Type:</b> {formatRequestType(selectedRequest.requestType)}
              </p>
              <p>
                <b>Status:</b> {selectedRequest.status}
              </p>

              {/* 👇 HOLIDAY SPECIFIC DETAILS */}
              {selectedRequest.requestType?.includes("HOLIDAY") && (
                <div className="mt-3 p-3 rounded-lg bg-fbs-dark/40 border border-fbs-border">
                  <p>
                    <b>Date:</b>{" "}
                    <span className="text-white">
                      {selectedRequest.requestedDate || "N/A"}
                    </span>
                  </p>

                  <p className="mt-1">
                    <b>Reason:</b>{" "}
                    <span className="text-gray-400">
                      {selectedRequest.reason || "No reason provided"}
                    </span>
                  </p>

                  <p className="mt-1">
                    <b>Scope:</b>{" "}
                    <span className="text-white">
                      {selectedRequest.batchId ? "Batch Specific" : "Global"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* LEFT: status info (optional but nice UX) */}
              <span className="text-xs text-gray-400">
                Current Status: {selectedRequest.status}
              </span>

              {/* RIGHT: actions */}
              <div className="flex flex-wrap gap-2">
                {selectedRequest.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedRequest.id, "approve");
                        setSelectedRequest(null);
                      }}
                      className="min-h-11 rounded-md bg-fbs-green px-3 py-1.5 text-black hover:opacity-90">
                      Approve
                    </button>

                    <button
                      onClick={() => {
                        handleAction(selectedRequest.id, "reject");
                        setSelectedRequest(null);
                      }}
                      className="min-h-11 rounded-md bg-red-500 px-3 py-1.5 text-white hover:opacity-90">
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="min-h-11 rounded border border-gray-600 px-3 py-1.5">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="min-h-11 rounded border border-fbs-border px-3 py-1 disabled:opacity-40 sm:min-h-0">
              Prev
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="min-h-11 rounded border border-fbs-border px-3 py-1 disabled:opacity-40 sm:min-h-0">
              Next
            </button>
          </div>
        </div>
      )}

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}
