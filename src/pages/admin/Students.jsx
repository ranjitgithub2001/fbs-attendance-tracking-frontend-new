import { useEffect, useState, useRef } from "react";
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
  trash:
    "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  close: "M18 6L6 18M6 6l12 12",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
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
          ? "bg-fbs-green/10 border-fbs-green/20 text-fbs-green"
          : "bg-red-900/10 border-red-900/20 text-red-400"
      }`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-fbs-green" : "bg-red-400"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Student Modal (Create / Edit) ─────────────────────────────────────────────
function StudentModal({ student, batches, onClose, onSave }) {
  const isEdit = !!student?.id;
  const [form, setForm] = useState({
    frn: student?.frn || "",
    fullName: student?.fullName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    guardianPhone: student?.guardianPhone || "",
    guardianName: student?.guardianName || "",
    guardianEmail: student?.guardianEmail || "",
    batchId: student?.batchId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.frn.trim()) {
      setError("FRN is required");
      return;
    }
    if (!form.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone is required");
      return;
    }
    if (!form.batchId) {
      setError("Please select a batch");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        frn: form.frn.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        guardianPhone: form.guardianPhone.trim(),
        guardianName: form.guardianName.trim(),
        guardianEmail: form.guardianEmail.trim(),
        batchId: Number(form.batchId),
      };
      if (isEdit) {
        await axiosInstance.put(`/students/${student.id}`, payload);
      } else {
        await axiosInstance.post("/students", payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 overflow-y-auto py-6">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-lg my-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white text-base font-semibold">
              {isEdit ? "Edit Student" : "Add New Student"}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {isEdit ? "Update student details" : "Register a new student"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors">
            <Icon d={ICONS.close} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Section: Student Info */}
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
            Student Info
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
                FRN
              </label>
              <input
                type="text"
                value={form.frn}
                onChange={(e) => set("frn", e.target.value)}
                placeholder="FRN-23J1224/001"
                disabled={isEdit}
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Ravi Kumar"
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="ravi@gmail.com"
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="9876543210"
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
              />
            </div>
          </div>

          {/* Batch */}
          <div className="mb-4">
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
              Batch
            </label>
            <select
              value={form.batchId}
              onChange={(e) => set("batchId", e.target.value)}
              disabled={isEdit}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-fbs-green transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="" disabled>
                Select batch
              </option>
              {batches
                .filter((b) => b.active)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchName}
                  </option>
                ))}
            </select>
            {isEdit && (
              <p className="text-gray-600 text-[10px] mt-1">
                Batch cannot be changed after enrollment
              </p>
            )}
          </div>

          {/* Section: Parent Info */}
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-3 mt-2">
            Parent / Guardian Info
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
                Parent / Guardian Name
              </label>
              <input
                type="text"
                value={form.guardianName}
                onChange={(e) => set("guardianName", e.target.value)}
                placeholder="Suresh Kumar"
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
                Parent / Guardian Phone
              </label>
              <input
                type="tel"
                value={form.guardianPhone}
                onChange={(e) => set("guardianPhone", e.target.value)}
                placeholder="9876543211"
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-1.5">
              Parent / Guardian Email
            </label>
            <input
              type="email"
              value={form.guardianEmail}
              onChange={(e) => set("guardianEmail", e.target.value)}
              placeholder="parent@gmail.com"
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Student"
                  : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Deactivate Modal ──────────────────────────────────────────────────
function ConfirmModal({ student, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white text-base font-semibold mb-1">
          Deactivate Student
        </h3>
        <p className="text-gray-400 text-sm mb-5">
          Are you sure you want to deactivate{" "}
          <span className="text-white font-medium">{student?.fullName}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700/40 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? "Deactivating..." : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modal, setModal] = useState(null);
  const [confirmStudent, setConfirmStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/students");
      setStudents(res.data || []);
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBatches() {
    try {
      const res = await axiosInstance.get("/batches");
      setBatches(res.data || []);
    } catch {
      console.error("Failed to load batches");
    }
  }

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  async function handleDeactivate() {
    if (!confirmStudent) return;
    setActionLoading(true);
    try {
      await axiosInstance.delete(`/students/${confirmStudent.id}`);
      showToast(`${confirmStudent.fullName} has been deactivated`);
      setConfirmStudent(null);
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to deactivate", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBulkUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/students/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const count = res.data?.length ?? 0;
      showToast(`${count} students uploaded successfully`);
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || "Bulk upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const matchSearch =
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.frn?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search);
    const matchBatch = batchFilter === "ALL" || s.batchName === batchFilter;
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && s.active) ||
      (statusFilter === "INACTIVE" && !s.active);
    return matchSearch && matchBatch && matchStatus;
  });

  const batchNames = [
    "ALL",
    ...new Set(students.map((s) => s.batchName).filter(Boolean)),
  ];
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const counts = {
    ALL: students.length,
    ACTIVE: students.filter((s) => s.active).length,
    INACTIVE: students.filter((s) => !s.active).length,
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [search, batchFilter, statusFilter]);

  return (
    <DashboardLayout
      pageTitle="Students"
      pageSubtitle="Manage enrolled students">
      {/* Action bar */}
      <div className="flex justify-end gap-2 mb-4">
        {/* Bulk upload */}
        <input
          type="file"
          accept=".csv"
          ref={fileRef}
          onChange={handleBulkUpload}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-fbs-card border border-fbs-border hover:border-fbs-green/40 text-gray-400 hover:text-fbs-green font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
          <Icon d={ICONS.upload} size={15} />
          {uploading ? "Uploading..." : "Bulk CSV"}
        </button>

        {/* Add student */}
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Icon d={ICONS.plus} size={15} />
          Add Student
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
            placeholder="Search by name, FRN or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-fbs-card border border-fbs-border rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors"
          />
        </div>

        {/* Batch filter */}
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="bg-fbs-card border border-fbs-border rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-fbs-green transition-colors cursor-pointer">
          {batchNames.map((b) => (
            <option key={b} value={b}>
              {b === "ALL" ? "All Batches" : b}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <div className="flex gap-1 bg-fbs-card border border-fbs-border rounded-lg p-1">
          {["ALL", "ACTIVE", "INACTIVE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
                ${statusFilter === s ? "bg-fbs-green text-gray-900" : "text-gray-400 hover:text-white"}`}>
              {s} <span className="ml-1 opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-fbs-card border border-fbs-border rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            {search ? "No students match your search" : "No students found"}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
            <div className="min-w-[1200px]">
              <table className="w-full text-sm">
                <div className="px-6 py-3 border-b border-fbs-border">
                  <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr_1.5fr_1.5fr_1fr_1fr] items-center text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
                    <div>Student</div>
                    <div>FRN</div>
                    <div>Phone</div>
                    <div>Guardian</div>
                    <div>Guardian Phone</div>
                    <div>Batch</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                </div>
                <tbody className="divide-y divide-fbs-border">
                  {paginated.map((s) => (
                    <tr key={s.id}>
                      <td colSpan="7" className="px-5 py-2">
                        <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr_1.5fr_1.5fr_1fr_1fr] items-center bg-fbs-dark/40 border border-fbs-border rounded-xl px-6 py-3.5 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                          {/* STUDENT */}
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-fbs-green/10 border border-fbs-green/20 flex items-center justify-center">
                              <span className="text-fbs-green text-xs font-bold">
                                {s.fullName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div
                                className="text-white font-semibold text-[15px] truncate max-w-[200px]"
                                title={s.fullName}>
                                {s.fullName}
                              </div>
                              <div
                                className="text-gray-500 text-xs truncate max-w-[180px]"
                                title={s.email}>
                                {s.email || "—"}
                              </div>
                            </div>
                          </div>

                          {/* FRN */}
                          <div>
                            <span className="font-mono text-xs bg-fbs-dark border border-fbs-border px-2 py-0.5 rounded text-gray-300">
                              {s.frn}
                            </span>
                          </div>

                          {/* PHONE */}
                          <div className="text-gray-400 text-sm">
                            {s.phone || "—"}
                          </div>

                          {/* GUARDIAN (Name + Email) */}
                          <div className="min-h-[36px] flex flex-col justify-center">
                            <div
                              className="text-white text-sm font-medium leading-tight truncate max-w-[160px]"
                              title={s.guardianName}>
                              {s.guardianName || "—"}
                            </div>
                            <div className="text-gray-500 text-xs leading-tight">
                              {s.guardianEmail || " "}
                            </div>
                          </div>

                          {/* GUARDIAN PHONE */}
                          <div className="text-gray-400 text-sm">
                            {s.guardianPhone || "—"}
                          </div>

                          {/* BATCH */}
                          <div>
                            <span className="px-2.5 py-0.5 bg-blue-900/20 border border-blue-700/30 text-blue-400 rounded-full text-[10px] font-semibold">
                              {s.batchName || "—"}
                            </span>
                          </div>

                          {/* STATUS */}
                          <div>
                            <StatusBadge active={s.active} />
                          </div>

                          {/* ACTIONS */}
                          <div className="flex justify-end items-center gap-2 pr-2">
                            <button
                              onClick={() => setModal(s)}
                              className="p-2 rounded-lg hover:bg-fbs-card text-gray-400 hover:text-fbs-green transition-all">
                              <Icon d={ICONS.edit} size={16} />
                            </button>

                            <button
                              onClick={() => setConfirmStudent(s)}
                              disabled={!s.active}
                              className="p-2 rounded-lg hover:bg-fbs-card text-gray-400 hover:text-red-400 transition-all disabled:opacity-30">
                              <Icon d={ICONS.trash} size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-fbs-border flex items-center justify-between">
              <p className="text-gray-600 text-xs">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} students
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-fbs-dark border border-fbs-border rounded-lg text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2 text-gray-600 text-xs">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
            ${currentPage === p ? "bg-fbs-green text-black" : "bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white"}`}>
                        {p}
                      </button>
                    ),
                  )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 bg-fbs-dark border border-fbs-border rounded-lg text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <StudentModal
          student={modal === "create" ? null : modal}
          batches={batches}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            showToast(
              modal === "create"
                ? "Student added successfully"
                : "Student updated successfully",
            );
            fetchStudents();
          }}
        />
      )}

      {confirmStudent && (
        <ConfirmModal
          student={confirmStudent}
          onClose={() => setConfirmStudent(null)}
          onConfirm={handleDeactivate}
          loading={actionLoading}
        />
      )}

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}
