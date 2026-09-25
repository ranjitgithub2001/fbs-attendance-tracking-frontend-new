import { useEffect, useState, useCallback,useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";


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
  lock: "M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-5V9a6 6 0 1 0-12 0v3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2z",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  check: "M20 6L9 17l-5-5",
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
      className={`fixed bottom-24 right-4 z-50 max-w-[calc(100%-2rem)] px-4 py-3 rounded-xl border text-sm shadow-lg md:bottom-6 md:right-6
      ${
        type === "success"
          ? "bg-fbs-card border-fbs-green/30 text-fbs-green"
          : "bg-fbs-card border-red-500/30 text-red-400"
      }`}>
      {message}
    </div>
  );
}

const STATUS_CONFIG = {
  PRESENT: {
    label: "P",
    bg: "bg-fbs-green/10 border-fbs-green text-fbs-green",
    row: "bg-fbs-green/5",
  },
  ABSENT: {
    label: "A",
    bg: "bg-red-900/20 border-red-500 text-red-400",
    row: "bg-red-900/5",
  },
  LATE: {
    label: "L",
    bg: "bg-yellow-900/20 border-yellow-500 text-yellow-400",
    row: "bg-yellow-900/5",
  },
};

// ── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ status, active, onClick, disabled }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-11 w-11 min-h-11 min-w-11 rounded-lg border text-xs font-bold transition-all md:h-8 md:w-8 md:min-h-8 md:min-w-8
        ${active ? cfg.bg : "bg-fbs-dark border-fbs-border text-gray-600 hover:border-gray-500"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
      {cfg.label}
    </button>
  );
}
function SearchableBatchSelect({ batches, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selected = batches.find(b => String(b.id) === String(value));
  const filtered = batches.filter(b =>
    b.active && b.batchName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>   {/* ← ref must be HERE */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full min-h-11 bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2.5 text-sm text-left outline-none focus:border-fbs-green transition-colors flex items-center justify-between gap-2"
      >
        <span className={`min-w-0 truncate ${selected ? 'text-white' : 'text-gray-600'}`}>
          {selected ? selected.batchName : 'Select batch'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-fbs-card border border-fbs-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-fbs-border">
            <input
              autoFocus
              type="text"
              placeholder="Search batch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-xs placeholder-gray-600 outline-none focus:border-fbs-green"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500">No batches found</div>
            ) : (
              filtered.map(b => (
                <button
                  key={b.id}
                  onClick={() => { onChange(String(b.id)); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-fbs-dark transition-colors flex items-center justify-between
                    ${String(b.id) === String(value) ? 'text-fbs-green' : 'text-white'}`}
                >
                  {b.batchName}
                  {String(b.id) === String(value) && <Icon d={ICONS.check} size={12} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MarkAttendance() {
  const { user } = useAuth();
  const trainerId = user?.userId;
  const [searchParams] = useSearchParams();
  const preselectedBatch = searchParams.get("batchId");

  // ── State ──────────────────────────────────────────────────────────────────
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'PRESENT'|'ABSENT'|'LATE' }
  const [existingSession, setExistingSession] = useState(null);

  const [selectedBatch, setSelectedBatch] = useState(preselectedBatch || "");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );


  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("ALL");

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const today = new Date().toISOString().split("T")[0];

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }

  // ── Fetch accessible batches ───────────────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get("/batches/accessible")
      .then((r) => setBatches(r.data || []))
      .catch(() => showToast("Failed to load batches", "error"))
      .finally(() => setLoadingBatches(false));
  }, []);

  // ── Fetch students + existing session when batch/date changes ──────────────
  const fetchSessionData = useCallback(async () => {
    if (!selectedBatch || !selectedDate) return;

    setLoadingStudents(true);
    setExistingSession(null);
    setIsLocked(false);

    try {
      // Fetch students
      const studRes = await axiosInstance.get(
        `/students/batch/${selectedBatch}`,
      );
      const studs = studRes.data || [];
      setStudents(studs);

      // Initialize all as unset
      const initMap = {};
      studs.forEach((s) => {
        initMap[s.id] = null;
      });

      // Check for existing session
      const sessRes = await axiosInstance.get(
        `/attendance/sessions/batch/${selectedBatch}`,
      );
      const sessions = sessRes.data || [];
      const session = sessions.find((s) => s.sessionDate === selectedDate);

      if (session) {
        setExistingSession(session);

        // Check lock — session older than 24h
        const created = new Date(session.createdAt);
        const hoursDiff = (Date.now() - created.getTime()) / (1000 * 60 * 60);
        setIsLocked(hoursDiff > 24);

        // Fetch records for this session
        const recRes = await axiosInstance.get(
          `/attendance/sessions/${session.id}/records`,
        );
        const records = recRes.data || [];
        records.forEach((r) => {
          initMap[r.studentId] = r.status;
        });

        
      }

      setAttendance(initMap);
    } catch {
      showToast("Failed to load session data", "error");
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedBatch, selectedDate]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  // ── Mark single student ───────────────────────────────────────────────────
  function markStudent(studentId, status) {
    if (isLocked) return;
    setAttendance((p) => ({
      ...p,
      [studentId]: p[studentId] === status ? null : status,
    }));
  }

  // ── Bulk mark ─────────────────────────────────────────────────────────────
  function markAll(status) {
    if (isLocked) return;
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selectedBatch || !selectedDate) {
      showToast("Please select batch and date", "error");
      return;
    }
   

    const unset = students.filter((s) => !attendance[s.id]);
    if (unset.length > 0) {
      showToast(`${unset.length} student(s) not marked yet`, "error");
      return;
    }

    setSubmitting(true);
    try {
      if (existingSession) {
        // Update existing records
        await Promise.all(
          students.map((s) =>
            axiosInstance.post(
              `/attendance/sessions/${existingSession.id}/records?studentId=${s.id}&status=${attendance[s.id]}`,
            ),
          ),
        );
        showToast("Attendance updated successfully");
      } else {
        // Create session first
        const sessRes = await axiosInstance.post(
          `/attendance/sessions?batchId=${selectedBatch}&trainerId=${trainerId}&date=${selectedDate}`,
        );
        const sessionId = sessRes.data.id;

        // Mark all students
        await Promise.all(
          students.map((s) =>
            axiosInstance.post(
              `/attendance/sessions/${sessionId}/records?studentId=${s.id}&status=${attendance[s.id]}`,
            ),
          ),
        );
        showToast("Attendance submitted successfully");
        setExistingSession(sessRes.data);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to submit attendance",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Filter students ───────────────────────────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.frn?.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      filterTab === "ALL" ||
      (filterTab === "PRESENT" && attendance[s.id] === "PRESENT") ||
      (filterTab === "ABSENT" && attendance[s.id] === "ABSENT") ||
      (filterTab === "LATE" && attendance[s.id] === "LATE") ||
      (filterTab === "UNMARKED" && !attendance[s.id]);
    return matchSearch && matchTab;
  });

  // ── Tab counts ────────────────────────────────────────────────────────────
  const tabCounts = {
    ALL: students.length,
    PRESENT: students.filter((s) => attendance[s.id] === "PRESENT").length,
    ABSENT: students.filter((s) => attendance[s.id] === "ABSENT").length,
    LATE: students.filter((s) => attendance[s.id] === "LATE").length,
    UNMARKED: students.filter((s) => !attendance[s.id]).length,
  };

  const isUpdate = !!existingSession;
  const allMarked =
    students.length > 0 && students.every((s) => attendance[s.id]);
  const selectedBatchObj = batches.find(
    (b) => String(b.id) === String(selectedBatch),
  );

  return (
    <DashboardLayout
      pageTitle="Mark Attendance"
      pageSubtitle="Record student attendance per session">
      <div className="max-w-4xl mx-auto min-w-0 space-y-4">
        {/* ── Step 1: Session Setup ── */}
        <div className="bg-fbs-card border border-fbs-border rounded-2xl p-4 md:p-5">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-4">
            Step 1 — Session Setup
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Batch */}
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                Batch
              </label>
              {loadingBatches ? (
                <div className="h-10 bg-fbs-dark border border-fbs-border rounded-lg animate-pulse" />
              ) : (
                <SearchableBatchSelect
                  batches={batches}
                  value={selectedBatch}
                  onChange={(val) => {
                    setSelectedBatch(val);
                  }}
                  loading={loadingBatches}
                />
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full min-h-11 bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-fbs-green transition-colors"
              />
            </div>

            {/* Topic */}
          </div>

          {/* Session status indicators */}
          {selectedBatch && selectedDate && !loadingStudents && (
            <div className="mt-3 flex items-center gap-2">
              {isUpdate ? (
                <span className="flex items-center gap-1.5 text-xs text-blue-400">
                  <Icon d={ICONS.check} size={12} />
                  Existing session found — editing mode
                </span>
              ) : (
                <span className="text-xs text-gray-500">
                  New session will be created on submit
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Lock Banner ── */}
        {isLocked && (
          <div className="flex items-start gap-3 bg-yellow-900/10 border border-yellow-900/30 rounded-2xl px-5 py-4">
            <span className="text-yellow-400 mt-0.5 flex-shrink-0">
              <Icon d={ICONS.lock} size={16} />
            </span>
            <div>
              <p className="text-yellow-400 text-sm font-semibold">
                Session Locked
              </p>
              <p className="text-yellow-600 text-xs mt-0.5">
                This session is older than 24 hours and cannot be edited. Please
                contact admin for corrections.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Student List ── */}
        {selectedBatch && (
          <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-4 border-b border-fbs-border md:px-5">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">
                    Step 2 — Mark Students
                  </p>
                  {selectedBatchObj && (
                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {selectedBatchObj.batchName}
                    </p>
                  )}
                </div>

                {/* Bulk actions */}
                {!isLocked && students.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => markAll("PRESENT")}
                      className="min-h-11 px-3 py-2 bg-fbs-green/10 border border-fbs-green/20 text-fbs-green rounded-lg text-xs font-semibold hover:bg-fbs-green/20 transition-colors md:min-h-0 md:py-1.5">
                      All Present
                    </button>
                    <button
                      onClick={() => markAll("ABSENT")}
                      className="min-h-11 px-3 py-2 bg-red-900/10 border border-red-900/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-900/20 transition-colors md:min-h-0 md:py-1.5">
                      All Absent
                    </button>
                  </div>
                )}
              </div>

              {/* Search + filter tabs */}
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Icon d={ICONS.search} size={13} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or FRN…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full min-h-11 bg-fbs-dark border border-fbs-border rounded-lg pl-8 pr-3 py-2 text-white text-xs placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
                  />
                </div>

                <div className="min-w-0 overflow-x-auto">
                  <div className="flex w-max min-w-full gap-1 bg-fbs-dark border border-fbs-border rounded-lg p-1">
                    {["ALL", "PRESENT", "ABSENT", "LATE", "UNMARKED"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setFilterTab(tab)}
                          className={`min-h-11 shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors whitespace-nowrap md:min-h-0
                        ${filterTab === tab ? "bg-fbs-green text-gray-900" : "text-gray-400 hover:text-white"}`}>
                          {tab} ({tabCounts[tab]})
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Student rows */}
            {loadingStudents ? (
              <Spinner />
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No students found in this batch
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No students match your filter
              </div>
            ) : (
              <div className="divide-y divide-fbs-border">
                {filteredStudents.map((s, i) => {
                  const status = attendance[s.id];
                  const rowBg = status ? STATUS_CONFIG[status].row : "";
                  return (
                    <div
                      key={s.id}
                      className={`flex flex-col gap-3 px-4 py-3.5 transition-colors md:flex-row md:items-center md:gap-4 md:px-5 ${rowBg}`}>
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="w-5 shrink-0 text-right text-xs text-gray-600">
                          {i + 1}
                        </span>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-fbs-border bg-fbs-card">
                          <span className="text-[11px] font-bold text-gray-400">
                            {s.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {s.fullName}
                          </p>
                          <p className="truncate font-mono text-xs text-gray-500">
                            {s.frn}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1.5 self-end md:self-auto">
                        {["PRESENT", "ABSENT", "LATE"].map((st) => (
                          <StatusPill
                            key={st}
                            status={st}
                            active={status === st}
                            onClick={() => markStudent(s.id, st)}
                            disabled={isLocked}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer — progress + submit */}
            {students.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-fbs-border px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-fbs-dark">
                    <div
                      className="h-full rounded-full bg-fbs-green transition-all duration-300"
                      style={{
                        width: `${(students.filter((s) => attendance[s.id]).length / students.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {students.filter((s) => attendance[s.id]).length} /{" "}
                    {students.length} marked
                  </span>
                </div>

                {!isLocked && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !allMarked}
                    className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors md:w-auto
                      ${
                        allMarked
                          ? "bg-fbs-green hover:bg-fbs-yellow text-gray-900"
                          : "bg-fbs-dark border border-fbs-border text-gray-500 cursor-not-allowed"
                      }`}>
                    {submitting
                      ? "Submitting…"
                      : isUpdate
                        ? "Update Attendance"
                        : "Submit Attendance"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}
