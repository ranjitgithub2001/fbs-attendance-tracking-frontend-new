import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import DashboardLayout from "../../components/DashboardLayout";

// ── Icons ─────────────────────────────────────────────────────────────────────
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
  check: "M20 6L9 17l-5-5",
  clock: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  plus: "M12 5v14M5 12h14",
  attendance:
    "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  lock: "M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function TechBadge({ tech }) {
  return (
    <span className="px-2.5 py-0.5 bg-blue-900/20 border border-blue-700/30 text-blue-400 rounded-full text-[10px] font-semibold">
      {tech}
    </span>
  );
}

// ── Accessible Batch Card ─────────────────────────────────────────────────────
function AccessibleBatchCard({ batch, onMarkAttendance }) {
  return (
    <div className="bg-fbs-darker border border-fbs-border rounded-2xl p-5 flex flex-col gap-4 hover:border-fbs-green/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {batch.batchName}
          </p>
          <p className="text-gray-500 text-xs mt-0.5 font-mono">
            {batch.frnCode}
          </p>
        </div>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-fbs-green/10 border border-fbs-green/20 text-fbs-green rounded-full text-[10px] font-semibold flex-shrink-0">
          <Icon d={ICONS.check} size={10} /> Approved
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <TechBadge tech={batch.technology} />
        <span className="text-gray-500 text-xs">Year {batch.year}</span>
      </div>

      {/* Dates */}
      <div className="flex gap-4 text-xs text-gray-500">
        <div>
          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-0.5">
            Start
          </p>
          <p>{batch.startDate || "—"}</p>
        </div>
        {batch.endDate && (
          <div>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-0.5">
              End
            </p>
            <p>{batch.endDate}</p>
          </div>
        )}
        <div className="ml-auto">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border
            ${
              batch.active
                ? "bg-fbs-green/10 border-fbs-green/20 text-fbs-green"
                : "bg-red-900/10 border-red-900/20 text-red-400"
            }`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${batch.active ? "bg-fbs-green" : "bg-red-400"}`}
            />
            {batch.active ? "Active" : "Ended"}
          </span>
        </div>
      </div>

      {/* CTA */}
      {batch.active && (
        <button
          onClick={() => onMarkAttendance(batch.id)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-fbs-green py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-fbs-yellow">
          <Icon d={ICONS.attendance} size={14} />
          Mark Attendance
        </button>
      )}
    </div>
  );
}

