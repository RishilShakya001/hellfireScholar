import { useState } from "react";

export default function Assignments() {
  const [tasks, setTasks] = useState([
    {
      subject: "Mathematics",
      title: "HW 4",
      type: "Assignment",
      deadline: "Oct 10",
      status: "Pending",
    },
    {
      subject: "Physics",
      title: "Quiz 2",
      type: "Quiz",
      deadline: "Oct 12",
      status: "Done",
    },
    {
      subject: "Computer Science",
      title: "Lab Work",
      type: "Assignment",
      deadline: "Oct 14",
      status: "Missing",
    },
    {
      subject: "Mathematics",
      title: "Quiz 3",
      type: "Quiz",
      deadline: "Oct 16",
      status: "Pending",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newTask, setNewTask] = useState({
    subject: "",
    title: "",
    type: "Assignment",
    deadline: "",
    status: "Pending",
  });

  const toggleStatus = (index) => {
    const updated = [...tasks];
    if (updated[index].status === "Pending") {
      updated[index].status = "Done";
    } else if (updated[index].status === "Done") {
      updated[index].status = "Missing";
    } else {
      updated[index].status = "Pending";
    }
    setTasks(updated);
  };

  const statusStyle = (status) => {
    switch (status) {
      case "Done":
        return "text-green-600";
      case "Missing":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "Done":
        return "✅";
      case "Missing":
        return "❌";
      default:
        return "⏳";
    }
  };

  const handleAddTask = () => {
    if (!newTask.subject || !newTask.title || !newTask.deadline) return;

    setTasks([...tasks, newTask]);
    setNewTask({
      subject: "",
      title: "",
      type: "Assignment",
      deadline: "",
      status: "Pending",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-800">
          Assignments & Quizzes
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition"
        >
          ➕ Add Assignment
        </button>
      </div>

      {/* Add Assignment Form */}
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
              <option>Assignment</option>
              <option>Quiz</option>
            </select>

            <input
              type="date"
              className="border p-2 rounded"
              value={newTask.deadline}
              onChange={(e) =>
                setNewTask({ ...newTask, deadline: e.target.value })
              }
            />

            <select
              className="border p-2 rounded col-span-2"
              value={newTask.status}
              onChange={(e) =>
                setNewTask({ ...newTask, status: e.target.value })
              }
            >
              <option>Pending</option>
              <option>Done</option>
              <option>Missing</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddTask}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-5 font-semibold text-sky-700 border-b pb-2 mb-3">
          <span>Subject</span>
          <span>Task</span>
          <span>Type</span>
          <span>Deadline</span>
          <span>Status</span>
        </div>

        {tasks.map((task, index) => (
          <div
            key={index}
            onClick={() => toggleStatus(index)}
            className="grid grid-cols-5 items-center py-3 border-b last:border-b-0 cursor-pointer hover:bg-sky-50 transition"
          >
            <span>{task.subject}</span>
            <span className="font-medium">{task.title}</span>
            <span className="text-gray-600">{task.type}</span>
            <span>{task.deadline}</span>

            <span
              className={`flex items-center gap-2 font-semibold ${statusStyle(
                task.status
              )}`}
            >
              {statusIcon(task.status)} {task.status}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        💡 Tip: Click on any task to change its status
      </p>
    </div>
  );
}
