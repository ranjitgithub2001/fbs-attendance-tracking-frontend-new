import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterRequest from "./pages/RegisterRequest";
import ForgotPassword from "./pages/ForgotPassword";

// Route guards
import PublicRoute from "./components/PublicRoute";
import RoleRoute from "./components/RoleRoute";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import Batches from "./pages/admin/Batches";
import Students from "./pages/admin/Students";
import TrainerRequests from "./pages/admin/TrainerRequests";
import Reports from "./pages/admin/Reports";
import AbsenceAlerts from "./pages/admin/AbsenceAlerts";

// Trainer pages
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import MyBatches from "./pages/trainer/MyBatches";
import MarkAttendance from "./pages/trainer/MarkAttendance";
import TrainerConcerns from "./pages/trainer/TrainerConcerns";
import TrainerHolidayRequest from "./pages/trainer/TrainerHolidayRequest";

// Student pages
import StudentLogin from "./pages/student/StudentLogin";
import StudentPortal from "./pages/student/StudentPortal";
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "TRAINER")
    return <Navigate to="/trainer/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/register-request" element={<RegisterRequest />} />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      {/* ── Admin routes ── */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute role="ADMIN">
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleRoute role="ADMIN">
            <ManageUsers />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/batches"
        element={
          <RoleRoute role="ADMIN">
            <Batches />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <RoleRoute role="ADMIN">
            <Students />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/trainer-requests"
        element={
          <RoleRoute role="ADMIN">
            <TrainerRequests />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <RoleRoute role="ADMIN">
            <Reports />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/absence-alerts"
        element={
          <RoleRoute role="ADMIN">
            <AbsenceAlerts />
          </RoleRoute>
        }
      />
      {/* ── Trainer routes ── */}
      <Route
        path="/trainer/dashboard"
        element={
          <RoleRoute role="TRAINER">
            <TrainerDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/trainer/my-batches"
        element={
          <RoleRoute role="TRAINER">
            <MyBatches />
          </RoleRoute>
        }
      />
      <Route
        path="/trainer/attendance"
        element={
          <RoleRoute role="TRAINER">
            <MarkAttendance />
          </RoleRoute>
        }
      />
      <Route
        path="/trainer/reports"
        element={
          <RoleRoute role="TRAINER">
            <Reports />
          </RoleRoute>
        }
      />
      <Route
        path="/trainer/concerns"
        element={
          <RoleRoute role="TRAINER">
            <TrainerConcerns />
          </RoleRoute>
        }
      />
      <Route
        path="/trainer/holiday-request"
        element={
          <RoleRoute role="TRAINER">
            <TrainerHolidayRequest />
          </RoleRoute>
        }
      />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/portal" element={<StudentPortal />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
