import { useEffect, useState } from "react";
import LectureCard from "./LectureCard";
import api from "../config/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/dashboard");
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          // Unauthorized - redirect to login
          navigate("/login");
        } else {
          setError(
            err.response?.data?.message || "Failed to load dashboard data"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </main>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const syllabusProgress = dashboardData?.syllabusProgress || 0;
  const attendanceWarnings = dashboardData?.attendanceWarnings || [];
  const upcomingAssignments = dashboardData?.upcomingAssignments || [];
  const weakTopics = dashboardData?.weakTopics || [];

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold text-sky-800">Dashboard</h2>
      <p className="text-gray-600 mb-6">
        Welcome back, {user.name || "User"}!
      </p>

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow p-6 max-w-4xl">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-sky-700">
            Syllabus Progress
          </span>
          <span className="font-semibold">{syllabusProgress}%</span>
        </div>

        <div className="w-full bg-sky-100 h-3 rounded-full mb-4">
          <div
            className="bg-sky-500 h-3 rounded-full transition-all"
            style={{ width: `${syllabusProgress}%` }}
          />
        </div>

        {attendanceWarnings.length > 0 && (
          <p className="mb-2">
            Attendance Warning: <b>{attendanceWarnings.length} subject(s) below minimum</b> ⚠️
          </p>
        )}
        <p className="mb-2">
          Assignments Due: <b>{upcomingAssignments.length}</b>
        </p>
        {weakTopics.length > 0 && (
          <p>
            Weak Topics: <b>{weakTopics.join(", ")}</b>
          </p>
        )}
        {dashboardData?.subjectsCount !== undefined && (
          <p className="mt-2 text-sm text-gray-600">
            Total Subjects: <b>{dashboardData.subjectsCount}</b>
          </p>
        )}
      </div>

      {/* Upcoming Assignments */}
      {upcomingAssignments.length > 0 && (
        <section className="mt-10">
          <h3 className="text-xl font-semibold text-sky-800 mb-4">
            Upcoming Assignments
          </h3>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="space-y-3">
              {upcomingAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-sky-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(assignment.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Lectures */}
      <section className="mt-10">
        <h3 className="text-xl font-semibold text-sky-800 mb-4">
          Recommended Lectures ▶
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LectureCard
            title="Quantum Mechanics Basics"
            subject="Physics"
            duration="45 min"
          />
          <LectureCard
            title="Organic Chemistry Intro"
            subject="Chemistry"
            duration="30 min"
          />
          <LectureCard
            title="World War II Overview"
            subject="History"
            duration="50 min"
          />
        </div>
      </section>
    </main>
  );
}
