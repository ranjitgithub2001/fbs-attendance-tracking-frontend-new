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
  trash:
    "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  close: "M18 6L6 18M6 6l12 12",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeoff:
    "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22",
};

// ── Small helpers ─────────────────────────────────────────────────────────────
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
      className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border text-sm shadow-lg
      ${
        type === "success"
          ? "bg-fbs-card border-fbs-green/30 text-fbs-green"
          : "bg-fbs-card border-red-500/30 text-red-400"
      }`}>
      {message}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border
      ${
        role === "ADMIN"
          ? "bg-purple-900/20 border-purple-700/30 text-purple-400"
          : "bg-fbs-green/10 border-fbs-green/20 text-fbs-green"
      }`}>
      {role}
    </span>
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

// ── User Modal (Create / Edit) ────────────────────────────────────────────────
function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "TRAINER",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!isEdit && !form.password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        ...(form.password.trim() && { password: form.password.trim() }),
      };
      if (isEdit) {
        await axiosInstance.put(`/admin/users/${user.id}`, payload);
      } else {
        await axiosInstance.post("/admin/users", payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Modal renders as a portal overlay — NO DashboardLayout here
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white text-base font-semibold">
              {isEdit ? "Edit User" : "Add New User"}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {isEdit
                ? "Update user details"
                : "Create a new admin or trainer account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-all duration-200 ease-out">
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
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="John Trainer"
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-all duration-200 ease-out"
            />
          </div>

          <div className="mb-4">
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="trainer@fbs.com"
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-all duration-200 ease-out"
            />
          </div>

          <div className="mb-4">
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
              Password{" "}
              {isEdit && (
                <span className="text-gray-500 normal-case tracking-normal font-normal">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 pr-10 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-all duration-200 ease-out"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-fbs-green transition-all duration-200 ease-out">
                <Icon d={showPw ? ICONS.eyeoff : ICONS.eye} size={15} />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
              Role
            </label>
            <div className="flex gap-3">
              {["TRAINER", "ADMIN"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set("role", r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ease-out
                    ${
                      form.role === r
                        ? "bg-fbs-green text-gray-900 border-fbs-green"
                        : "bg-fbs-dark border-fbs-border text-gray-400 hover:border-fbs-green/40"
                    }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white rounded-lg text-sm transition-all duration-200 ease-out">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold rounded-lg text-sm transition-all duration-200 ease-out disabled:opacity-50">
              {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Deactivate Modal ──────────────────────────────────────────────────
function ConfirmModal({ user, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-fbs-card border border-fbs-border rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white text-base font-semibold mb-1">
          Deactivate User
        </h3>
        <p className="text-gray-400 text-sm mb-5">
          Are you sure you want to deactivate{" "}
          <span className="text-white font-medium">{user?.username}</span>? They
          won't be able to login until reactivated.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-fbs-dark border border-fbs-border text-gray-400 hover:text-white rounded-lg text-sm transition-all duration-200 ease-out">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700/40 text-red-400 rounded-lg text-sm transition-all duration-200 ease-out disabled:opacity-50">
            {loading ? "Deactivating..." : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modal, setModal] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data || []);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleDeactivate() {
    if (!confirmUser) return;
    setActionLoading(true);
    try {
      await axiosInstance.delete(`/admin/users/${confirmUser.id}`);
      showToast(`${confirmUser.username} has been deactivated`);
      setConfirmUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to deactivate", "error");
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedUsers = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const counts = {
    ALL: users.length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    TRAINER: users.filter((u) => u.role === "TRAINER").length,
  };

  return (
    <DashboardLayout
      pageTitle="Manage Users"
      pageSubtitle="Admins and trainers with system access">
      {/* Action bar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 hover:brightness-110">
          <Icon d={ICONS.plus} size={15} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <Icon d={ICONS.search} size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-fbs-dark/60 border border-fbs-border rounded-lg pl-10 pr-10 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:border-fbs-green focus:ring-1 focus:ring-fbs-green/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all duration-200 ease-out">
              <Icon d={ICONS.close} size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-fbs-dark/60 border border-fbs-border rounded-xl p-1 backdrop-blur-sm">
          {["ALL", "ADMIN", "TRAINER"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
  ${
    roleFilter === r
      ? "bg-fbs-green text-gray-900 shadow-sm scale-105"
      : "text-gray-400 hover:text-white hover:bg-fbs-card/60"
  }`}>
              {r}{" "}
              <span className="ml-1 opacity-60 text-[10px]">({counts[r]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-fbs-card/80 backdrop-blur-md border border-fbs-border rounded-2xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm flex flex-col items-center gap-2">
            <>
              <div className="text-base text-gray-400">
                {search ? "No users match your search" : "No users found"}
              </div>
              <div className="text-xs text-gray-600">
                {search
                  ? "Try adjusting your search or filters"
                  : "Start by adding a new user"}
              </div>
            </>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <div className="px-6 py-3 border-b border-fbs-border">
                <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr] items-center text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
                  <div>User</div>
                  <div className="pl-5">Role</div>
                  <div>Status</div>
                  <div>Joined</div>
                  <div className="text-right pr-6">Actions</div>
                </div>
              </div>
              <tbody className="space-y-3">
                {paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td colSpan="6" className="px-5 py-2">
                      <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr] items-center bg-fbs-dark/40 border border-fbs-border rounded-xl px-6 py-3.5 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                        {/* LEFT SECTION */}
                        {/* USER */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-fbs-green/10 border border-fbs-green/20 flex items-center justify-center">
                            <span className="text-fbs-green text-xs font-bold">
                              {u.username?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-[15px]">
                              {u.username}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        {/* ROLE */}
                        <div className="pl-2">
                          <RoleBadge role={u.role} />
                        </div>

                        {/* STATUS */}
                        <div>
                          <StatusBadge active={u.active} />
                        </div>

                        {/* JOINED */}
                        <div className="text-gray-500 text-xs">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end items-center gap-2 pr-3">
                          <button
                            onClick={() => setModal(u)}
                            className="p-2 rounded-lg bg-transparent hover:bg-fbs-card text-gray-400 hover:text-fbs-green hover:scale-110 active:scale-95 transition-all duration-200">
                            <Icon d={ICONS.edit} size={18} />
                          </button>

                          <button
                            onClick={() => setConfirmUser(u)}
                            disabled={!u.active}
                            className="p-2 rounded-lg bg-transparent hover:bg-fbs-card text-gray-400 hover:text-red-400 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-30">
                            <Icon d={ICONS.trash} size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-fbs-border flex items-center justify-between text-xs text-gray-500">
              {/* LEFT */}
              <div>
                Page {page} of {totalPages || 1}
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-1">
                {/* PREV */}
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-fbs-border hover:bg-fbs-card disabled:opacity-30">
                  Prev
                </button>

                {/* PAGE NUMBERS */}
                {pages.map((p) => (
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
                ))}

                {/* NEXT */}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                  className="px-3 py-1 rounded-md border border-fbs-border hover:bg-fbs-card disabled:opacity-30">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals — rendered outside table but inside layout, no nested DashboardLayout */}
      {modal && (
        <UserModal
          user={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            showToast(
              modal === "create"
                ? "User created successfully"
                : "User updated successfully",
            );
            fetchUsers();
          }}
        />
      )}

      {confirmUser && (
        <ConfirmModal
          user={confirmUser}
          onClose={() => setConfirmUser(null)}
          onConfirm={handleDeactivate}
          loading={actionLoading}
        />
      )}

      <Toast message={toast.msg} type={toast.type} />
    </DashboardLayout>
  );
}
