import { Routes, Route } from "react-router-dom";

import Overview from "./pages/overview";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Syllabus from "./pages/Syllabus";
import Assignments from "./pages/Assignments";
import Planner from "./pages/Planner";
import Attendance from "./pages/Attendance";
import ProgressAnalytics from "./pages/progressAnalytics";
import Notes from "./pages/Notes";

export default function App() {
  return (
    <Routes>
      {/* Public Overview */}
      <Route path="/" element={<Overview />} />

      {/* Dashboard Layout */}
      <Route
        path="/dashboard/*"
        element={
          <div className="min-h-screen flex bg-sky-50">
            <Sidebar />
            <main className="flex-1 p-8">
              <Routes>
                <Route path="" element={<Dashboard />} />
                <Route path="syllabus" element={<Syllabus />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="planner" element={<Planner />} />
                <Route
                  path="progress-analytics"
                  element={<ProgressAnalytics />}
                />
                <Route path="notes" element={<Notes />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
}
