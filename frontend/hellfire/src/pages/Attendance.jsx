import React, { useState } from "react";

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  const addSubject = () => {
    if (newSubject.trim() === "") return;
    setSubjects([
      ...subjects,
      { name: newSubject, present: 0, absent: 0, percentage: 0 },
    ]);
    setNewSubject("");
  };

  const markAttendance = (index, type) => {
    const updatedSubjects = [...subjects];
    if (type === "present") updatedSubjects[index].present += 1;
    else updatedSubjects[index].absent += 1;

    const total =
      updatedSubjects[index].present + updatedSubjects[index].absent;
    updatedSubjects[index].percentage =
      total === 0
        ? 0
        : ((updatedSubjects[index].present / total) * 100).toFixed(2);

    setSubjects(updatedSubjects);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        Attendance Manager
      </h1>
      <div className="flex mb-4">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter subject name"
          className="border p-2 flex-grow rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addSubject}
          className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {subjects.map((sub, index) => (
        <div
          key={index}
          className="border p-4 mb-4 rounded-lg bg-white/90 flex justify-between items-center shadow"
        >
          <div>
            <h2 className="font-semibold text-lg text-gray-800">{sub.name}</h2>
            <p
              className={`mt-1 font-medium ${
                sub.percentage < 75
                  ? "text-red-500"
                  : "text-blue-500 font-semibold"
              }`}
            >
              {sub.percentage < 75
                ? `Short Attendance: ${sub.percentage}%`
                : `Attendance: ${sub.percentage}%`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => markAttendance(index, "present")}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Present
            </button>
            <button
              onClick={() => markAttendance(index, "absent")}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Absent
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Attendance;
