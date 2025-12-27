import { useState } from "react";

export default function Planner() {
  const [plan, setPlan] = useState([
    { day: "Day 1", task: "Math – Unit 3 + PYQs", highlight: true },
    { day: "Day 2", task: "Physics – Electrostatics", highlight: false },
    { day: "Day 3", task: "CS – DBMS", highlight: false },
    { day: "Day 4", task: "Math – Integrals", highlight: false },
    { day: "Day 5", task: "Chemistry – Thermodynamics", highlight: false },
    { day: "Day 6", task: "Physics – Current Electricity", highlight: false },
    { day: "Day 7", task: "Weekly Revision + Test", highlight: true },
    { day: "Day 8", task: "Math – Differential Equations", highlight: false },
    { day: "Day 9", task: "CS – OS Basics", highlight: false },
    { day: "Day 10", task: "Chemistry – Electrochemistry", highlight: false },
    { day: "Day 11", task: "Physics – Magnetism", highlight: false },
    { day: "Day 12", task: "Math – Probability", highlight: false },
    { day: "Day 13", task: "Full Syllabus Revision", highlight: true },
    { day: "Day 14", task: "Mock Test + Analysis", highlight: true },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newPlan, setNewPlan] = useState({
    day: "",
    task: "",
    highlight: false,
  });

  const addPlan = () => {
    if (!newPlan.day || !newPlan.task) return;

    setPlan([...plan, newPlan]);
    setNewPlan({ day: "", task: "", highlight: false });
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Title + Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-800">
          2-Week Smart Study Planner
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
        >
          ➕ Add Plan
        </button>
      </div>

      {/* Add Plan Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 max-w-4xl space-y-4">
          <input
            type="text"
            placeholder="Day (e.g. Day 15)"
            className="border p-2 rounded w-full"
            value={newPlan.day}
            onChange={(e) =>
              setNewPlan({ ...newPlan, day: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Task Description"
            className="border p-2 rounded w-full"
            value={newPlan.task}
            onChange={(e) =>
              setNewPlan({ ...newPlan, task: e.target.value })
            }
          />

          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={newPlan.highlight}
              onChange={(e) =>
                setNewPlan({
                  ...newPlan,
                  highlight: e.target.checked,
                })
              }
            />
            Mark as Important ⭐
          </label>

          <div className="flex gap-3">
            <button
              onClick={addPlan}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Plan
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Planner Card */}
      <div className="bg-white rounded-xl shadow p-6 max-w-4xl">
        <div className="border-b pb-3 mb-4">
          <p className="text-gray-600">
            Stay consistent. Small progress every day adds up 🚀
          </p>
        </div>

        {/* Plan List */}
        <div className="space-y-3">
          {plan.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border transition ${
                item.highlight
                  ? "bg-sky-50 border-sky-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-sky-700">
                  {item.day}
                </span>
                <span className="text-gray-700">
                  {item.task}
                </span>
              </div>

              {item.highlight && (
                <span className="text-sm font-semibold text-sky-600">
                  ⭐ Important
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
