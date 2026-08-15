import { useEffect, useState } from "react";
import {
  createAssignment,
  getAssignmentsBySubject,
  updateAssignmentStatus,
  deleteAssignment,
} from "../services/assignmentApi";
import { getAllSubjects, findOrCreateSubject } from "../services/subjectApi";

export default function Assignments() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [newTask, setNewTask] = useState({
    subject: "",
    title: "",
    type: "assignment",
    deadline: "",
    status: "pending",
  });

  const loadSubjects = async () => {
    const res = await getAllSubjects();
    setSubjects(res.data.data);
  };

  const loadAssignments = async (subjectId) => {
    const res = await getAssignmentsBySubject(subjectId);
    setTasks(res.data.data);
  };

  /* ---------- LOAD SUBJECTS ---------- */
  useEffect(() => {
    loadSubjects();
  }, []);

  /* ---------- SET DEFAULT ACTIVE SUBJECT ---------- */
  useEffect(() => {
    if (subjects.length > 0) {
      setActiveSubjectId(subjects[0]._id);
    }
  }, [subjects]);

  /* ---------- LOAD ASSIGNMENTS WHEN SUBJECT CHANGES ---------- */
  useEffect(() => {
    if (activeSubjectId) {
      loadAssignments(activeSubjectId);
    }
  }, [activeSubjectId]);

  /* ---------- ADD ASSIGNMENT ---------- */
  const handleAddTask = async () => {
    const { subject, title, deadline, type } = newTask;
    if (!subject || !title || !deadline) return;

    // find or create subject
    const subjectRes = await findOrCreateSubject(subject);
    const subjectId = subjectRes.data.data._id;

    // create assignment
    await createAssignment({
      subjectId,
      title,
      type,
      deadline,
    });

    // refresh
    setActiveSubjectId(subjectId);
    setShowForm(false);
    setNewTask({
      subject: "",
      title: "",
      type: "assignment",
      deadline: "",
      status: "pending",
    });
  };

  /* ---------- TOGGLE STATUS ---------- */
  const toggleStatus = async (task) => {
  let nextStatus;

  switch (task.status) {
    case "pending":
      nextStatus = "done";
      break;
    case "done":
      nextStatus = "missing";
      break;
    default:
      nextStatus = "pending";
  }

  await updateAssignmentStatus(task._id, nextStatus);
  await loadAssignments(activeSubjectId);
};

  /* ---------- DELETE ---------- */
  const removeTask = async (id) => {
    if (!window.confirm("Delete assignment?")) return;
    await deleteAssignment(id);
    await loadAssignments(activeSubjectId);
  };

  /* ---------- UI HELPERS ---------- */
  const statusStyle = (status) =>
    status === "done"
      ? "text-green-600"
      : status === "missing"
      ? "text-red-500"
      : "text-yellow-500";

  const statusIcon = (status) =>
    status === "done" ? "✅" : status === "missing" ? "❌" : "⏳";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-800">
          Assignments & Quizzes
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg"
        >
          ➕ Add Assignment
        </button>
      </div>


{/* SUBJECT FILTER DROPDOWN */}
<div className="max-w-xs">
  <label className="block mb-1 font-semibold text-gray-700">
    Filter by Subject
  </label>
  <select
    value={activeSubjectId || ""}
    onChange={(e) => setActiveSubjectId(e.target.value)}
    className="w-full border p-2 rounded focus:ring-2 focus:ring-sky-500"
  >
    <option value="">Select Subject</option>
    {subjects.map((sub) => (
      <option key={sub._id} value={sub._id}>
        {sub.name}
      </option>
    ))}
  </select>
</div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Subject"
              className="border p-2 rounded"
              value={newTask.subject}
              onChange={(e) =>
                setNewTask({ ...newTask, subject: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Title"
              className="border p-2 rounded"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <select
              className="border p-2 rounded"
              value={newTask.type}
              onChange={(e) =>
                setNewTask({ ...newTask, type: e.target.value })
              }
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="lab">Lab</option>
            </select>

            <input
              type="date"
              className="border p-2 rounded"
              value={newTask.deadline}
              onChange={(e) =>
                setNewTask({ ...newTask, deadline: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddTask}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-5 font-semibold border-b pb-2 mb-3">
          <span>Subject</span>
          <span>Task</span>
          <span>Type</span>
          <span>Deadline</span>
          <span>Status</span>
        </div>

        {tasks.map((task) => (
          <div
            key={task._id}
            className="grid grid-cols-5 py-3 border-b items-center"
          >
            <span>{task.subjectId?.name}</span>
            <span>{task.title}</span>
            <span>{task.type}</span>
            <span>{task.deadline.slice(0, 10)}</span>

            <span
              onClick={() => toggleStatus(task)}
              className={`cursor-pointer flex items-center gap-2 ${statusStyle(
                task.status
              )}`}
            >
              {statusIcon(task.status)} {task.status}

              <button
  onClick={(e) => {
    e.stopPropagation();
    removeTask(task._id);
  }}
  className="ml-3 p-1.5 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition"
  title="Delete assignment"
>
  Delete
</button>

            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
