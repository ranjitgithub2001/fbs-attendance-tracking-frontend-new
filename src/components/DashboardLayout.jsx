import { Outlet } from "react-router-dom";
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

export function DashboardLayout({ children, pageTitle, pageSubtitle }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navSections = user?.role === "ADMIN" ? ADMIN_NAV : TRAINER_NAV;

  return (
    <div className="flex bg-fbs-dark min-h-screen text-white">
      <Sidebar
        navSections={navSections}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className="flex-1 p-6 transition-all duration-300">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

export default DashboardLayout;
