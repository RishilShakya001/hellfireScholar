import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Overview from "./pages/overview";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Syllabus from "./pages/Syllabus";
import Assignments from "./pages/Assignments";
import Planner from "./pages/Planner";
import Attendance from "./pages/Attendance";
import ProgressAnalytics from "./pages/ProgressAnalytics";
import Notes from "./pages/Notes";
import ProtectedRoute from "./components/ProtectedRoute";
import { Outlet } from "react-router-dom";

// 🚀 Dashboard Layout Component
function DashboardLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-sky-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Overview />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Pages */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="syllabus" element={<Syllabus />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="planner" element={<Planner />} />
        <Route path="progress-analytics" element={<ProgressAnalytics />} />
        <Route path="notes" element={<Notes />} />
      </Route>
    </Routes>
  );
}
