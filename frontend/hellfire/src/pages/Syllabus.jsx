import { useState } from "react";

export default function Syllabus() {
  const [subjects, setSubjects] = useState([
    {
      subject: "Mathematics",
      units: [
        { name: "Limits & Continuity", done: true },
        { name: "Differentiation", done: true },
        { name: "Applications of Derivatives", done: false },
        { name: "Integrals", done: false },
      ],
    },
    {
      subject: "Physics",
      units: [
        { name: "Kinematics", done: true },
        { name: "Laws of Motion", done: false },
        { name: "Work & Energy", done: false },
      ],
    },
    {
      subject: "Chemistry",
      units: [
        { name: "Atomic Structure", done: true },
        { name: "Chemical Bonding", done: true },
        { name: "Thermodynamics", done: false },
      ],
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState("");

  // Toggle unit completion
  const toggleUnit = (subjectIndex, unitIndex) => {
    const updated = [...subjects];
    updated[subjectIndex].units[unitIndex].done =
      !updated[subjectIndex].units[unitIndex].done;
    setSubjects(updated);
  };

  // Progress calculation
  const calculateProgress = (units) => {
    const completed = units.filter((u) => u.done).length;
    return Math.round((completed / units.length) * 100);
  };

  // Add unit to form
  const addUnit = () => {
    if (!newUnit.trim()) return;
    setUnits([...units, { name: newUnit, done: false }]);
    setNewUnit("");
  };

  // Save subject
  const saveSubject = () => {
    if (!newSubject || units.length === 0) return;

    setSubjects([
      ...subjects,
      {
        subject: newSubject,
        units,
      },
    ]);

    setNewSubject("");
    setUnits([]);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-800">
          Syllabus Overview
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
        >
          ➕ Add Subject
        </button>
      </div>

      {/* Add Subject Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-4">
          <input
            type="text"
            placeholder="Subject Name"
            className="border p-2 rounded w-full"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />

          {/* Units */}
          <div className="space-y-2">
            {units.map((unit, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-sky-50 px-3 py-2 rounded"
              >
                <span>{unit.name}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add Unit"
              className="border p-2 rounded flex-1"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            />
            <button
              onClick={addUnit}
              className="bg-sky-500 text-white px-4 rounded hover:bg-sky-600"
            >
              Add
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveSubject}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Subject
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

      {/* Existing Subjects */}
      {subjects.map((subject, subjectIndex) => {
        const progress = calculateProgress(subject.units);

        return (
          <div
            key={subject.subject}
            className="bg-white rounded-xl shadow p-6 max-w-3xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-sky-700">
                {subject.subject}
              </h2>
              <span className="font-semibold">{progress}%</span>
            </div>

            <div className="space-y-2 mb-5">
              {subject.units.map((unit, unitIndex) => (
                <div
                  key={unit.name}
                  onClick={() =>
                    toggleUnit(subjectIndex, unitIndex)
                  }
                  className="flex items-center gap-3 cursor-pointer select-none text-gray-700"
                >
                  <span className="text-lg">
                    {unit.done ? "✅" : "⬜"}
                  </span>
                  <span>{unit.name}</span>
                </div>
              ))}
            </div>

            <div className="w-full bg-sky-100 h-3 rounded-full">
              <div
                className="bg-sky-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
