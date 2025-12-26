import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ProgressAnalytics = () => {
  // Syllabus completion data
  const syllabusData = [
    { name: "Completed", value: 65 },
    { name: "Remaining", value: 35 },
  ];
  const COLORS = ["#6a11cb", "#2575fc"];

  // Strong & weak topics
  const [strongTopics, setStrongTopics] = useState([
    "Physics - Unit 1",
    "Maths - Unit 4",
  ]);
  const [weakTopics, setWeakTopics] = useState([
    "Chemistry - Unit 3",
    "Biology - Unit 5",
  ]);

  // UI view mode: addition | strong | weak
  const [view, setView] = useState("addition");

  // Form data for adding topics
  const [topicForm, setTopicForm] = useState({
    category: "strong",
    subject: "",
    chapter: "",
  });

  // Handle adding a new topic
  const handleAddTopic = () => {
    if (!topicForm.subject.trim() || !topicForm.chapter.trim()) {
      alert("Please fill in both subject and topic/chapter");
      return;
    }

    const fullTopic = `${topicForm.subject.trim()} - ${topicForm.chapter.trim()}`;

    if (topicForm.category === "strong") {
      setStrongTopics([...strongTopics, fullTopic]);
    } else {
      setWeakTopics([...weakTopics, fullTopic]);
    }

    // Reset form
    setTopicForm({ category: "strong", subject: "", chapter: "" });
  };

  // Handle removing a topic
  const handleRemoveTopic = (index, type) => {
    if (type === "strong") {
      setStrongTopics(strongTopics.filter((_, i) => i !== index));
    } else {
      setWeakTopics(weakTopics.filter((_, i) => i !== index));
    }
  };

  // Study streak data with numerical scale (1-7)
  const [streakData, setStreakData] = useState([
    { day: "1", hrs: 2 },
    { day: "2", hrs: 3 },
    { day: "3", hrs: 1 },
    { day: "4", hrs: 4 },
    { day: "5", hrs: 2 },
    { day: "6", hrs: 5 },
    { day: "7", hrs: 0 },
  ]);

  const [hours, setHours] = useState("");

  // Calculate average hours with error handling
  const avgHours =
    streakData.length > 0
      ? (
          streakData.reduce((a, b) => a + (b.hrs || 0), 0) / streakData.length
        ).toFixed(1)
      : "0.0";

  // Add hours with validation
  const addHours = () => {
    const numHours = Number(hours);

    // Validate input
    if (hours === "" || isNaN(numHours) || numHours < 0 || numHours > 24) {
      alert("Please enter a valid number between 0 and 24");
      return;
    }

    // Get the last day number and calculate next day (1-7 cycle)
    const lastDay = parseInt(streakData[streakData.length - 1].day);
    const nextDay = lastDay >= 7 ? 1 : lastDay + 1;

    // Update streak data (remove oldest, add newest)
    const updated = [
      ...streakData.slice(1),
      { day: nextDay.toString(), hrs: numHours },
    ];

    setStreakData(updated);
    setHours("");
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700 text-center">
        📊 Progress Analytics
      </h1>

      {/* SYLLABUS COMPLETION */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          Syllabus Completion
        </h2>

        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={syllabusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {syllabusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-purple-600">65%</p>
            <p className="text-gray-600">Syllabus Completed</p>
          </div>
        </div>
      </div>

      {/* TOPIC ANALYSIS */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Topic Analysis
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
          <button
            onClick={() => setView("addition")}
            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
              view === "addition"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            ➕ Add Topic
          </button>
          <button
            onClick={() => setView("strong")}
            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
              view === "strong"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            💪 Strong ({strongTopics.length})
          </button>
          <button
            onClick={() => setView("weak")}
            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
              view === "weak"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            📝 Weak ({weakTopics.length})
          </button>
        </div>

        {/* Addition Form */}
        {view === "addition" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={topicForm.category}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, category: e.target.value })
                }
                className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="strong">💪 Strong Topic</option>
                <option value="weak">📝 Weak Topic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Physics, Chemistry, Maths"
                value={topicForm.subject}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, subject: e.target.value })
                }
                className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic / Chapter
              </label>
              <input
                type="text"
                placeholder="e.g., Unit 1, Thermodynamics"
                value={topicForm.chapter}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, chapter: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && handleAddTopic()}
                className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleAddTopic}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full font-semibold transition-colors shadow-md"
            >
              Add Topic
            </button>
          </div>
        )}

        {/* Strong Topics List */}
        {view === "strong" && (
          <div>
            {strongTopics.length > 0 ? (
              <ul className="space-y-2">
                {strongTopics.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200"
                  >
                    <span className="text-green-700 font-medium">✓ {item}</span>
                    <button
                      onClick={() => handleRemoveTopic(i, "strong")}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No strong topics added yet
              </p>
            )}
          </div>
        )}

        {/* Weak Topics List */}
        {view === "weak" && (
          <div>
            {weakTopics.length > 0 ? (
              <ul className="space-y-2">
                {weakTopics.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-200"
                  >
                    <span className="text-red-700 font-medium">⚠ {item}</span>
                    <button
                      onClick={() => handleRemoveTopic(i, "weak")}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No weak topics added yet
              </p>
            )}
          </div>
        )}
      </div>

      {/* STUDY STREAK */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Study Streak (Days 1-7)
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={streakData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              label={{
                value: "Day (1-7 cycle)",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              label={{ value: "Hours", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Bar dataKey="hrs" fill="#6a11cb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Hours studied today (0-24)"
              min="0"
              max="24"
              step="0.5"
              className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addHours}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md"
            >
              Add Hours
            </button>
          </div>

          <div className="flex items-center justify-between bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div>
              <p className="text-sm text-gray-600">Average Study Time</p>
              <p className="text-2xl font-bold text-purple-600">
                {avgHours} hrs/day
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total This Week</p>
              <p className="text-2xl font-bold text-purple-600">
                {streakData.reduce((a, b) => a + b.hrs, 0)} hrs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl shadow-lg text-white">
          <p className="text-sm opacity-90">Strong Topics</p>
          <p className="text-3xl font-bold">{strongTopics.length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 p-4 rounded-xl shadow-lg text-white">
          <p className="text-sm opacity-90">Weak Topics</p>
          <p className="text-3xl font-bold">{weakTopics.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-xl shadow-lg text-white">
          <p className="text-sm opacity-90">Focus Areas</p>
          <p className="text-3xl font-bold">{weakTopics.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
