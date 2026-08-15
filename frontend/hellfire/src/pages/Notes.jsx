import React, { useEffect, useState } from "react";
import {
  getAllSubjects,
  findOrCreateSubject,
} from "../services/subjectApi";
import {
  uploadNote,
  getNotesBySubject,
  deleteNote,
  createTextNote,
} from "../services/noteApi";

const Notes = () => {
  // Backend data
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);

  // UI state
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteType, setNoteType] = useState("pdf"); // "pdf" or "text"
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    pdfFile: null,
    content: "",
  });

  /* ----------------------------------
     FETCH SUBJECTS (ON PAGE LOAD)
  -----------------------------------*/
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await getAllSubjects();
        setSubjects(res.data.data);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    };

    fetchSubjects();
  }, []);

  /* ----------------------------------
     FETCH NOTES WHEN SUBJECT CHANGES
  -----------------------------------*/
  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchNotes = async () => {
      try {
        const res = await getNotesBySubject(selectedSubjectId);
        setNotes(res.data.data);
      } catch {
        alert("Failed to fetch notes");
      }
    };

    fetchNotes();
  }, [selectedSubjectId]);

  /* ----------------------------------
     HANDLE FILE UPLOAD
  -----------------------------------*/
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }

    setFormData({ ...formData, pdfFile: file });
  };

  /* ----------------------------------
     SAVE NOTE (BACKEND CONNECTED)
  -----------------------------------*/
  const handleSaveNote = async () => {
    if (!formData.subject || !formData.title) {
      alert("Subject name and note title are required");
      return;
    }
    if (noteType === "pdf" && !formData.pdfFile) {
      alert("Please upload a PDF file");
      return;
    }
    if (noteType === "text" && !formData.content.trim()) {
      alert("Please write some content for the text note");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Find or create subject
      const subjectRes = await findOrCreateSubject(formData.subject);
      const subjectId = subjectRes.data.data._id;

      let noteRes;
      if (noteType === "pdf") {
        // 2️⃣ Upload note PDF
        const data = new FormData();
        data.append("subjectId", subjectId);
        data.append("title", formData.title);
        data.append("File", formData.pdfFile);
        noteRes = await uploadNote(data);
      } else {
        // 2️⃣ Save text note
        noteRes = await createTextNote({
          subjectId,
          title: formData.title,
          content: formData.content,
        });
      }

      // 3️⃣ Update UI
      setNotes((prev) => [noteRes.data.data, ...prev]);
      setIsAdding(false);

      setFormData({
        subject: "",
        title: "",
        pdfFile: null,
        content: "",
      });

    } catch (err) {
      alert(err.response?.data?.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     DELETE NOTE
  -----------------------------------*/
  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;

    try {
      await deleteNote(id);
      setNotes(notes.filter((n) => n._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-4">📚 My Notes</h1>

       

        {/* ADD NOTE BUTTON */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
          >
            + Add Note
          </button>
        )}

        {/* ADD NOTE FORM */}
        {isAdding && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Create Note</h2>
            
            {/* Note Type Toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
              <button
                type="button"
                onClick={() => setNoteType("pdf")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  noteType === "pdf"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                📄 Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setNoteType("text")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  noteType === "text"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                📝 Write Text Note
              </button>
            </div>

            <input
              type="text"
              placeholder="Subject name"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <input
              type="text"
              placeholder="Note title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {noteType === "pdf" ? (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload PDF Resource
                </label>

                {!formData.pdfFile ? (
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <span className="text-4xl mb-2">📄</span>
                    <span className="text-blue-600 font-semibold">
                      Click to upload PDF
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Max size: 10MB
                    </span>

                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-300">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📄</span>
                      <div>
                        <p className="font-semibold text-green-800">
                          {formData.pdfFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setFormData({ ...formData, pdfFile: null })
                      }
                      className="text-red-600 font-bold text-xl hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                placeholder="Write your study notes here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition font-sans"
              />
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveNote}
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition"
              >
                {loading ? "Saving..." : "Save Note"}
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {/* SUBJECT SELECT */}
<div className="mb-6">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    📘 Select Subject
  </label>

  <div className="relative">
    <select
      value={selectedSubjectId || ""}
      onChange={(e) => setSelectedSubjectId(e.target.value)}
      className="appearance-none w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    >
      <option value="">Choose a subject</option>
      {subjects.map((s) => (
        <option key={s._id} value={s._id}>
          {s.displayName || s.name}
        </option>
      ))}
    </select>

    {/* Custom dropdown arrow */}
    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
      ▼
    </div>
  </div>
</div>

{/* NOTES LIST */}
{notes.length === 0 ? (
  <div className="bg-white rounded-xl shadow p-10 text-center">
    <p className="text-5xl mb-4">📄</p>
    <p className="text-lg font-semibold text-gray-700">
      No notes found
    </p>
    <p className="text-sm text-gray-500 mt-1">
      Select a subject or upload your first note
    </p>
  </div>
) : (
  <div className="space-y-4">
    {notes.map((note) => {
      const isExpanded = expandedNoteId === note._id;
      const isTextNote = !!note.content;

      return (
        <div
          key={note._id}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {isTextNote ? "📝" : "📄"} {note.title}
              </h3>
              {!isTextNote ? (
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-1 text-sm"
                >
                  View PDF Resource
                </a>
              ) : (
                <button
                  onClick={() => setExpandedNoteId(isExpanded ? null : note._id)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-1 text-sm outline-none"
                >
                  {isExpanded ? "Hide Note Content" : "Show Note Content"}
                </button>
              )}
            </div>

            <button
              onClick={() => handleDeleteNote(note._id)}
              className="text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition text-sm"
            >
              🗑 Delete
            </button>
          </div>

          {isTextNote && isExpanded && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm whitespace-pre-wrap font-sans mt-2">
              {note.content}
            </div>
          )}
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
