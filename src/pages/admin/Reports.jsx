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
  batch:
    "M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10",
  student:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  alert:
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  chevron: "M9 18l6-6-6-6",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
};

// ── Helpers ───────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

function pct(val) {
  return typeof val === "number" ? val.toFixed(1) : "0.0";
}

function MiniBar({ value, max = 100, color = "#a3e635" }) {
  const w = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-fbs-dark rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${w}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-400 w-10 text-right">
        {pct(value)}%
      </span>
    </div>
  );
}

function TabBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 md:min-h-0
  ${
    active
      ? "bg-fbs-green text-black shadow-md scale-[1.03]"
      : "text-gray-400 hover:text-white hover:bg-fbs-dark"
  }`}>
      <Icon d={icon} size={13} />
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 1 — Batch Summary
// ═══════════════════════════════════════════════════════════════════════
function BatchSummaryTab() {
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [sessPage, setSessPage] = useState(1);
  const SESS_PAGE_SIZE = 8;
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showTable, setShowTable] = useState(false);
  useEffect(() => {
    axiosInstance
      .get("/batches")
      .then((r) => setBatches(r.data || []))
      .finally(() => setLoadingBatches(false));
  }, []);

  async function loadBatch(batchId) {
    setSelected(batchId);
    setSessPage(1);
    setLoading(true);
    try {
      const sessRes = await axiosInstance.get(
        `/attendance/sessions/batch/${batchId}`,
      );
      const sess = sessRes.data || [];
      setSessions(sess);
      const recMap = {};
      await Promise.all(
        sess.map(async (s) => {
          const r = await axiosInstance.get(
            `/attendance/sessions/${s.id}/records`,
          );
          recMap[s.id] = r.data || [];
        }),
      );
      setRecords(recMap);
    } finally {
      setLoading(false);
    }
  }

  const sessionStats = sessions.map((s) => {
    const recs = records[s.id] || [];
    const total = recs.length;
    const present = recs.filter((r) => r.status === "PRESENT").length;
    const absent = recs.filter((r) => r.status === "ABSENT").length;
    const late = recs.filter((r) => r.status === "LATE").length;
    const pctVal = total ? (present / total) * 100 : 0;
    return { ...s, total, present, absent, late, pct: pctVal };
  });
  const filteredStats = sessionStats.filter((s) => {
    if (!fromDate && !toDate) return true;

    const d = new Date(s.sessionDate);

    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > new Date(toDate)) return false;

    return true;
  });

  const avgPct = sessionStats.length
    ? sessionStats.reduce((a, s) => a + s.pct, 0) / sessionStats.length
    : 0;
  const selectedBatch = batches.find((b) => b.id === selected);

  return (
    <div className="space-y-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Select Batch
          </p>

          {/* FILTER (moved here) */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="min-h-11 rounded border border-fbs-border bg-fbs-dark px-2 py-1 text-xs text-white md:min-h-0"
            />

            <span className="text-xs text-gray-500">to</span>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="min-h-11 rounded border border-fbs-border bg-fbs-dark px-2 py-1 text-xs text-white md:min-h-0"
            />

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="min-h-11 text-xs text-red-400 hover:underline md:min-h-0">
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {loadingBatches ? (
            <Spinner />
          ) : (
            batches.map((b) => (
              <button
                key={b.id}
                onClick={() => loadBatch(b.id)}
                className={`min-h-11 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-200 md:min-h-0
  ${
    selected === b.id
      ? "bg-fbs-green text-black border-fbs-green shadow-md scale-[1.05]"
      : "bg-fbs-dark border-fbs-border text-gray-300 hover:border-fbs-green/50 hover:text-white"
  }`}>
                {b.batchName}
              </button>
            ))
          )}
        </div>
      </div>

      {!selected && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">📊 No Batch Selected</p>
          <p className="text-sm mt-1">
            Choose a batch above to view attendance summary
          </p>
        </div>
      )}
      {selected && loading && <Spinner />}

      {selected && !loading && sessionStats.length > 0 && (
        <>
          <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: "Total Sessions",
                value: sessions.length,
                color: "text-white",
              },
              {
                label: "Avg Attendance",
                value: `${pct(avgPct)}%`,
                color: "text-fbs-green",
              },
              {
                label: "Best Session",
                value: `${pct(Math.max(...sessionStats.map((s) => s.pct)))}%`,
                color: "text-blue-400",
              },
              {
                label: "Worst Session",
                value: `${pct(Math.min(...sessionStats.map((s) => s.pct)))}%`,
                color: "text-red-400",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="bg-fbs-card border border-fbs-border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-fbs-card border border-fbs-border rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">
              Attendance Trend — {selectedBatch?.batchName}
            </p>
            <div className="flex items-end gap-1.5 h-32">
              {filteredStats.map((s) => {
                const h = Math.max(4, (s.pct / 100) * 128);
                const color =
                  s.pct >= 75 ? "#a3e635" : s.pct >= 50 ? "#facc15" : "#f87171";
                return (
                  <div
                    key={s.id}
                    className="flex-1 flex flex-col items-center group relative">
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-fbs-dark border border-fbs-border rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-10 flex-col items-center">
                      <span>{s.sessionDate}</span>
                      <span className="text-fbs-green">{pct(s.pct)}%</span>
                    </div>
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: `${h}px`, backgroundColor: color }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-600">
              <span>{fmtDate(filteredStats[0]?.sessionDate)}</span>
              <span>
                {fmtDate(filteredStats[filteredStats.length - 1]?.sessionDate)}
              </span>
            </div>
          </div>



         {showTable && (<div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-fbs-border">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                  Session Breakdown
                </p>

                <button
                  onClick={() => setShowTable((p) => !p)}
                  className="text-xs text-fbs-green hover:underline">
                  {showTable ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="min-w-0">
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fbs-border">
                    {[
                      "Date",
                      "Trainer",
                      "Present",
                      "Absent",
                      "Late",
                      "Attendance",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-fbs-border">
                  {filteredStats
                    .slice(
                      (sessPage - 1) * SESS_PAGE_SIZE,
                      sessPage * SESS_PAGE_SIZE,
                    )
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-fbs-dark/40">
                        <td className="px-5 py-3 text-xs text-white">
                          {fmtDate(s.sessionDate)}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">
                          {s.trainerName}
                        </td>
                        <td className="px-5 py-3 text-xs text-fbs-green">
                          {s.present}
                        </td>
                        <td className="px-5 py-3 text-xs text-red-400">
                          {s.absent}
                        </td>
                        <td className="px-5 py-3 text-xs text-yellow-400">
                          {s.late}
                        </td>
                        <td className="w-40 px-5 py-3">
                          <MiniBar value={s.pct} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              </div>
              <div className="divide-y divide-fbs-border md:hidden">
                {filteredStats
                  .slice(
                    (sessPage - 1) * SESS_PAGE_SIZE,
                    sessPage * SESS_PAGE_SIZE,
                  )
                  .map((s) => (
                    <div key={s.id} className="space-y-2 px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white">{fmtDate(s.sessionDate)}</p>
                          <p className="truncate text-xs text-gray-400">{s.trainerName}</p>
                        </div>
                        <p className="shrink-0 text-xs text-gray-400">
                          P {s.present} · A {s.absent} · L {s.late}
                        </p>
                      </div>
                      <MiniBar value={s.pct} />
                    </div>
                  ))}
              </div>
                    
              {filteredStats.length > SESS_PAGE_SIZE && (
                <div className="flex flex-col gap-3 border-t border-fbs-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
                  <p className="text-xs text-gray-600">
                    {(sessPage - 1) * SESS_PAGE_SIZE + 1}–
                    {Math.min(sessPage * SESS_PAGE_SIZE, filteredStats.length)}{" "}
                    of {filteredStats.length} sessions
                  </p>
                  <div className="flex min-w-0 flex-wrap gap-1">
                    <button
                      onClick={() => setSessPage((p) => Math.max(1, p - 1))}
                      disabled={sessPage === 1}
                      className="min-h-11 px-3 py-1 bg-fbs-dark border border-fbs-border rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 md:min-h-0">
                      ←
                    </button>

                    {Array.from(
                      {
                        length: Math.ceil(sessionStats.length / SESS_PAGE_SIZE),
                      },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSessPage(p)}
                        className={`min-h-11 min-w-11 rounded text-xs font-medium md:h-7 md:min-h-0 md:w-7 md:min-w-0 ${sessPage === p ? "bg-fbs-green text-black" : "bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white"}`}>
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setSessPage((p) =>
                          Math.min(
                            Math.ceil(sessionStats.length / SESS_PAGE_SIZE),
                            p + 1,
                          ),
                        )
                      }
                      disabled={
                        sessPage ===
                        Math.ceil(sessionStats.length / SESS_PAGE_SIZE)
                      }
                      className="min-h-11 px-3 py-1 bg-fbs-dark border border-fbs-border rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 md:min-h-0">
                      →
                    </button>
                  </div>
                </div>
              
              )}
            </div>
          </div>)}

        </>
            
      )}
      {selected && !loading && sessionStats.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">
          No sessions found for this batch
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 2 — Student Report
// ═══════════════════════════════════════════════════════════════════════
function StudentReportTab() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [loadingS, setLoadingS] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/students")
      .then((r) => setStudents(r.data || []))
      .finally(() => setLoadingS(false));
  }, []);

  async function loadStudent(s) {
    setSelected(s);
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/attendance/student/${s.id}/records`,
      );
      setRecords(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter((r) => {
    const d = r.sessionDate?.split("T")[0];
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });

  const presentCount = filteredRecords.filter(
    (r) => r.status === "PRESENT",
  ).length;
  const absentCount = filteredRecords.filter(
    (r) => r.status === "ABSENT",
  ).length;
  const lateCount = filteredRecords.filter((r) => r.status === "LATE").length;
  const attendancePct = filteredRecords.length
    ? ((presentCount / filteredRecords.length) * 100).toFixed(1)
    : "0.0";

  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.frn?.toLowerCase().includes(search.toLowerCase()),
  );

  function exportCSV() {
    const rows = [
      ["Date", "Status", "Marked At"],
      ...filteredRecords.map((r) => [
        fmtDate(r.sessionDate),
        r.status,
        fmtDate(r.markedAt),
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${selected?.fullName}_attendance.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportPDF() {
    const win = window.open("", "_blank");
    win.document
      .write(`<html><head><title>${selected?.fullName} Attendance</title>
    <style>body{font-family:sans-serif;padding:32px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f4f4f4;padding:8px 12px;text-align:left;border-bottom:2px solid #ddd}td{padding:8px 12px;border-bottom:1px solid #eee}.PRESENT{color:green}.ABSENT{color:red}.LATE{color:orange}.stats{display:flex;gap:16px;margin-bottom:24px}.stat{background:#f9f9f9;border-radius:8px;padding:12px 20px}.val{font-size:22px;font-weight:bold}</style>
    </head><body>
    <h2>${selected?.fullName} — Attendance Report</h2>
    <p>${selected?.frn} · ${selected?.batchName}</p>
    <div class="stats">
      <div class="stat"><div class="val" style="color:green">${presentCount}</div>Present</div>
      <div class="stat"><div class="val" style="color:red">${absentCount}</div>Absent</div>
      <div class="stat"><div class="val" style="color:orange">${lateCount}</div>Late</div>
      <div class="stat"><div class="val">${attendancePct}%</div>Attendance</div>
    </div>
    <table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>
    ${filteredRecords.map((r) => `<tr><td>${r.sessionDate?.split("T")[0]}</td><td class="${r.status}">${r.status}</td></tr>`).join("")}
    </tbody></table></body></html>`);
    win.document.close();
    win.print();
  }

  const statusColor = {
    PRESENT: "text-fbs-green",
    ABSENT: "text-red-400",
    LATE: "text-yellow-400",
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-fbs-border">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">
            Students
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon d={ICONS.search} size={13} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-dark py-2 pl-8 pr-3 text-xs text-white placeholder-gray-600 outline-none focus:border-fbs-green"
            />
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto divide-y divide-fbs-border">
          {loadingS ? (
            <Spinner />
          ) : (
            filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => loadStudent(s)}
                className={`w-full min-w-0 text-left px-4 py-3 hover:bg-fbs-dark transition-colors ${selected?.id === s.id ? "bg-fbs-dark border-l-2 border-fbs-green" : ""}`}>
                <p className="truncate text-sm font-medium text-white">{s.fullName}</p>
                <p className="truncate font-mono text-xs text-gray-500">{s.frn}</p>
                <p className="truncate text-xs text-gray-600">{s.batchName}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {!selected ? (
          <div className="bg-fbs-card border border-fbs-border rounded-2xl flex items-center justify-center py-24 text-gray-500 text-sm">
            Select a student to view report
          </div>
        ) : (
          <>
            <div className="bg-fbs-card border border-fbs-border rounded-2xl p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {selected.fullName}
                  </p>
                  <p className="truncate font-mono text-xs text-gray-500">
                    {selected.frn} · {selected.batchName}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={exportCSV}
                    className="flex min-h-11 items-center gap-1.5 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-fbs-green hover:text-fbs-green md:min-h-0">
                    <Icon d={ICONS.download} size={12} /> CSV
                  </button>
                  <button
                    onClick={exportPDF}
                    className="flex min-h-11 items-center gap-1.5 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-fbs-green hover:text-fbs-green md:min-h-0">
                    <Icon d={ICONS.download} size={12} /> PDF
                  </button>
                </div>
              </div>

              <div className="mb-4 grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  {
                    label: "Total",
                    value: filteredRecords.length,
                    color: "text-white",
                  },
                  {
                    label: "Present",
                    value: presentCount,
                    color: "text-fbs-green",
                  },
                  {
                    label: "Absent",
                    value: absentCount,
                    color: "text-red-400",
                  },
                  { label: "Late", value: lateCount, color: "text-yellow-400" },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="bg-fbs-dark border border-fbs-border rounded-xl p-3 text-center">
                    <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                    <p className="text-xs text-gray-500">{c.label}</p>
                  </div>
                ))}
              </div>

              <MiniBar value={Number(attendancePct)} />

              <div className="flex gap-2 mt-4 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">
                    From
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-2 text-xs text-white outline-none focus:border-fbs-green"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-2 text-xs text-white outline-none focus:border-fbs-green"
                  />
                </div>
              </div>
            </div>

            <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-fbs-border">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                  Session Records
                </p>
              </div>
              {loading ? (
                <Spinner />
              ) : (
                <div className="divide-y divide-fbs-border max-h-72 overflow-y-auto">
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No records in this date range
                    </div>
                  ) : (
                    filteredRecords.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
                        <span className="text-white text-xs">
                          {fmtDate(r.sessionDate)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${statusColor[r.status]}`}>
                          {r.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 3 — Low Attendance
// ═══════════════════════════════════════════════════════════════════════

function LowAttendanceTab() {
  const [students, setStudents] = useState([]);
  const [allRecords, setAllRecords] = useState({});
  const [threshold, setThreshold] = useState(75);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [lowPage, setLowPage] = useState(1);
  const LOW_PAGE_SIZE = 8;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  }

  const [alertModal, setAlertModal] = useState(null); // { id, name }
  const [alertFrom, setAlertFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 15);
    return d.toISOString().split("T")[0];
  });
  const [alertTo, setAlertTo] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [alertSending, setAlertSending] = useState(false);

  async function sendAlert() {
    if (!alertModal) return;
    setAlertSending(true);
    try {
      await axiosInstance.post(
        `/alerts/send/${alertModal.id}?from=${alertFrom}&to=${alertTo}`,
      );
      showToast(`Alert sent to ${alertModal.name}`);
      setAlertModal(null);
    } catch {
      showToast("Failed to send alert", "error");
    } finally {
      setAlertSending(false);
    }
  }
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const sRes = await axiosInstance.get("/students");
        const studs = sRes.data || [];
        setStudents(studs);
        const recMap = {};
        await Promise.all(
          studs.map(async (s) => {
            const r = await axiosInstance.get(
              `/attendance/student/${s.id}/records`,
            );
            recMap[s.id] = r.data || [];
          }),
        );
        setAllRecords(recMap);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const withStats = students.map((s) => {
    const recs = allRecords[s.id] || [];
    const total = recs.length;
    const present = recs.filter((r) => r.status === "PRESENT").length;
    return { ...s, total, present, pct: total ? (present / total) * 100 : 0 };
  });

  const filtered = withStats
    .filter((s) => s.pct < threshold)
    .filter(
      (s) =>
        s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.frn?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.pct - b.pct);

  return (
    <div className="space-y-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-2">
            Threshold: <span className="text-white">{threshold}%</span>
          </label>
          <input
            type="range"
            min="40"
            max="95"
            step="5"
            value={threshold}
            onChange={(e) => {
              setThreshold(Number(e.target.value));
              setLowPage(1);
            }}
            className="w-full accent-fbs-green"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>40%</span>
            <span>95%</span>
          </div>
        </div>
        <div className="relative sm:w-56">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon d={ICONS.search} size={13} />
          </span>
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-dark py-2.5 pl-8 pr-3 text-xs text-white placeholder-gray-600 outline-none focus:border-fbs-green"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 bg-red-900/20 border border-red-700/30 text-red-400 rounded-full text-xs font-semibold">
          {filtered.length} students below {threshold}%
        </span>
      </div>

      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No students below {threshold}% threshold
          </div>
        ) : (
          <div className="min-w-0">
            <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fbs-border">
                  {[
                    "Student",
                    "FRN",
                    "Batch",
                    "Sessions",
                    "Attendance",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fbs-border">
                {filtered
                  .slice((lowPage - 1) * LOW_PAGE_SIZE, lowPage * LOW_PAGE_SIZE)
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-fbs-dark/40">
                      <td className="px-5 py-3.5 text-sm font-medium text-white">
                        {s.fullName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                        {s.frn}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {s.batchName}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {s.present}/{s.total}
                      </td>
                      <td className="w-36 px-5 py-3.5">
                        <MiniBar
                          value={s.pct}
                          color={s.pct < 50 ? "#f87171" : "#facc15"}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() =>
                            setAlertModal({ id: s.id, name: s.fullName })
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-fbs-green px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-fbs-green/90">
                          <Icon d={ICONS.alert} size={11} /> Send Alert
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
            <div className="divide-y divide-fbs-border md:hidden">
              {filtered
                .slice((lowPage - 1) * LOW_PAGE_SIZE, lowPage * LOW_PAGE_SIZE)
                .map((s) => (
                  <div key={s.id} className="space-y-3 px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{s.fullName}</p>
                      <p className="truncate font-mono text-xs text-gray-400">{s.frn}</p>
                      <p className="truncate text-xs text-gray-400">
                        {s.batchName} · {s.present}/{s.total} sessions
                      </p>
                    </div>
                    <MiniBar
                      value={s.pct}
                      color={s.pct < 50 ? "#f87171" : "#facc15"}
                    />
                    <button
                      onClick={() =>
                        setAlertModal({ id: s.id, name: s.fullName })
                      }
                      className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-fbs-green px-3 py-2 text-xs font-semibold text-black">
                      <Icon d={ICONS.alert} size={11} /> Send Alert
                    </button>
                  </div>
                ))}
            </div>
            {filtered.length > LOW_PAGE_SIZE && (
              <div className="flex flex-col gap-3 border-t border-fbs-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
                <p className="text-xs text-gray-600">
                  {(lowPage - 1) * LOW_PAGE_SIZE + 1}–
                  {Math.min(lowPage * LOW_PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} students
                </p>

                <div className="flex min-w-0 flex-wrap gap-1">
                  <button
                    onClick={() => setLowPage((p) => Math.max(1, p - 1))}
                    disabled={lowPage === 1}
                    className="min-h-11 px-3 py-1 bg-fbs-dark border border-fbs-border rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 md:min-h-0">
                    ←
                  </button>

                  {Array.from(
                    { length: Math.ceil(filtered.length / LOW_PAGE_SIZE) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setLowPage(p)}
                      className={`min-h-11 min-w-11 rounded text-xs font-medium md:h-7 md:min-h-0 md:w-7 md:min-w-0 ${lowPage === p ? "bg-fbs-green text-black" : "bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white"}`}>
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setLowPage((p) =>
                        Math.min(
                          Math.ceil(filtered.length / LOW_PAGE_SIZE),
                          p + 1,
                        ),
                      )
                    }
                    disabled={
                      lowPage === Math.ceil(filtered.length / LOW_PAGE_SIZE)
                    }
                    className="min-h-11 px-3 py-1 bg-fbs-dark border border-fbs-border rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 md:min-h-0">
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {alertModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-1">
              Send Attendance Alert
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Sending alert for{" "}
              <span className="text-white">{alertModal.name}</span>
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                  From
                </label>
                <input
                  type="date"
                  value={alertFrom}
                  onChange={(e) => setAlertFrom(e.target.value)}
                  className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-fbs-green"
                />
              </div>
              <div>
                <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                  To
                </label>
                <input
                  type="date"
                  value={alertTo}
                  onChange={(e) => setAlertTo(e.target.value)}
                  className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-fbs-green"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAlertModal(null)}
                className="min-h-11 px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white">
                Cancel
              </button>
              <button
                onClick={sendAlert}
                disabled={alertSending}
                className="min-h-11 rounded-lg bg-fbs-green px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-fbs-green/90 disabled:opacity-50">
                {alertSending ? "Sending..." : "Send Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 4 — Monthly Calendar
// ═══════════════════════════════════════════════════════════════════════
function MonthlyCalendarTab() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(false);
  const [loadingS, setLoadingS] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/students")
      .then((r) => setStudents(r.data || []))
      .finally(() => setLoadingS(false));
  }, []);

  async function loadStudent(s) {
    setSelected(s);
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/attendance/student/${s.id}/records`,
      );
      setRecords(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();

  const dateMap = {};
  records.forEach((r) => {
    const d = r.sessionDate?.split("T")[0];
    if (d) dateMap[d] = r.status;
  });

  const statusStyle = {
    PRESENT: "bg-fbs-green/20 border-fbs-green/40 text-fbs-green",
    ABSENT: "bg-red-900/20 border-red-700/40 text-red-400",
    LATE: "bg-yellow-900/20 border-yellow-700/40 text-yellow-400",
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.frn?.toLowerCase().includes(search.toLowerCase()),
  );

  function changeMonth(delta) {
    const d = new Date(year, mon - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const monthName = new Date(year, mon - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden h-[500px] flex flex-col">
        <div className="p-4 border-b border-fbs-border">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">
            Students
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon d={ICONS.search} size={13} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-dark py-2 pl-8 pr-3 text-xs text-white placeholder-gray-600 outline-none focus:border-fbs-green"
            />
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto divide-y divide-fbs-border">
          {loadingS ? (
            <Spinner />
          ) : (
            filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => loadStudent(s)}
                className={`w-full min-w-0 text-left px-4 py-3 hover:bg-fbs-dark transition-colors ${selected?.id === s.id ? "bg-fbs-dark border-l-2 border-fbs-green" : ""}`}>
                <p className="truncate text-sm font-medium text-white">{s.fullName}</p>
                <p className="truncate font-mono text-xs text-gray-500">{s.frn}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!selected ? (
          <div className="bg-fbs-card border border-fbs-border rounded-2xl flex items-center justify-center py-24 text-gray-500 text-sm">
            Select a student to view calendar
          </div>
        ) : (
          <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-fbs-border px-3 py-3 md:px-5 md:py-4">
              <button
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-fbs-dark hover:text-white md:h-auto md:w-auto md:p-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <p className="min-w-0 truncate text-center text-sm font-semibold text-white">{monthName}</p>
              <button
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-fbs-dark hover:text-white md:h-auto md:w-auto md:p-1.5">
                <Icon d={ICONS.chevron} size={16} />
              </button>
            </div>

            {loading ? (
              <Spinner />
            ) : (
              <div className="min-w-0 overflow-y-auto p-3 md:p-4">
                <div className="mb-2 grid min-w-0 grid-cols-7">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div
                        key={d.slice(0, 2)}
                        className="min-w-0 py-1 text-center text-[10px] font-semibold text-gray-600">
                        {d.slice(0, 2)}
                      </div>
                    ),
                  )}
                </div>
                <div className="grid min-w-0 grid-cols-7 gap-1">
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
                        className={`flex h-9 min-w-0 flex-col items-center justify-center rounded border text-[11px] font-medium
    ${status ? statusStyle[status] : "border-fbs-border text-gray-600"}`}>
                        <span>{day}</span>
                        {status && (
                          <span className="text-[8px] leading-none">
                            {status[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-fbs-border pt-4">
                  {[
                    { label: "Present", color: "bg-fbs-green" },
                    { label: "Absent", color: "bg-red-400" },
                    { label: "Late", color: "bg-yellow-400" },
                    { label: "No Session", color: "bg-fbs-border" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                      <span className="text-xs text-gray-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN — Reports Page
// ═══════════════════════════════════════════════════════════════════════
const TABS = [
  {
    id: "batch",
    label: "Batch Summary",
    icon: ICONS.batch,
    component: BatchSummaryTab,
  },
  {
    id: "student",
    label: "Student Report",
    icon: ICONS.student,
    component: StudentReportTab,
  },
  {
    id: "low",
    label: "Low Attendance",
    icon: ICONS.alert,
    component: LowAttendanceTab,
  },
  {
    id: "calendar",
    label: "Monthly Calendar",
    icon: ICONS.calendar,
    component: MonthlyCalendarTab,
  },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("batch");
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component;

  return (
    <DashboardLayout
      pageTitle="Reports"
      pageSubtitle="Attendance analytics & insights">
      <div className="mb-6 min-w-0 overflow-x-auto">
        <div className="flex w-max min-w-full gap-1 rounded-2xl border border-fbs-border bg-fbs-card p-1.5">
        {TABS.map((t) => (
          <TabBtn
            key={t.id}
            icon={t.icon}
            label={t.label}
            active={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
          />
        ))}
        </div>
      </div>
      <div className="min-w-0">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </DashboardLayout>
  );
}
