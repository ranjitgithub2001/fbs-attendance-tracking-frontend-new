import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import StatCard from "../../components/StatCard";
import DashboardLayout from "../../components/DashboardLayout";

export function AdminDashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    activeBatches: 0,
    attendanceTaken: 0,
    pendingToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(60);
  const [lowAttendance, setLowAttendance] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState("");
  const [lowPage, setLowPage] = useState(1);
  const LOW_PAGE_SIZE = 5;

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await axiosInstance.get("/students");
      const allStudents = res.data || [];

      const recMap = {};

      await Promise.all(
        allStudents.map(async (s) => {
          const r = await axiosInstance.get(
            `/attendance/student/${s.id}/records`,
          );
          recMap[s.id] = r.data || [];
        }),
      );

      setLowAttendance(
        allStudents.map((s) => {
          const recs = recMap[s.id] || [];
          const total = recs.length;
          const present = recs.filter((r) => r.status === "PRESENT").length;

          const percent = total ? (present / total) * 100 : null;

          return {
            frn: s.frn,
            name: s.fullName,
            batch: s.batchName,
            percent,
            parentPhone: s.parentPhone,
          };
        }),
      );
      setLoading(true);
      setError(null);
      try {
        const [u, b, t] = await Promise.all([
          axiosInstance.get("/admin/users"),
          axiosInstance.get("/batches/active"),
          axiosInstance.get("/attendance/sessions/today-count"),
        ]);
        const activeBatches = b.data?.length ?? 0;
        const takenToday = t.data ?? 0;
        setCounts({
          users: u.data?.length ?? 0,
          activeBatches,
          attendanceTaken: takenToday,
          pendingToday: activeBatches - takenToday,
        });
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load dashboard stats");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function fetchPendingRequests() {
    setRequestsLoading(true);
    try {
      const res = await axiosInstance.get("/trainer-requests/pending");
      setPendingRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load pending requests", err);
    } finally {
      setRequestsLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingRequests();
  }, []);
  useEffect(() => {
    setLowPage(1);
  }, [threshold]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  async function handleApprove(id) {
    setActionLoading(id + "_approve");
    try {
      await axiosInstance.put(`/trainer-requests/${id}/approve`);
      showToast("Request approved.");
      fetchPendingRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve request.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    setActionLoading(rejectModal + "_reject");
    try {
      await axiosInstance.put(
        `/trainer-requests/${rejectModal}/reject?adminRemarks=${encodeURIComponent(rejectReason)}`,
      );
      showToast("Request rejected.");
      setRejectModal(null);
      setRejectReason("");
      fetchPendingRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject request.");
    } finally {
      setActionLoading(null);
    }
  }
  const lowFiltered = lowAttendance.filter(
    (s) => s.percent !== null && s.percent < threshold,
  );

  return (
    <DashboardLayout pageTitle="Dashboard" pageSubtitle="Overview & insights">
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={counts.users} color="green" />
        <StatCard label="Active Batches" value={counts.activeBatches} />
        <StatCard
          label="Attendance Taken"
          value={counts.attendanceTaken}
          color="green"
        />
        <StatCard
          label="Pending Today"
          value={counts.pendingToday}
          color="yellow"
        />
      </div>

      {/* Main panels */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Low attendance */}
        <div className="lg:col-span-3 bg-fbs-card border border-fbs-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Low Attendance</h2>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">
                Threshold:{" "}
                <span className="text-white font-semibold">{threshold}%</span>
              </label>
              <input
                type="range"
                min="40"
                max="90"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-48"
              />
            </div>
          </div>
          {lowFiltered.length > 0 && (
            <div className="mb-3 text-yellow-400 text-sm">
              ⚠️ {lowFiltered.length} students need attention
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="py-2">FRN</th>
                  <th>Name</th>
                  <th>Batch</th>
                  <th className="w-48">%</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowFiltered
                  .slice((lowPage - 1) * LOW_PAGE_SIZE, lowPage * LOW_PAGE_SIZE)
                  .map((s) => (
                    <tr key={s.frn} className="align-middle">
                      <td className="py-3 text-gray-300">{s.frn}</td>
                      <td className="py-3">{s.name}</td>
                      <td className="py-3 text-gray-300">{s.batch}</td>
                      <td className="py-3">
                        {s.percent === null ? (
                          <span className="text-gray-500 text-xs">No data</span>
                        ) : (
                          <>
                            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 ${
                                  s.percent < 40
                                    ? "bg-red-500"
                                    : s.percent < 60
                                      ? "bg-yellow-500"
                                      : "bg-fbs-green"
                                }`}
                                style={{ width: `${s.percent}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {s.percent}%
                            </div>
                          </>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-xs bg-transparent border border-fbs-border rounded px-2 py-1 mr-2 text-fbs-green">
                          Call Parent
                        </button>
                        <button className="text-xs bg-fbs-green text-black font-semibold rounded px-2 py-1">
                          Send Alert
                        </button>
                      </td>
                    </tr>
                  ))}
                {lowFiltered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-400">
                      No students below threshold
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination footer */}
            {(() => {
              const totalPages = Math.ceil(lowFiltered.length / LOW_PAGE_SIZE);
              if (totalPages <= 1) return null;
              return (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-fbs-border">
                  <p className="text-gray-600 text-xs">
                    {(lowPage - 1) * LOW_PAGE_SIZE + 1}–
                    {Math.min(lowPage * LOW_PAGE_SIZE, lowFiltered.length)} of{" "}
                    {lowFiltered.length}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLowPage((p) => Math.max(1, p - 1))}
                      disabled={lowPage === 1}
                      className="px-3 py-1 bg-fbs-dark border border-fbs-border rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setLowPage(p)}
                          className={`w-7 h-7 rounded text-xs font-medium transition-colors
              ${lowPage === p ? "bg-fbs-green text-black" : "bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white"}`}>
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        setLowPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={lowPage === totalPages}
                      className="px-3 py-1 bg-fbs-dark border border-fbs-border rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                      →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right: Pending trainer requests */}
        <div className="lg:col-span-1 bg-fbs-card border border-fbs-border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">
            Pending Trainer Requests
          </h2>
          <div className="space-y-3">
            {requestsLoading ? (
              <div className="text-gray-500 text-sm text-center py-6">
                Loading...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-gray-400 text-sm">No pending requests</div>
            ) : (
              pendingRequests.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-fbs-dark rounded-md border border-fbs-border">
                  <div className="text-sm font-semibold">
                    {r.trainerName || r.fullName}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {r.requestType} — Batch ID: {r.batchId || "—"}
                  </div>
                  <div className="text-xs text-gray-300 mb-3">
                    {r.reason || ""}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={actionLoading === r.id + "_approve"}
                      className="flex-1 text-sm bg-fbs-green/15 hover:bg-fbs-green/25 text-fbs-green border border-fbs-green/30 font-semibold rounded px-3 py-2 transition-colors disabled:opacity-50">
                      {actionLoading === r.id + "_approve" ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => setRejectModal(r.id)}
                      disabled={actionLoading === r.id + "_reject"}
                      className="flex-1 text-sm bg-transparent border border-fbs-border rounded px-3 py-2 text-red-400 disabled:opacity-50">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white text-base font-semibold mb-1">
              Reject Request
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Optionally provide a reason — it will be sent to the trainer.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700/40 text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-fbs-card border border-fbs-green/30 text-fbs-green text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
