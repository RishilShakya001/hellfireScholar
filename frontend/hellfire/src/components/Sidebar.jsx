import { NavLink, useNavigate } from "react-router-dom";
import api from "../config/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const linkClass = ({ isActive }) =>
    isActive
      ? "flex items-center px-3 py-2 rounded-md bg-sky-100 text-sky-700 font-semibold"
      : "flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-600";

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r p-6 flex flex-col">
      {/* App Title */}
      <h1 className="text-2xl font-bold text-sky-600 mb-10">
        🔥 Hellfire Scholar
      </h1>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/dashboard/syllabus" className={linkClass}>
          Syllabus
        </NavLink>

        <NavLink to="/dashboard/notes" className={linkClass}>
          Notes
        </NavLink>
        <NavLink to="/dashboard/attendance" className={linkClass}>
          Attendance
        </NavLink>

        <NavLink to="/dashboard/assignments" className={linkClass}>
          Assignments
        </NavLink>

        <NavLink to="/dashboard/planner" className={linkClass}>
          Planner
        </NavLink>

        <NavLink to="/dashboard/progress-analytics" className={linkClass}>
          Progress Analytics
        </NavLink>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium transition"
      >
        Logout
      </button>
    </aside>
  );
}
