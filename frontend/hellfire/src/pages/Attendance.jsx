import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  getAllSubjects,
  findOrCreateSubject,
} from "../services/subjectApi";

import {
  getAttendanceBySubject,
  createOrUpdateAttendance,
} from "../services/attendanceApi";

export default function Attendance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [newSubject, setNewSubject] = useState("");
  const [attendance, setAttendance] = useState(null);

  const [calendarDate, setCalendarDate] = useState(new Date());

  const loadSubjects = async () => {
    const res = await getAllSubjects();
    setSubjects(res.data.data);
  };

  /* ---------------- LOAD SUBJECTS ---------------- */
  useEffect(() => {
    loadSubjects();
  }, []);

  /* ---------------- LOAD ATTENDANCE ---------------- */
  const loadAttendance = async (subjectId) => {
    try {
      const res = await getAttendanceBySubject(subjectId);
      setAttendance(res.data.data);
    } catch {
      setAttendance(null);
    }
  };

  /* ---------------- ADD SUBJECT ---------------- */
  const addSubject = async () => {
    if (!newSubject.trim()) return;

    const res = await findOrCreateSubject(newSubject);
    setSubjects([...subjects, res.data.data]);
    setNewSubject("");
  };

  /* ---------------- MARK ATTENDANCE ---------------- */
  const markAttendance = async (type) => {
    if (!selectedSubject) return;

    const attended =
      attendance?.attended || 0;
    const total =
      attendance?.total || 0;

    const newAttended =
      type === "present" ? attended + 1 : attended;

    const newTotal = total + 1;

    const res = await createOrUpdateAttendance(
      selectedSubject._id,
      {
        attended: newAttended,
        total: newTotal,
      }
    );

    setAttendance(res.data.data);
  };

  /* ---------------- MONTHLY STATS ---------------- */
  const monthName = calendarDate.toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg space-y-6">

      <h1 className="text-3xl font-bold text-blue-700">
        📅 Attendance Manager
      </h1>

      {/* ADD SUBJECT */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter subject name"
          className="border p-2 flex-grow rounded"
        />
        <button
          onClick={addSubject}
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {/* SUBJECT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub._id}
            onClick={() => {
              setSelectedSubject(sub);
              loadAttendance(sub._id);
            }}
            className={`p-4 rounded cursor-pointer shadow
              ${
                selectedSubject?._id === sub._id
                  ? "bg-blue-100 border-2 border-blue-500"
                  : "bg-white"
              }`}
          >
            <h2 className="font-semibold text-lg">
              {sub.name}
            </h2>
          </div>
        ))}
      </div>

      {/* ATTENDANCE CARD */}
      {selectedSubject && attendance && (
        <div className="bg-white p-6 rounded-xl shadow space-y-6">

          <h2 className="text-xl font-bold text-gray-800">
            {selectedSubject.name}
          </h2>

          {/* STATS */}
          <div className="flex justify-between text-lg font-semibold">
            <span>
              Attendance:{" "}
              <span
                className={
                  attendance.percentage < attendance.minRequired
                    ? "text-red-500"
                    : "text-green-600"
                }
              >
                {attendance.percentage}%
              </span>
            </span>
            <span>
              {attendance.attended}/{attendance.total}
            </span>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={() => markAttendance("present")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Present
            </button>
            <button
              onClick={() => markAttendance("absent")}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Absent
            </button>
          </div>

          {/* CALENDAR */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <h3 className="font-semibold mb-2">
                📆 {monthName} Calendar
              </h3>
              <Calendar
                value={calendarDate}
                onChange={setCalendarDate}
              />
            </div>

            {/* MONTHLY STATS */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-blue-700">
                📊 Monthly Summary
              </h3>

              <p>Total Classes: {attendance.total}</p>
              <p>Present: {attendance.attended}</p>
              <p>Absent: {attendance.total - attendance.attended}</p>

              <p
                className={`font-semibold ${
                  attendance.percentage < attendance.minRequired
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                Status:{" "}
                {attendance.percentage < attendance.minRequired
                  ? "Short Attendance"
                  : "Safe"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
