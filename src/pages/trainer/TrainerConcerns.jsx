import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import DashboardLayout from '../../components/DashboardLayout';

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  search: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  check:  'M5 13l4 4L19 7',
  close:  'M18 6L6 18M6 6l12 12',
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-fbs-border border-t-fbs-green rounded-full animate-spin" />
    </div>
  );
}

function Toast({ message, type = 'success' }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 right-4 z-50 max-w-[calc(100%-2rem)] px-4 py-3 rounded-xl border text-sm shadow-lg md:right-6
      ${type === 'success' ? 'bg-fbs-card border-fbs-green/30 text-fbs-green' : 'bg-fbs-card border-red-500/30 text-red-400'}`}>
      {message}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    PENDING:  'bg-yellow-900/10 border-yellow-700/30 text-yellow-400',
    RESOLVED: 'bg-fbs-green/10 border-fbs-green/30 text-fbs-green',
    REJECTED: 'bg-red-900/10 border-red-700/30 text-red-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg[status] || ''}`}>
      {status}
    </span>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Resolve Modal ─────────────────────────────────────────────────────────────
function ResolveModal({ concern, onClose, onDone }) {
  const [action, setAction]   = useState('RESOLVED');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!remarks.trim()) { setError('Please enter remarks'); return; }
    setLoading(true);
    try {
      await axiosInstance.put(
        `/concerns/${concern.id}/resolve?status=${action}&remarks=${encodeURIComponent(remarks.trim())}`
      );
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full min-w-0 max-w-md rounded-2xl border border-fbs-border bg-fbs-card p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-white">Resolve Concern</h3>
            <p className="mt-0.5 truncate text-xs text-gray-500">{concern.studentName} · {concern.frn}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-gray-500 transition-colors hover:text-white md:h-auto md:w-auto">
            <Icon d={ICONS.close} />
          </button>
        </div>

        {/* Concern details */}
        <div className="bg-fbs-dark border border-fbs-border rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">{concern.type.replace('_', ' ')} · {fmtDate(concern.sessionDate)}</p>
          <p className="text-gray-300 text-sm">{concern.reason}</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Action toggle */}
          <div className="mb-4">
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">Action</label>
            <div className="flex gap-3">
              {[{ value: 'RESOLVED', label: 'Resolve' }, { value: 'REJECTED', label: 'Reject' }].map(a => (
                <button key={a.value} type="button" onClick={() => setAction(a.value)}
                  className={`min-h-11 flex-1 rounded-lg border py-2.5 text-xs font-semibold transition-colors
                    ${action === a.value
                      ? a.value === 'RESOLVED' ? 'bg-fbs-green text-gray-900 border-fbs-green' : 'bg-red-900/30 text-red-400 border-red-700/40'
                      : 'bg-fbs-dark border-fbs-border text-gray-400 hover:border-gray-500'}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-5">
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
              placeholder={action === 'RESOLVED' ? 'e.g. Attendance has been corrected' : 'e.g. No valid proof provided'}
              rows={3}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="min-h-11 flex-1 rounded-lg border border-fbs-border bg-fbs-dark py-2.5 text-sm text-gray-400 transition-colors hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`min-h-11 flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50
                ${action === 'RESOLVED' ? 'bg-fbs-green hover:bg-fbs-yellow text-gray-900' : 'bg-red-900/30 hover:bg-red-900/50 border border-red-700/40 text-red-400'}`}>
              {loading ? 'Submitting…' : action === 'RESOLVED' ? 'Mark Resolved' : 'Mark Rejected'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TrainerConcerns() {
  const [concerns, setConcerns]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('ALL');
  const [resolveModal, setResolveModal] = useState(null);
  const [toast, setToast]           = useState({ msg: '', type: 'success' });

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  }

  async function fetchConcerns() {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/concerns');
      setConcerns(res.data || []);
    } catch {
      showToast('Failed to load concerns', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchConcerns(); }, []);

  const counts = {
    ALL:      concerns.length,
    PENDING:  concerns.filter(c => c.status === 'PENDING').length,
    RESOLVED: concerns.filter(c => c.status === 'RESOLVED').length,
    REJECTED: concerns.filter(c => c.status === 'REJECTED').length,
  };

  const filtered = concerns.filter(c => {
    const matchFilter = filter === 'ALL' || c.status === filter;
    const matchSearch = c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                        c.frn?.toLowerCase().includes(search.toLowerCase()) ||
                        c.batchName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout pageTitle="Student Concerns" pageSubtitle="Review and resolve student attendance concerns">

      {/* Stats */}
      <div className="mb-6 grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: 'Total',    value: counts.ALL,      color: 'text-white' },
          { label: 'Pending',  value: counts.PENDING,  color: 'text-yellow-400' },
          { label: 'Resolved', value: counts.RESOLVED, color: 'text-fbs-green' },
          { label: 'Rejected', value: counts.REJECTED, color: 'text-red-400' },
        ].map(c => (
          <div key={c.label} className="min-w-0 rounded-2xl border border-fbs-border bg-fbs-card p-4">
            <p className="mb-1 text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex min-w-0 flex-col gap-3 md:flex-row">
        <div className="relative min-w-0 flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon d={ICONS.search} size={14} />
          </span>
          <input type="text" placeholder="Search by student, FRN or batch..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-card py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-fbs-green" />
        </div>
        <div className="min-w-0 overflow-x-auto">
          <div className="flex w-max min-w-full gap-1 rounded-lg border border-fbs-border bg-fbs-card p-1">
          {['ALL','PENDING','RESOLVED','REJECTED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`min-h-11 shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors md:min-h-0
                ${filter === f ? 'bg-fbs-green text-gray-900' : 'text-gray-400 hover:text-white'}`}>
              {f} ({counts[f]})
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Table / cards */}
      <div className="min-w-0 overflow-hidden rounded-2xl border border-fbs-border bg-fbs-card">
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">No concerns found</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fbs-border">
                    {['Student','Type','Session','Reason','Raised On','Status','Action'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-fbs-border">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-fbs-dark/40">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-white">{c.studentName}</p>
                        <p className="font-mono text-xs text-gray-500">{c.frn}</p>
                        <p className="text-xs text-gray-600">{c.batchName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="whitespace-nowrap rounded-full border border-blue-700/30 bg-blue-900/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
                          {c.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-400">
                        {fmtDate(c.sessionDate)}
                      </td>
                      <td className="max-w-xs px-5 py-3.5 text-xs text-gray-300">
                        <p className="truncate">{c.reason}</p>
                        {c.trainerRemarks && (
                          <p className="mt-0.5 truncate text-[10px] text-gray-500">Remarks: {c.trainerRemarks}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-500">
                        {fmtDateTime(c.createdAt)}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5">
                        {c.status === 'PENDING' ? (
                          <button onClick={() => setResolveModal(c)}
                            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-fbs-green/20 bg-fbs-green/10 px-3 py-1.5 text-xs font-semibold text-fbs-green transition-colors hover:bg-fbs-green/20">
                            <Icon d={ICONS.check} size={12} /> Resolve
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600">
                            by {c.resolvedBy || '—'}<br />
                            {fmtDate(c.resolvedAt)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-fbs-border md:hidden">
              {filtered.map(c => (
                <div key={c.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{c.studentName}</p>
                      <p className="truncate font-mono text-xs text-gray-500">{c.frn}</p>
                      <p className="truncate text-xs text-gray-600">{c.batchName}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-700/30 bg-blue-900/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
                      {c.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">{fmtDate(c.sessionDate)}</span>
                    <span className="text-xs text-gray-500">{fmtDateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-300">{c.reason}</p>
                  {c.trainerRemarks && (
                    <p className="text-[10px] text-gray-500">Remarks: {c.trainerRemarks}</p>
                  )}
                  {c.status === 'PENDING' ? (
                    <button onClick={() => setResolveModal(c)}
                      className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-fbs-green/20 bg-fbs-green/10 px-3 py-2 text-xs font-semibold text-fbs-green">
                      <Icon d={ICONS.check} size={12} /> Resolve
                    </button>
                  ) : (
                    <p className="text-xs text-gray-600">
                      by {c.resolvedBy || '—'} · {fmtDate(c.resolvedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {resolveModal && (
        <ResolveModal
          concern={resolveModal}
          onClose={() => setResolveModal(null)}
          onDone={() => {
            setResolveModal(null);
            showToast('Concern updated successfully');
            fetchConcerns();
          }}
        />
      )}

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}