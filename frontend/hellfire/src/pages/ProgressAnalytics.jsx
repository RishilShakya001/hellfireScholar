import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";
import { 
  fetchAnalytics, 
  addTopic, 
  deleteTopic,
  updateStudyHours 
} from "../services/analyticsApi";
import { toast } from "react-toastify";

const COLORS = ["#6a11cb", "#2575fc", "#ff6b6b", "#4CAF50"];

const ProgressAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    syllabusCompletion: 0,
    strongTopics: [],
    weakTopics: [],
    studyHours: 0,
    streakData: [],
    lastUpdated: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState("");

  const [topicForm, setTopicForm] = useState({
    category: "strong",
    name: "",
    subject: "",
    confidence: 5
  });
  const [openUnitsIndex, setOpenUnitsIndex] = useState(null);

  // Fetch analytics on component mount
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetchAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        toast.error("Failed to load analytics data");
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Handle topic submission
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addTopic(topicForm);
      setAnalytics(response.data);
      setTopicForm({
        category: "strong",
        name: "",
        subject: "",
        confidence: 5
      });
      toast.success("Topic added successfully");
    } catch (err) {
      console.error("Failed to add topic:", err);
      toast.error("Failed to add topic");
    }
  };

  // Handle topic deletion
  const handleDeleteTopic = async (topicId, category) => {
    if (!window.confirm(`Are you sure you want to delete this ${category} topic?`)) return;
    
    try {
      const response = await deleteTopic(category, topicId);
      setAnalytics(response.data);
      toast.success("Topic deleted successfully");
    } catch (err) {
      console.error("Failed to delete topic:", err);
      toast.error("Failed to delete topic");
    }
  };

  // Handle study hours update
  const handleAddHours = async () => {
    if (!hours || isNaN(hours) || hours <= 0) {
      toast.error("Please enter a valid number of hours");
      return;
    }

    try {
      const response = await updateStudyHours(analytics.studyHours + Number(hours));
      setAnalytics(response.data);
      setHours("");
      toast.success("Study hours updated successfully");
    } catch (err) {
      console.error("Failed to update study hours:", err);
      toast.error("Failed to update study hours");
    }
  };

  // Calculate chart data
  const getChartData = () => {
    const subjects = [...new Set([
      ...analytics.strongTopics.map(t => t.subject),
      ...analytics.weakTopics.map(t => t.subject)
    ])];

    return subjects.map(subject => {
      const strongCount = analytics.strongTopics.filter(
        t => t.subject === subject
      ).length;
      const weakCount = analytics.weakTopics.filter(
        t => t.subject === subject
      ).length;
      return { subject, strong: strongCount, weak: weakCount };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-sky-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-sky-800 mb-8">Progress Analytics</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Syllabus Completion</h3>
          <div className="text-3xl font-bold text-sky-600">
            {analytics.syllabusCompletion}%
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Study Hours</h3>
          <div className="text-3xl font-bold text-purple-600">
            {analytics.studyHours} hrs
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
          <div className="text-3xl font-bold text-green-600">
            {analytics.streakData.length} days
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Topics by Subject */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Topics by Subject</h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="strong" name="Strong Topics" fill="#6a11cb" />
                <Bar dataKey="weak" name="Weak Topics" fill="#2575fc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strong vs Weak Topics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Topics Overview</h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Strong Topics', value: analytics.strongTopics.length },
                    { name: 'Weak Topics', value: analytics.weakTopics.length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {[0, 1].map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subjects list (scrollable) */}
      <div className="bg-white p-4 rounded-lg shadow mb-8 max-h-40 overflow-auto">
        <h3 className="text-lg font-semibold mb-3">Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {(analytics.subjects && analytics.subjects.length ? analytics.subjects : [...new Set([...(analytics.strongTopics||[]).map(t=>t.subject), ...(analytics.weakTopics||[]).map(t=>t.subject)])]).map((s, i) => (
            <span key={i} className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm">
              {s.name || s}
            </span>
          ))}
        </div>
      </div>

      {/* Add Topic Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Add Topic</h3>
        <form onSubmit={handleTopicSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={topicForm.category}
                onChange={(e) => setTopicForm({...topicForm, category: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="strong">Strong Topic</option>
                <option value="weak">Weak Topic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic Name
              </label>
              <input
                type="text"
                value={topicForm.name}
                onChange={(e) => setTopicForm({...topicForm, name: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="e.g., Linear Algebra"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={topicForm.subject}
                onChange={(e) => setTopicForm({...topicForm, subject: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select subject</option>
                {((analytics.subjects && analytics.subjects.length) ? analytics.subjects : [...new Set([...(analytics.strongTopics||[]).map(t=>t.subject), ...(analytics.weakTopics||[]).map(t=>t.subject)])]).map((s, i) => (
                  <option key={i} value={s.name || s}>{s.name || s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confidence (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={topicForm.confidence}
                onChange={(e) => setTopicForm({...topicForm, confidence: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Add Topic
          </button>
        </form>
      </div>

      {/* Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strong Topics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Strong Topics</h3>
          {analytics.strongTopics.length === 0 ? (
            <p className="text-gray-500">No strong topics added yet</p>
          ) : (
            <div className="max-h-64 overflow-auto pr-2">
              <ul className="space-y-2">
                {analytics.strongTopics.map((topic, index) => (
                  <li key={index} className="relative flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="max-w-[320px] overflow-x-auto whitespace-nowrap text-ellipsis">
                        <span className="font-medium block">{topic.name}</span>
                        <span className="text-sm text-gray-500">{`(${topic.subject})`}</span>
                      </div>
                      <button
                        className="text-sm text-sky-600 hover:underline"
                        onClick={() => setOpenUnitsIndex(openUnitsIndex === index ? null : index)}
                        type="button"
                      >
                        Units ▾
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteTopic(topic._id, 'strong')}
                        className="text-red-500 hover:text-red-700"
                        title="Delete topic"
                      >
                        🗑️
                      </button>
                    </div>

                    {openUnitsIndex === index && (
                      <div className="absolute right-0 top-full z-10 mt-2 bg-white border rounded shadow max-h-40 overflow-auto p-3 w-64">
                        {(() => {
                          const s = analytics.syllabi?.find(x => x.subjectName === topic.subject) || null;
                          if (!s || !s.units || !s.units.length) return <div className="text-sm text-gray-500">No units found</div>;
                          return (
                            <ul className="space-y-2">
                              {s.units.map(u => (
                                <li key={u.id} className="text-sm">{u.title} {u.completed ? '✅' : ''}</li>
                              ))}
                            </ul>
                          )
                        })()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Weak Topics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Weak Topics</h3>
          {analytics.weakTopics.length === 0 ? (
            <p className="text-gray-500">No weak topics added yet</p>
          ) : (
            <div className="max-h-64 overflow-auto pr-2">
              <ul className="space-y-2">
                {analytics.weakTopics.map((topic, index) => (
                  <li key={index} className="relative flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="max-w-[320px] overflow-x-auto whitespace-nowrap text-ellipsis">
                        <span className="font-medium block">{topic.name}</span>
                        <span className="text-sm text-gray-500">{`(${topic.subject})`}</span>
                      </div>
                      <button
                        className="text-sm text-sky-600 hover:underline"
                        onClick={() => setOpenUnitsIndex(openUnitsIndex === index ? null : index)}
                        type="button"
                      >
                        Units ▾
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteTopic(topic._id, 'weak')}
                        className="text-red-500 hover:text-red-700"
                        title="Delete topic"
                      >
                        🗑️
                      </button>
                    </div>

                    {openUnitsIndex === index && (
                      <div className="absolute right-0 top-full z-10 mt-2 bg-white border rounded shadow max-h-40 overflow-auto p-3 w-64">
                        {(() => {
                          const s = analytics.syllabi?.find(x => x.subjectName === topic.subject) || null;
                          if (!s || !s.units || !s.units.length) return <div className="text-sm text-gray-500">No units found</div>;
                          return (
                            <ul className="space-y-2">
                              {s.units.map(u => (
                                <li key={u.id} className="text-sm">{u.title} {u.completed ? '✅' : ''}</li>
                              ))}
                            </ul>
                          )
                        })()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Study Hours Tracker */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Track Study Hours</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Enter hours studied"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleAddHours}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Hours
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Total: {analytics.studyHours} hours
        </p>
      </div>
    </div>
  );
};

export default ProgressAnalytics;