// ── No Access Batch Row ───────────────────────────────────────────────────────
function NoAccessBatchRow({ batch, onRequestAccess, requesting }) {
  const isPending = batch.accessRequested && !batch.accessApproved;

  return (
    <div className="flex flex-col gap-3 border-b border-fbs-border py-3.5 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      {/* Icon */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-fbs-border bg-fbs-card">
        <Icon d={ICONS.lock} size={14} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {batch.batchName}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <TechBadge tech={batch.technology} />
          <span className="font-mono text-xs text-gray-500">
            {batch.frnCode}
          </span>
          <span className="text-xs text-gray-500">Year {batch.year}</span>
        </div>
      </div>
      </div>

      {/* Action */}
      {isPending ? (
        <span className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-yellow-900/30 bg-yellow-900/20 px-3 py-1.5 text-xs font-semibold text-yellow-400 sm:min-h-0">
          <Icon d={ICONS.clock} size={12} /> Pending
        </span>
      ) : (
        <button
          onClick={() => onRequestAccess(batch.id)}
          disabled={requesting === batch.id}
          className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-fbs-border bg-fbs-card px-3 py-1.5 text-xs font-semibold text-gray-400 transition-colors hover:border-fbs-green/40 hover:text-fbs-green disabled:opacity-40 sm:min-h-0">
          <Icon d={ICONS.plus} size={12} />
          {requesting === batch.id ? "Requesting…" : "Request Access"}
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyBatches() {
  const navigate = useNavigate();

  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const PAGE_SIZE = 10;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }

  async function fetchBatches() {
    setLoading(true);
    try {
      // GET /batches is limited to batches this trainer can already access.
      // The trainer dashboard catalog is the existing list that includes
      // other batches, with Approved and Pending flags already set.
      const res = await axiosInstance.get("/trainer/dashboard");
      setAllBatches(res.data?.allBatches || []);
    } catch {
      showToast("Failed to load batches", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBatches();
  }, []);

  async function handleRequestAccess(batchId) {
    setRequesting(batchId);
    try {
      await axiosInstance.post(
        `/trainer-requests/batch-access?batchId=${batchId}`,
      );
      showToast("Access request sent successfully");
      // Optimistically mark as pending
      setAllBatches((prev) =>
        prev.map((b) =>
          b.id === batchId ? { ...b, accessRequested: true } : b,
        ),
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to send request",
        "error",
      );
    } finally {
      setRequesting(null);
    }
  }

  function handleMarkAttendance(batchId) {
    navigate(`/trainer/attendance?batchId=${batchId}`);
  }

  // ── Split batches into two groups ────────────────────────────────────────────
  const accessibleBatches = allBatches.filter((b) => b.accessApproved);
  const noAccessBatches = allBatches.filter((b) => !b.accessApproved);

  // Apply search to no-access section only so accessible batches stay listed above.
  const query = search.trim().toLowerCase();
  const filteredNoAccess = noAccessBatches.filter(
    (b) =>
      b.batchName?.toLowerCase().includes(query) ||
      b.frnCode?.toLowerCase().includes(query) ||
      b.technology?.toLowerCase().includes(query),
  );
  const totalPages = Math.max(1, Math.ceil(filteredNoAccess.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedNoAccess = filteredNoAccess.slice(pageStart, pageStart + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
    )
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push(`ellipsis-${arr[i - 1]}`);
      acc.push(p);
      return acc;
    }, []);

  function handleSearchChange(value) {
    setSearch(value);
    setCurrentPage(1);
  }

  return (
    <DashboardLayout
      pageTitle="My Batches"
      pageSubtitle="Batches you have access to and requests">
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* ── Section 1: Accessible Batches ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-white text-sm font-semibold">
                My Accessible Batches
              </h2>
              <span className="px-2 py-0.5 bg-fbs-green/10 border border-fbs-green/20 text-fbs-green text-[10px] font-bold rounded-full">
                {accessibleBatches.length}
              </span>
            </div>
          
            {accessibleBatches.length === 0 ? (
              <div className="bg-fbs-card border border-fbs-border rounded-2xl p-8 text-center">
                <p className="text-gray-500 text-sm mb-1">
                  No approved batches yet
                </p>
                <p className="text-gray-600 text-xs">
                  Request access to batches below
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessibleBatches.map((b) => (
                  <AccessibleBatchCard
                    key={b.id}
                    batch={b}
                    onMarkAttendance={handleMarkAttendance}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Section 2: No Access Batches ── */}
          <div>
            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-white">
                  Other Batches
                </h2>
                <span className="rounded-full border border-fbs-border bg-fbs-card px-2 py-0.5 text-[10px] font-bold text-gray-400">
                  {filteredNoAccess.length}
                </span>
              </div>

              {/* Search */}
              {noAccessBatches.length > 0 && (
                <div className="relative w-full min-w-0 sm:w-80">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Icon d={ICONS.search} size={13} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search batch by name or FRN code..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-card py-2 pl-8 pr-3 text-xs text-white placeholder-gray-600 outline-none transition-colors focus:border-fbs-green"
                  />
                </div>
              )}
            </div>

            {noAccessBatches.length === 0 ? (
              <div className="bg-fbs-card border border-fbs-border rounded-2xl p-8 text-center">
                <p className="text-gray-500 text-sm">
                  You have access to all available batches 🎉
                </p>
              </div>
            ) : filteredNoAccess.length === 0 ? (
              <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 text-center">
                <p className="text-gray-500 text-sm">
                  No batches match your search
                </p>
              </div>
            ) : (
              <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-fbs-border px-4 py-3 md:px-5">
                  {[
                    { label: "Not requested", color: "bg-gray-500" },
                    { label: "Request pending", color: "bg-yellow-400" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
                      <span className="text-gray-500 text-[10px]">
                        {l.label}
                      </span>
                    </div>
                  ))}
                  <span className="ml-auto text-gray-600 text-[10px]">
                    {filteredNoAccess.filter((b) => b.accessRequested).length}{" "}
                    pending ·{" "}
                    {filteredNoAccess.filter((b) => !b.accessRequested).length}{" "}
                    not requested
                  </span>
                </div>

                <div className="px-4 md:px-5">
                  {pagedNoAccess.map((b) => (
                    <NoAccessBatchRow
                      key={b.id}
                      batch={b}
                      onRequestAccess={handleRequestAccess}
                      requesting={requesting}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-fbs-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
                  <p className="text-xs text-gray-600">
                    Showing {pageStart + 1}–
                    {Math.min(pageStart + PAGE_SIZE, filteredNoAccess.length)} of{" "}
                    {filteredNoAccess.length}
                  </p>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(safePage - 1)}
                      disabled={safePage === 1}
                      className="min-h-11 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0">
                      Previous
                    </button>
                    {pageNumbers.map((p) =>
                      typeof p === "string" ? (
                        <span key={p} className="px-1 text-xs text-gray-600">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`flex h-11 min-w-11 items-center justify-center rounded-lg text-xs font-medium transition-colors sm:h-8 sm:min-w-8
                          ${
                            safePage === p
                              ? "bg-fbs-green text-black"
                              : "border border-fbs-border bg-fbs-dark text-gray-400 hover:text-white"
                          }`}>
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="min-h-11 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}
