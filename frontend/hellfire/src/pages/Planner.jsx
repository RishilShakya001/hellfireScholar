import { useEffect, useState } from "react";
import api from "../config/api";
import { fetchStudyPlanProgress } from "../services/analyticsApi";

export default function Planner() {
  const [plan, setPlan] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [serverProgress, setServerProgress] = useState(null);

  const [newPlan, setNewPlan] = useState({
    day: "",
    task: "",
    highlight: false,
  });

  /* ---------------- LOAD PLAN ON PAGE LOAD ---------------- */
  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    try {
      const res = await api.get("/studyplan/getstudyp");
      setPlan(
        res.data.data.days.map((d) => ({
          id: d._id,
          day: `Day ${d.day}`,
          task: `${d.subject} – ${d.topic}`,
          highlight: d.highlight || false,
          completed: d.completed || false,
        }))
      );

      // fetch authoritative server progress
      try {
        const p = await fetchStudyPlanProgress();
        setServerProgress(p.data.data || p.data);
      } catch (pe) {
        // ignore if progress endpoint not available
      }
    } catch (err) {
      // if study plan doesn't exist, create + generate
      if (err.response?.status === 404) {
        await api.post("/studyplan/create", { durationDays: 14 });
        await api.post("/studyplan/generate");
        loadStudyPlan();
      }
    }
  };

  /* ---------------- ADD / EDIT PLAN (PERSISTED) ---------------- */
  const addPlan = async () => {
    if (!newPlan.day || !newPlan.task) return;

    // Editing existing day
    if (editIndex !== null) {
      const id = plan[editIndex]?.id;
      if (!id) return;
      try {
        await api.patch(`/studyplan/day/${id}`, {
          day: newPlan.day,
          task: newPlan.task,
          highlight: newPlan.highlight,
        });
        await loadStudyPlan();
        setNewPlan({ day: "", task: "", highlight: false });
        setEditIndex(null);
        setShowForm(false);
      } catch (err) {
        console.error(err);
      }

      return;
    }

    // Create new day
    try {
      await api.post("/studyplan/day", {
        day: newPlan.day,
        task: newPlan.task,
        highlight: newPlan.highlight,
      });

      await loadStudyPlan();
      setNewPlan({ day: "", task: "", highlight: false });
      setShowForm(false);
    } catch (err) {
      // If study plan missing, create + generate then retry
      if (err.response?.status === 404) {
        try {
          await api.post("/studyplan/create", { durationDays: 14 });
          await api.post("/studyplan/generate");
          await api.post("/studyplan/day", {
            day: newPlan.day,
            task: newPlan.task,
            highlight: newPlan.highlight,
          });
          await loadStudyPlan();
          setNewPlan({ day: "", task: "", highlight: false });
          setShowForm(false);
        } catch (e) {
          console.error(e);
        }
      } else {
        console.error(err);
      }
    }
  };

  const toggleComplete = async (index) => {
    const item = plan[index];
    if (!item?.id) return;
    try {
      await api.patch(`/studyplan/day/${item.id}`, { completed: !item.completed });
      await loadStudyPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlan = async (index) => {
    const item = plan[index];
    if (!item?.id) return;
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await api.delete(`/studyplan/day/${item.id}`);
      await loadStudyPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const editPlan = (index) => {
    setNewPlan({
      day: plan[index].day,
      task: plan[index].task,
      highlight: plan[index].highlight,
    });
    setEditIndex(index);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setNewPlan({ day: "", task: "", highlight: false });
    setEditIndex(null);
    setShowForm(false);
  };

  const completedCount = plan.filter((item) => item.completed).length;
  const totalCount = plan.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const displayedPercentage = serverProgress?.percentage ?? progressPercentage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Title + Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              2-Week Smart Study Planner
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              📚 {completedCount} of {totalCount} tasks completed (
              {progressPercentage.toFixed(0)}%)
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
          >
            ➕ Add Plan
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
            <span className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Overall Progress
            </span>
            <span className="text-purple-600 text-lg">
              {displayedPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${displayedPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Add/Edit Plan Form */}
        {showForm && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-200 space-y-5 animate-in">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {editIndex !== null ? "✏️ Edit Plan" : "➕ Add New Plan"}
            </h3>

            <input
              type="text"
              placeholder="Day (e.g. Day 15)"
              className="border-2 border-gray-200 p-3 rounded-xl w-full focus:border-purple-500 focus:outline-none transition-colors"
              value={newPlan.day}
              onChange={(e) => setNewPlan({ ...newPlan, day: e.target.value })}
            />

            <input
              type="text"
              placeholder="Task Description"
              className="border-2 border-gray-200 p-3 rounded-xl w-full focus:border-purple-500 focus:outline-none transition-colors"
              value={newPlan.task}
              onChange={(e) => setNewPlan({ ...newPlan, task: e.target.value })}
            />

            <label className="flex items-center gap-3 text-gray-700 bg-amber-50 p-4 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors border border-amber-200">
              <input
                type="checkbox"
                className="w-5 h-5 accent-purple-600 cursor-pointer"
                checked={newPlan.highlight}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    highlight: e.target.checked,
                  })
                }
              />
              <span className="font-semibold">Mark as Important ⭐</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={addPlan}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex-1"
              >
                {editIndex !== null ? "💾 Update Plan" : "💾 Save Plan"}
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-200 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Planner Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
          <div className="border-b-2 border-gradient pb-4 mb-6">
            <p className="text-gray-700 text-lg flex items-center gap-2 font-medium">
              <span className="text-2xl">🚀</span>
              Stay consistent. Small progress every day adds up!
            </p>
          </div>

          {/* Plan List */}
          <div className="space-y-3">
            {plan.map((item, index) => (
              <div
                key={index}
                className={`group flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                  item.completed
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                    : item.highlight
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border-purple-300"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(index)}
                    className="w-5 h-5 cursor-pointer accent-purple-600"
                  />
                  <span
                    className={`font-bold text-lg px-3 py-1 rounded-lg ${
                      item.completed
                        ? "bg-green-100 text-green-700 line-through"
                        : item.highlight
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.day}
                  </span>
                  <span
                    className={`text-gray-800 font-medium ${
                      item.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {item.task}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {item.highlight && !item.completed && (
                    <span className="text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full">
                      ⭐ Important
                    </span>
                  )}
                  {item.completed && (
                    <span className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full">
                      ✓ Done
                    </span>
                  )}
                  <button
                    onClick={() => editPlan(index)}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deletePlan(index)}
                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
