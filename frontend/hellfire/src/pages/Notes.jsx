import React, { useState } from "react";

const Notes = () => {
  // Initial sample notes
  const [notes, setNotes] = useState([
    {
      id: 1,
      subject: "Physics",
      title: "Newton's Laws of Motion",
      content: "First law: An object at rest stays at rest...",
      date: "2024-12-20",
      color: "blue",
      pdfFile: null,
    },
    {
      id: 2,
      subject: "Chemistry",
      title: "Periodic Table Trends",
      content: "Atomic radius decreases across a period...",
      date: "2024-12-21",
      color: "green",
      pdfFile: null,
    },
    {
      id: 3,
      subject: "Mathematics",
      title: "Trigonometry Formulas",
      content: "sin²θ + cos²θ = 1...",
      date: "2024-12-22",
      color: "purple",
      pdfFile: null,
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    content: "",
    color: "blue",
    pdfFile: null,
  });

  // UI states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [expandedNote, setExpandedNote] = useState(null);

  // Color schemes for subjects
  const colorSchemes = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      tag: "bg-blue-100 text-blue-800",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-700",
      button: "bg-green-600 hover:bg-green-700",
      tag: "bg-green-100 text-green-800",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-300",
      text: "text-purple-700",
      button: "bg-purple-600 hover:bg-purple-700",
      tag: "bg-purple-100 text-purple-800",
    },
    pink: {
      bg: "bg-pink-50",
      border: "border-pink-300",
      text: "text-pink-700",
      button: "bg-pink-600 hover:bg-pink-700",
      tag: "bg-pink-100 text-pink-800",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-700",
      button: "bg-yellow-600 hover:bg-yellow-700",
      tag: "bg-yellow-100 text-yellow-800",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-700",
      button: "bg-orange-600 hover:bg-orange-700",
      tag: "bg-orange-100 text-orange-800",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-300",
      text: "text-indigo-700",
      button: "bg-indigo-600 hover:bg-indigo-700",
      tag: "bg-indigo-100 text-indigo-800",
    },
    gray: {
      bg: "bg-gray-50",
      border: "border-gray-300",
      text: "text-gray-700",
      button: "bg-gray-600 hover:bg-gray-700",
      tag: "bg-gray-100 text-gray-800",
    },
  };

  // Get random color for new subject
  const getRandomColor = () => {
    const colors = [
      "blue",
      "green",
      "purple",
      "pink",
      "yellow",
      "orange",
      "indigo",
      "gray",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle PDF file upload
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file only");
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert("File size should be less than 10MB");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, pdfFile: file });
    }
  };

  // Remove PDF
  const handleRemovePdf = () => {
    setFormData({ ...formData, pdfFile: null });
  };

  // Add or update note
  const handleSaveNote = () => {
    if (!formData.subject.trim()) {
      alert("Please enter a subject name");
      return;
    }
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    if (editingId) {
      // Update existing note
      setNotes(
        notes.map((note) =>
          note.id === editingId
            ? {
                ...note,
                ...formData,
                date: new Date().toISOString().split("T")[0],
              }
            : note
        )
      );
      setEditingId(null);
    } else {
      // Add new note with random color
      const newNote = {
        id: Date.now(),
        ...formData,
        color: getRandomColor(),
        date: new Date().toISOString().split("T")[0],
      };
      setNotes([newNote, ...notes]);
    }

    // Reset form
    setFormData({
      subject: "",
      title: "",
      content: "",
      color: "blue",
      pdfFile: null,
    });
    setIsAdding(false);
  };

  // Edit note
  const handleEditNote = (note) => {
    setFormData({
      subject: note.subject,
      title: note.title,
      content: note.content,
      color: note.color,
    });
    setEditingId(note.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete note
  const handleDeleteNote = (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      subject: "",
      title: "",
      content: "",
      color: "blue",
      pdfFile: null,
    });
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSubject =
      selectedSubject === "All" || note.subject === selectedSubject;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Get all unique subjects from notes
  const allSubjects = [
    "All",
    ...new Set(notes.map((note) => note.subject)),
  ].sort();

  // Get subject count
  const getSubjectCount = (subjectName) => {
    if (subjectName === "All") return notes.length;
    return notes.filter((note) => note.subject === subjectName).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            📚 My Study Notes
          </h1>
          <p className="text-gray-600">
            Organize your notes by subject and keep track of your learning
          </p>
        </div>

        {/* Add Note Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Add New Note
          </button>
        )}

        {/* Add/Edit Note Form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? "✏️ Edit Note" : "➕ Add New Note"}
            </h2>

            <div className="space-y-4">
              {/* Subject Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g., Physics, Chemistry, Mathematics"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Newton's Laws of Motion"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your notes here..."
                  rows="8"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attach PDF (Optional)
                </label>
                {!formData.pdfFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <span className="text-4xl mb-2">📄</span>
                      <span className="text-blue-600 font-semibold hover:text-blue-700">
                        Click to upload PDF
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Max size: 10MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📄</span>
                      <div>
                        <p className="font-semibold text-green-800">
                          {formData.pdfFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(formData.pdfFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePdf}
                      className="text-red-500 hover:text-red-700 font-bold text-xl"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveNote}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
                >
                  {editingId ? "Update Note" : "Save Note"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search notes..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📱 Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📋 List
              </button>
            </div>
          </div>

          {/* Subject Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            {allSubjects.map((subject) => {
              const count = getSubjectCount(subject);
              const isAll = subject === "All";

              return (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedSubject === subject
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {subject} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Display */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <p className="text-6xl mb-4">📝</p>
            <p className="text-xl text-gray-600 mb-2">No notes found</p>
            <p className="text-gray-500">
              {searchQuery
                ? "Try a different search term"
                : "Start by adding your first note!"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {filteredNotes.map((note) => {
              const colors = colorSchemes[note.color];
              const isExpanded = expandedNote === note.id;
              const contentPreview =
                note.content.length > 150 && !isExpanded
                  ? note.content.substring(0, 150) + "..."
                  : note.content;

              return (
                <div
                  key={note.id}
                  className={`${colors.bg} ${colors.border} border-2 rounded-xl shadow-md hover:shadow-lg transition-all p-5`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`${colors.tag} px-3 py-1 rounded-full text-xs font-semibold`}
                      >
                        {note.subject}
                      </span>
                      {note.pdfFile && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                          📄 PDF
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{note.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold ${colors.text} mb-2`}>
                    {note.title}
                  </h3>

                  {/* Content */}
                  <p className="text-gray-700 text-sm mb-4 whitespace-pre-wrap">
                    {contentPreview}
                  </p>

                  {/* Show More/Less */}
                  {note.content.length > 150 && (
                    <button
                      onClick={() =>
                        setExpandedNote(isExpanded ? null : note.id)
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-4"
                    >
                      {isExpanded ? "Show less ▲" : "Show more ▼"}
                    </button>
                  )}

                  {/* PDF Info */}
                  {note.pdfFile && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📄</span>
                          <div>
                            <p className="text-sm font-semibold text-red-800">
                              {note.pdfFile.name}
                            </p>
                            <p className="text-xs text-red-600">PDF attached</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-300">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
