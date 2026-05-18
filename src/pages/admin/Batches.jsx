import { useEffect, useState } from "react";
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
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  end: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  close: "M18 6L6 18M6 6l12 12",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  cal: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
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
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm shadow-lg
      ${
        type === "success"
          ? "bg-fbs-card border-fbs-green/30 text-fbs-green"
          : "bg-fbs-card border-red-500/30 text-red-400"
      }`}>
      {message}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border w-fit
      ${
        active
          ? "bg-fbs-green/10 border-fbs-green/20 text-fbs-green shadow-sm"
          : "bg-red-900/10 border-red-900/20 text-red-400 shadow-sm"
      }`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-fbs-green" : "bg-red-400"}`}
      />
      {active ? "Active" : "Ended"}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Batch Modal (Create / Edit) ───────────────────────────────────────────────
function BatchModal({ batch, onClose, onSave }) {
  const isEdit = !!batch?.id;
  const [form, setForm] = useState({
    batchName: batch?.batchName || "",
    frnCode: batch?.frnCode || "",
    technology: batch?.technology || "",
    startDate: batch?.startDate || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.batchName.trim()) {
      setError("Batch name is required");
      return;
    }
    if (!form.frnCode.trim()) {
      setError("FRN code is required");
      return;
    }
    if (!form.technology.trim()) {
      setError("Technology is required");
      return;
    }
    if (!form.startDate) {
      setError("Start date is required");
      return;
    }

    const year = new Date(form.startDate).getFullYear();

    const payload = {
      batchName: form.batchName.trim(),
      frnCode: form.frnCode.trim(),
      technology: form.technology.trim(),
      startDate: form.startDate,
      year,
      active: true,
      description: "",
    };

    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/batches/${batch.id}`, payload);
      } else {
        await axiosInstance.post("/batches", payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const TECHNOLOGIES = [
    "Java",
    "Python",
    "React",
    "Angular",
    "Node.js",
    "DevOps",
    "Data Science",
    "Machine Learning",
    "Other",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white text-base font-semibold">
              {isEdit ? "Edit Batch" : "Create New Batch"}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {isEdit ? "Update batch details" : "Add a new training batch"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-all duration-200">
            <Icon d={ICONS.close} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-widest mb-2">
              Batch Name
            </label>
            <input
              type="text"
              value={form.batchName}
              onChange={(e) => set("batchName", e.target.value)}
              placeholder="Java Batch 2025"
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green focus:ring-2 focus:ring-fbs-green/40 transition-all duration-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-widest mb-2">
              FRN Code{" "}
              <span className="text-gray-500 normal-case tracking-normal font-normal">
                (e.g. 23J1224)
              </span>
            </label>
            <input
              type="text"
              value={form.frnCode}
              onChange={(e) => set("frnCode", e.target.value)}
              placeholder="23J1224"
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green focus:ring-2 focus:ring-fbs-green/40 transition-all duration-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-widest mb-2">
              Technology
            </label>
            <select
              value={form.technology}
              onChange={(e) => set("technology", e.target.value)}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-fbs-green focus:ring-2 focus:ring-fbs-green/40 transition-all duration-200 cursor-pointer">
              <option value="" disabled>
                Select technology
              </option>
              {TECHNOLOGIES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-widest mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-fbs-green focus:ring-2 focus:ring-fbs-green/40 transition-all duration-200 cursor-pointer"
            />
            {form.startDate && (
              <p className="text-gray-500 text-xs mt-1">
                Year:{" "}
                <span className="text-fbs-green font-medium">
                  {new Date(form.startDate).getFullYear()}
                </span>{" "}
                (auto-set)
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white rounded-lg text-sm transition-all duration-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold rounded-lg text-sm transition-all duration-200 disabled:opacity-50">
              {loading ? "Saving..." : isEdit ? "Update Batch" : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── End Batch Modal ───────────────────────────────────────────────────────────
function EndBatchModal({ batch, onClose, onSave }) {
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!endDate) {
      setError("Please select an end date");
      return;
    }
    if (endDate < batch.startDate) {
      setError("End date cannot be before start date");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/batches/${batch.id}`, {
        ...batch,
        endDate,
        active: false,
        year: new Date(batch.startDate).getFullYear(),
        description: batch.description || "",
      });
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to end batch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white text-base font-semibold">End Batch</h3>
            <p className="text-gray-500 text-xs mt-0.5">{batch?.batchName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-all duration-200">
            <Icon d={ICONS.close} />
          </button>
        </div>

        <div className="bg-yellow-900/10 border border-yellow-900/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-yellow-400 text-xs leading-relaxed">
            Ending this batch will mark it as inactive. Trainers will no longer
            be able to take attendance in this batch.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-widest mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              max={today}
              min={batch?.startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-fbs-green transition-all duration-200"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white rounded-lg text-sm transition-all duration-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700/40 text-red-400 font-semibold rounded-lg text-sm transition-all duration-200 disabled:opacity-50">
              {loading ? "Ending..." : "End Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [techFilter, setTechFilter] = useState("ALL");
  const [modal, setModal] = useState(null); // null | 'create' | batch object
  const [endModal, setEndModal] = useState(null); // null | batch object
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }

  async function fetchBatches() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/batches");
      setBatches(res.data || []);
    } catch {
      showToast("Failed to load batches", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBatches();
  }, []);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, techFilter]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const technologies = [
    "ALL",
    ...new Set(batches.map((b) => b.technology).filter(Boolean)),
  ];

  const filtered = batches.filter((b) => {
    const matchSearch =
      b.batchName?.toLowerCase().includes(search.toLowerCase()) ||
      b.frnCode?.toLowerCase().includes(search.toLowerCase()) ||
      b.technology?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && b.active) ||
      (statusFilter === "ENDED" && !b.active);
    const matchTech = techFilter === "ALL" || b.technology === techFilter;
    return matchSearch && matchStatus && matchTech;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginatedBatches = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const counts = {
    ALL: batches.length,
    ACTIVE: batches.filter((b) => b.active).length,
    ENDED: batches.filter((b) => !b.active).length,
  };

  function SkeletonRow() {
    return (
      <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] items-center bg-fbs-dark/40 border border-fbs-border rounded-xl px-6 py-3.5 animate-pulse">
        {/* USER */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-700" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-700 rounded" />
            <div className="h-2 w-32 bg-gray-700 rounded" />
          </div>
        </div>

        {/* ROLE */}
        <div className="h-6 w-16 bg-gray-700 rounded-full" />

        {/* STATUS */}
        <div className="h-6 w-20 bg-gray-700 rounded-full" />

        {/* JOINED */}
        <div className="h-3 w-20 bg-gray-700 rounded" />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <div className="w-8 h-8 bg-gray-700 rounded-lg" />
          <div className="w-8 h-8 bg-gray-700 rounded-lg" />
        </div>
      </div>
    );
  }
  return (
    <DashboardLayout
      pageTitle="Batches"
      pageSubtitle="Manage all training batches">
      {/* Action bar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200">
          <Icon d={ICONS.plus} size={15} />
          Create Batch
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon d={ICONS.search} size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by name, FRN or technology…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-fbs-dark/60 border border-fbs-border rounded-lg pl-10 pr-10 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:border-fbs-green focus:ring-1 focus:ring-fbs-green/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all duration-200">
              <Icon d={ICONS.close} size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-fbs-dark/60 border border-fbs-border rounded-xl p-1 backdrop-blur-sm">
          {["ALL", "ACTIVE", "ENDED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200
                ${
                  statusFilter === s
                    ? "bg-fbs-green text-gray-900 shadow-sm scale-105"
                    : "text-gray-400 hover:text-white hover:bg-fbs-card/60"
                }`}>
              {s} <span className="ml-1 opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>

        {/* Tech filter */}
        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="bg-fbs-dark/60 border border-fbs-border rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-fbs-green focus:ring-1 focus:ring-fbs-green/40 transition-all cursor-pointer">
          {technologies.map((t) => (
            <option key={t} value={t}>
              {t === "ALL" ? "All Technologies" : t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-fbs-card/80 backdrop-blur-md border border-fbs-border rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            {search ? "No batches match your search" : "No batches found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <div className="px-6 py-3 border-b border-fbs-border">
                <div className="grid grid-cols-[2.5fr_1fr_1fr_0.8fr_1.2fr_1.2fr_1fr_0.8fr] items-center text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
                  <div>Batch</div>
                  <div>FRN Code</div>
                  <div className="-ml-4">Technology</div>
                  <div className="-ml-3">Year</div>
                  <div className="-ml-5">Start Date</div>
                  <div className="-ml-5">End Date</div>
                  <div className="-ml-7">Status</div>
                  <div className="-ml-5">Actions</div>
                </div>
              </div>
              <tbody className="divide-y divide-fbs-border">
                {paginatedBatches.map((b) => (
                  <tr key={b.id}>
                    <td colSpan="8" className="px-5 py-2">
                      <div className="grid grid-cols-[2.5fr_1fr_1fr_0.8fr_1.2fr_1.2fr_1fr_0.8fr] items-center divide-x divide-fbs-border/40 bg-fbs-dark/40 border border-fbs-border rounded-xl px-6 py-3.5 hover:bg-fbs-card/60 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                        {/* BATCH */}
                        <div className="text-white font-semibold">
                          {b.batchName}
                        </div>

                        {/* FRN */}
                        <div>
                          <span className="font-mono text-xs bg-fbs-dark border border-fbs-border px-2 py-0.5 rounded text-gray-300">
                            {b.frnCode}
                          </span>
                        </div>

                        {/* TECH */}
                        <div>
                          <span className="px-3 py-1 bg-blue-900/20 border border-blue-700/30 text-blue-400 rounded-full text-[11px] font-semibold shadow-sm">
                            {b.technology}
                          </span>
                        </div>

                        {/* YEAR */}
                        <div className="text-gray-400 text-sm -ml-1">
                          {b.year}
                        </div>

                        {/* START */}
                        <div className="text-gray-400 text-sm -ml-1">
                          {formatDate(b.startDate)}
                        </div>

                        {/* END */}
                        <div className="text-gray-400 text-sm -ml-1">
                          {formatDate(b.endDate)}
                        </div>

                        {/* STATUS */}
                        <div className="-ml-1">
                          <StatusBadge active={b.active} />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end items-center gap-2 pr-2">
                          <button
                            onClick={() => setModal(b)}
                            className="p-2 rounded-lg bg-transparent hover:bg-fbs-card text-gray-400 hover:text-fbs-green hover:scale-110 active:scale-95 transition-all duration-200">
                            <Icon d={ICONS.edit} size={16} />
                          </button>

                          {b.active && (
                            <button
                              onClick={() => setEndModal(b)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/20 hover:scale-105 active:scale-95 text-xs font-semibold transition-all duration-200">
                              <Icon d={ICONS.end} size={14} />
                              End
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-fbs-border flex items-center justify-between text-xs text-gray-500">
              <div>
                Page {page} of {totalPages || 1}
              </div>

              <div className="flex items-center gap-1">
                {/* PREV */}
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-fbs-border hover:bg-fbs-card transition-all duration-200 disabled:opacity-50 disabled:bg-fbs-dark disabled:text-gray-500 disabled:cursor-not-allowed">
                  Prev
                </button>

                {/* PAGE NUMBERS */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all
          ${
            page === p
              ? "bg-fbs-green text-gray-900"
              : "border border-fbs-border text-gray-400 hover:bg-fbs-card"
          }`}>
                      {p}
                    </button>
                  ),
                )}

                {/* NEXT */}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                  className="px-3 py-1 rounded-md border border-fbs-border hover:bg-fbs-card transition-all duration-200 disabled:opacity-50 disabled:bg-fbs-dark disabled:text-gray-500 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <BatchModal
          batch={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            showToast(
              modal === "create"
                ? "Batch created successfully"
                : "Batch updated successfully",
            );
            fetchBatches();
          }}
        />
      )}

      {/* End Batch Modal */}
      {endModal && (
        <EndBatchModal
          batch={endModal}
          onClose={() => setEndModal(null)}
          onSave={() => {
            setEndModal(null);
            showToast("Batch has been ended successfully");
            fetchBatches();
          }}
        />
      )}

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}
