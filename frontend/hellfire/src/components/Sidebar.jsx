import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "flex items-center px-3 py-2 rounded-md bg-sky-100 text-sky-700 font-semibold"
      : "flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-600";

  return (
    <aside className="w-64 min-h-screen bg-white border-r p-6">
      {/* App Title */}
      <h1 className="text-2xl font-bold text-sky-600 mb-10">
        🔥 Hellfire Scholar
      </h1>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/dashboard/syllabus" className={linkClass}>
          Syllabus
        </NavLink>

        <NavLink to="/dashboard/assignments" className={linkClass}>
          Assignments
        </NavLink>

        <NavLink to="/dashboard/planner" className={linkClass}>
          Planner
        </NavLink>
      </nav>
    </aside>
  );
}
