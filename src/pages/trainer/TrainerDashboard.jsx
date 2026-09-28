import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import DashboardLayout from '../../components/DashboardLayout';

// ── Icons ─────────────────────────────────────────────────────────────
function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  batches:    'M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10',
  students:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3 10v-2a3 3 0 0 0-3-3',
  sessions:   'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  attendance: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z',
  mark:       'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4',
  request:    'M12 4v16m8-8H4',
  check:      'M5 13l4 4L19 7',
  clock:      'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  lock:       'M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z',
};

// ── Toast ─────────────────────────────────────────────────────────────
function Toast({ message, type = 'success' }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 right-4 z-50 max-w-[calc(100%-2rem)] px-4 py-3 rounded-xl border text-sm shadow-lg md:right-6
      ${type === 'success'
        ? 'bg-fbs-card border-fbs-green/30 text-fbs-green'
        : 'bg-fbs-card border-red-500/30 text-red-400'}`}>
      {message}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, suffix = '' }) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-fbs-border bg-fbs-card p-4 md:p-5">
      <div className="w-11 h-11 rounded-xl bg-fbs-green/10 border border-fbs-green/20 flex items-center justify-center text-fbs-green shrink-0">
        <Icon d={icon} size={18} />
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 truncate text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-white">
          {value}
          {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

// ── Assigned Batch Card ────────────────────────────────────────────────
function AssignedBatchCard({ batch, onMarkAttendance }) {
  return (
    <div className="bg-fbs-card border border-fbs-border rounded-2xl p-5 flex flex-col gap-4 hover:border-fbs-green/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-white">{batch.batchName}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500">{batch.frnCode}</p>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-fbs-green/10 border-fbs-green/20 text-fbs-green">
          {batch.technology}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Year {batch.year}</span>
        <span className={`flex items-center gap-1 ${batch.active ? 'text-fbs-green' : 'text-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${batch.active ? 'bg-fbs-green' : 'bg-gray-500'}`} />
          {batch.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <button
        onClick={() => onMarkAttendance(batch)}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-fbs-green py-2 text-xs font-semibold text-black transition-colors hover:bg-fbs-green/90"
      >
        <Icon d={ICONS.mark} size={13} />
        Mark Attendance
      </button>
    </div>
  );
}

// ── All Batches Row ────────────────────────────────────────────────────
function AllBatchRow({ batch, onRequestAccess, requesting }) {
  return (
    <tr className="border-b border-fbs-border hover:bg-fbs-dark/40">
      <td className="px-5 py-3.5 text-white font-medium text-sm">{batch.batchName}</td>
      <td className="px-5 py-3.5 text-gray-400 text-xs">{batch.frnCode}</td>
      <td className="px-5 py-3.5 text-gray-400 text-xs">{batch.technology}</td>
      <td className="px-5 py-3.5 text-gray-400 text-xs">{batch.year}</td>
      <td className="px-5 py-3.5">
        {batch.accessApproved ? (
          <span className="flex items-center gap-1 text-fbs-green text-xs font-medium">
            <Icon d={ICONS.check} size={12} /> Approved
          </span>
        ) : batch.accessRequested ? (
          <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
            <Icon d={ICONS.clock} size={12} /> Pending
          </span>
        ) : (
          <button
            onClick={() => onRequestAccess(batch.id)}
            disabled={requesting === batch.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-fbs-border text-xs text-gray-300 hover:border-fbs-green hover:text-fbs-green transition-colors disabled:opacity-50"
          >
            <Icon d={ICONS.request} size={12} />
            {requesting === batch.id ? 'Requesting...' : 'Request Access'}
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function TrainerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [batchPage, setBatchPage] = useState(1);
  const BATCH_PAGE_SIZE = 4;

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  }

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/trainer/dashboard');
      setData(res.data);
    } catch {
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDashboard(); }, []);

  async function handleRequestAccess(batchId) {
    setRequesting(batchId);
    try {
      await axiosInstance.post('/trainer-requests', {
        batchId,
        requestType: 'BATCH_ACCESS',
      });
      showToast('Access requested successfully');
      fetchDashboard();
    } catch {
      showToast('Failed to request access', 'error');
    } finally {
      setRequesting(null);
    }
  }

  function handleMarkAttendance(batch) {
    navigate('/trainer/attendance', { state: { batch } });
  }

  const allBatches = data?.allBatches || [];
  const batchTotalPages = Math.max(1, Math.ceil(allBatches.length / BATCH_PAGE_SIZE));
  const safeBatchPage = Math.min(batchPage, batchTotalPages);
  const batchPageStart = (safeBatchPage - 1) * BATCH_PAGE_SIZE;
  const pagedBatches = allBatches.slice(batchPageStart, batchPageStart + BATCH_PAGE_SIZE);
  const batchPageNumbers = Array.from({ length: batchTotalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === batchTotalPages || Math.abs(p - safeBatchPage) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push(`ellipsis-${arr[i - 1]}`);
      acc.push(p);
      return acc;
    }, []);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Dashboard" pageSubtitle="Welcome back">
        <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Dashboard" pageSubtitle="Welcome back, Trainer">

      {/* ── Stat Cards ── */}
      <div className="mb-8 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ICONS.batches}    label="Assigned Batches"  value={data?.assignedBatches ?? 0} />
        <StatCard icon={ICONS.students}   label="Total Students"    value={data?.totalStudents ?? 0} />
        <StatCard icon={ICONS.sessions}   label="Sessions Today"    value={data?.sessionsDoneToday ?? 0} />
        <StatCard icon={ICONS.attendance} label="Avg Attendance"    value={data?.avgAttendance ?? 0} suffix="%" />
      </div>

      {/* ── Assigned Batches ── */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-3">My Batches</h2>

        {data?.assignedBatchList?.length === 0 ? (
          <div className="bg-fbs-card border border-fbs-border rounded-2xl py-12 text-center text-gray-500 text-sm">
            <div className="flex justify-center mb-3 text-gray-600">
              <Icon d={ICONS.lock} size={28} />
            </div>
            No batches assigned yet — request access below
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.assignedBatchList.map(batch => (
              <AssignedBatchCard
                key={batch.id}
                batch={batch}
                onMarkAttendance={handleMarkAttendance}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── All Batches ── */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">All Batches</h2>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-fbs-border bg-fbs-card">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fbs-border">
                  {['Batch Name', 'FRN Code', 'Technology', 'Year', 'Access'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fbs-border">
                {pagedBatches.map(batch => (
                  <AllBatchRow
                    key={batch.id}
                    batch={batch}
                    onRequestAccess={handleRequestAccess}
                    requesting={requesting}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-fbs-border md:hidden">
            {pagedBatches.map(batch => (
              <div key={batch.id} className="space-y-2 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{batch.batchName}</p>
                  <p className="truncate text-xs text-gray-400">{batch.frnCode} · {batch.technology} · {batch.year}</p>
                </div>
                {batch.accessApproved ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-fbs-green">
                    <Icon d={ICONS.check} size={12} /> Approved
                  </span>
                ) : batch.accessRequested ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-yellow-400">
                    <Icon d={ICONS.clock} size={12} /> Pending
                  </span>
                ) : (
                  <button
                    onClick={() => handleRequestAccess(batch.id)}
                    disabled={requesting === batch.id}
                    className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-fbs-border px-3 py-1.5 text-xs text-gray-300 disabled:opacity-50">
                    <Icon d={ICONS.request} size={12} />
                    {requesting === batch.id ? 'Requesting...' : 'Request Access'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {allBatches.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-fbs-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
              <p className="text-xs text-gray-600">
                Showing {batchPageStart + 1}–
                {Math.min(batchPageStart + BATCH_PAGE_SIZE, allBatches.length)} of {allBatches.length}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBatchPage(safeBatchPage - 1)}
                  disabled={safeBatchPage === 1}
                  className="min-h-11 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0">
                  Previous
                </button>
                {batchPageNumbers.map((p) =>
                  typeof p === 'string' ? (
                    <span key={p} className="px-1 text-xs text-gray-600">...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBatchPage(p)}
                      className={`flex h-11 min-w-11 items-center justify-center rounded-lg text-xs font-medium transition-colors sm:h-8 sm:min-w-8
                      ${safeBatchPage === p
                        ? 'bg-fbs-green text-black'
                        : 'border border-fbs-border bg-fbs-dark text-gray-400 hover:text-white'}`}>
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setBatchPage(safeBatchPage + 1)}
                  disabled={safeBatchPage === batchTotalPages}
                  className="min-h-11 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}