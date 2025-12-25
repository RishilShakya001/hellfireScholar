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

  // Toggle unit completion
  const toggleUnit = (subjectIndex, unitIndex) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex].units[unitIndex].done =
      !updatedSubjects[subjectIndex].units[unitIndex].done;

    setSubjects(updatedSubjects);
  };

  // Calculate progress
  const calculateProgress = (units) => {
    const completed = units.filter((u) => u.done).length;
    return Math.round((completed / units.length) * 100);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-sky-800">
        Syllabus Overview
      </h1>

      {subjects.map((subject, subjectIndex) => {
        const progress = calculateProgress(subject.units);

        return (
          <div
            key={subject.subject}
            className="bg-white rounded-xl shadow p-6 max-w-3xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-sky-700">
                {subject.subject}
              </h2>
              <span className="font-semibold">
                {progress}%
              </span>
            </div>

            {/* Units */}
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

            {/* Progress Bar */}
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
