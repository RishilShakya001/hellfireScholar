import { useEffect, useState, useCallback } from "react";
import api from "../config/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pomodoro states
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState("work"); // "work" | "short" | "long"
  const [sessionCount, setSessionCount] = useState(0);
  const [loggingHours, setLoggingHours] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/dashboard");
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handlePomodoroComplete = useCallback(() => {
    if (pomodoroMode === "work") {
      setSessionCount((prev) => prev + 1);
      alert("Great job focusing! Work session complete.");
      // Automatically switch to short break
      setPomodoroMode("short");
      setPomodoroTime(5 * 60);
    } else {
      alert("Break complete! Ready to focus again?");
      setPomodoroMode("work");
      setPomodoroTime(25 * 60);
    }
  }, [pomodoroMode]);

  // Pomodoro Timer loop
  useEffect(() => {
    let interval = null;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && pomodoroActive) {
      setPomodoroActive(false);
      handlePomodoroComplete();
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime, handlePomodoroComplete]);

  const handleModeChange = (mode) => {
    setPomodoroActive(false);
    setPomodoroMode(mode);
    if (mode === "work") setPomodoroTime(25 * 60);
    else if (mode === "short") setPomodoroTime(5 * 60);
    else if (mode === "long") setPomodoroTime(15 * 60);
  };

  // Log Pomodoro focus hours to backend
  const handleLogSession = async () => {
    setLoggingHours(true);
    try {
      // 25 minutes is approx 0.42 hours
      const focusHoursToAdd = 0.42;
      const currentHours = dashboardData?.studyHours || 0;
      const newHours = parseFloat((currentHours + focusHoursToAdd).toFixed(2));

      const res = await api.patch("/analytics", { studyHours: newHours });
      if (res.status === 200) {
        alert(`Successfully logged 25 min (${focusHoursToAdd} hrs) of study time!`);
        // Refresh dashboard data to show updated hours
        const updatedDashboard = await api.get("/users/dashboard");
        if (updatedDashboard.data.success) {
          setDashboardData(updatedDashboard.data.data);
        }
      }
    } catch (err) {
      console.error("Log focus session failed:", err);
      alert("Failed to save focus time to database.");
    } finally {
      setLoggingHours(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading && !dashboardData) {
    return (
      <main className="flex-1 p-8 bg-sky-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sky-800 font-semibold">Loading dashboard data...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-8 bg-sky-50 flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-md shadow-lg text-center">
          <span className="text-4xl">⚠️</span>
          <h3 className="font-bold text-lg mt-2 mb-1">Load Failed</h3>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const syllabusProgress = dashboardData?.syllabusProgress || 0;
  const attendanceWarnings = dashboardData?.attendanceWarnings || [];
  const upcomingAssignments = dashboardData?.upcomingAssignments || [];
  const weakTopics = dashboardData?.weakTopics || [];
  const studyStreakDays = dashboardData?.studyStreakDays || 0;
  const studyHours = dashboardData?.studyHours || 0;

  return (
    <main className="flex-1 p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-sky-100">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Welcome back, {user.name || "Scholar"}!
          </h2>
          <p className="text-slate-500 mt-1">
            Keep up the excellent work. Here's your study summary for today.
          </p>
        </div>
        
        {/* Streak & Hours Badges */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Active Streak</p>
              <p className="text-lg font-bold text-amber-900">{studyStreakDays} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl">
            <span className="text-2xl">⏱</span>
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Focus Time</p>
              <p className="text-lg font-bold text-blue-900">{studyHours} Hrs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3 width on lg) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Syllabus Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-slate-500 font-medium text-sm">Syllabus Completion</span>
                <h4 className="text-3xl font-bold text-slate-800 mt-1">{syllabusProgress}%</h4>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4">
                <div
                  className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${syllabusProgress}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 mt-2">
                Across {dashboardData?.subjectsCount || 0} tracked subjects
              </span>
            </div>

            {/* Attendance Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-slate-500 font-medium text-sm">Attendance Warnings</span>
                <h4 className={`text-3xl font-bold mt-1 ${
                  attendanceWarnings.length > 0 ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {attendanceWarnings.length > 0 ? `${attendanceWarnings.length} Subject(s) ⚠️` : "All Clear! ✅"}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                {attendanceWarnings.length > 0 
                  ? "Ensure you catch up to meet minimum requirements."
                  : "All subject attendance percentages are on track."}
              </p>
            </div>
          </div>

          {/* Upcoming Assignments list */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📋 Assignments & Tasks
              </h3>
              <span className="px-2.5 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">
                {upcomingAssignments.length} Pending
              </span>
            </div>

            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-3xl mb-1">🎉</p>
                <p className="text-sm text-slate-600 font-semibold">No pending assignments</p>
                <p className="text-xs text-slate-400">You are all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {upcomingAssignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-100 transition"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {assignment.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Due: {new Date(assignment.deadline).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN (1/3 width - Pomodoro study helper widget) */}
        <div className="space-y-8">
          
          {/* Pomodoro Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white rounded-3xl shadow-xl p-6 border border-slate-800 flex flex-col items-center relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500 rounded-full filter blur-3xl opacity-10"></div>
            
            <h3 className="font-bold text-lg mb-4 text-sky-400 tracking-wide uppercase text-xs">
              ⚡ Pomodoro Study Timer
            </h3>

            {/* Timer Presets */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl gap-1 mb-6 text-xs w-full justify-between border border-slate-700/50">
              <button
                onClick={() => handleModeChange("work")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  pomodoroMode === "work" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Focus
              </button>
              <button
                onClick={() => handleModeChange("short")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  pomodoroMode === "short" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Short Break
              </button>
              <button
                onClick={() => handleModeChange("long")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  pomodoroMode === "long" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Long Break
              </button>
            </div>

            {/* Time display */}
            <div className="text-6xl font-black font-mono tracking-wider my-3 text-white drop-shadow-md select-none">
              {formatTime(pomodoroTime)}
            </div>

            {/* Control buttons */}
            <div className="flex gap-4 w-full mt-4">
              <button
                onClick={() => setPomodoroActive(!pomodoroActive)}
                className={`flex-1 py-3 rounded-xl font-bold shadow transition text-sm ${
                  pomodoroActive 
                    ? "bg-slate-700 hover:bg-slate-600 text-white" 
                    : "bg-sky-500 hover:bg-sky-400 text-slate-950 font-black shadow-sky-500/20"
                }`}
              >
                {pomodoroActive ? "PAUSE" : "START"}
              </button>
              
              <button
                onClick={() => handleModeChange(pomodoroMode)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition"
              >
                RESET
              </button>
            </div>

            {/* Session counters */}
            <div className="flex justify-between items-center w-full mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-400">
              <span>Completed Sessions: <b>{sessionCount}</b></span>
              
              {/* Log Session Action (Active after 1 session or manual trigger) */}
              <button
                onClick={handleLogSession}
                disabled={loggingHours}
                className="text-sky-400 hover:text-sky-300 font-bold outline-none disabled:opacity-50"
              >
                {loggingHours ? "Logging..." : "Log +25m Study"}
              </button>
            </div>
          </div>

          {/* Subject Strengths / Focus Card */}
          {weakTopics.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-1.5">
                🧠 Subjects Focus areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-semibold"
                  >
                    Focus: {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
