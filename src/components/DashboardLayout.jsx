import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  Layers,
  CalendarCheck,
  FileText,
  MessageCircle,
} from "lucide-react";

const ADMIN_NAV = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", path: "/admin/users", icon: Users },
      { label: "Batches", path: "/admin/batches", icon: Layers },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Students", path: "/admin/students", icon: GraduationCap },
      {
        label: "Trainer Requests",
        path: "/admin/trainer-requests",
        icon: ClipboardList,
      },
      {
        label: "Absence Alerts",
        path: "/admin/absence-alerts",
        icon: AlertTriangle,
      },
      { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    ],
  },
];

const TRAINER_NAV = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
      { label: "My Batches", path: "/trainer/my-batches", icon: BookOpen },
      {
        label: "Mark Attendance",
        path: "/trainer/attendance",
        icon: CalendarCheck,
      },
      { label: "Reports", path: "/trainer/reports", icon: FileText },
      { label: "Concerns", path: "/trainer/concerns", icon: MessageCircle },
      {
        label: "Holiday Request",
        path: "/trainer/holiday-request",
        icon: CalendarCheck,
      },
    ],
  },
];

export function DashboardLayout({ children, pageTitle }) {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState({
    path: location.pathname,
    open: false,
  });
  if (location.pathname !== mobileNav.path) {
    setMobileNav({ path: location.pathname, open: false });
  }
  const mobileOpen = mobileNav.open;
  const setMobileOpen = (open) =>
    setMobileNav((prev) => ({ ...prev, open }));
  const navSections = user?.role === "ADMIN" ? ADMIN_NAV : TRAINER_NAV;

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "FB";

  return (
    <div className="flex w-full max-w-full min-h-screen bg-fbs-dark text-white overflow-x-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        navSections={navSections}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 w-full flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-fbs-border bg-fbs-darker px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fbs-card hover:bg-fbs-border">
            <span className="text-lg">☰</span>
          </button>
          {pageTitle ? (
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
              {pageTitle}
            </h1>
          ) : (
            <span className="min-w-0 flex-1" />
          )}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fbs-card text-xs font-semibold"
            title={user?.fullName ?? "FirstBit User"}>
            {initials}
          </div>
        </header>

        <main className="min-w-0 w-full flex-1 p-4 md:p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
