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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sky-800">
        Assignments & Quizzes
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        {/* Table Header */}
        <div className="grid grid-cols-5 font-semibold text-sky-700 border-b pb-2 mb-3">
          <span>Subject</span>
          <span>Task</span>
          <span>Type</span>
          <span>Deadline</span>
          <span>Status</span>
        </div>

        {/* Rows */}
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
