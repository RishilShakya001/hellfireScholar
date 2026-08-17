import { useEffect, useState } from "react";

import {
  getAllSubjects,
  findOrCreateSubject,
} from "../services/subjectApi.js";

import {
  createSyllabus,
  getSyllabusBySubject,
  getUnitBySubject,
  addUnit,
  toggleUnit,
  deleteUnit,
  updateProgress,
} from "../services/syllabusApi.js";

export default function Syllabus() {
  /* ---------------- STATE ---------------- */
  const [subjects, setSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [units, setUnits] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD SUBJECTS ---------------- */
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await getAllSubjects();
      const loadedSubjects = res.data.data;
      setSubjects(loadedSubjects);

      // Auto-select first subject if none active
      if (loadedSubjects.length > 0 && !activeSubjectId) {
        setActiveSubjectId(loadedSubjects[0]._id);
        loadSyllabusData(loadedSubjects[0]._id);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    }
  };

  /* ---------------- LOAD SYLLABUS + UNITS ---------------- */
  const loadSyllabusData = async (subjectId) => {
    setLoading(true);
    try {
      // 1️⃣ Fetch or create syllabus for this subject
      let sRes;
      try {
        sRes = await getSyllabusBySubject(subjectId);
      } catch (err) {
        if (err.response?.status === 404) {
          sRes = await createSyllabus(subjectId);
        } else throw err;
      }
      setSyllabus(sRes.data.data);

      // 2️⃣ Fetch units
      const uRes = await getUnitBySubject(subjectId);
      setUnits(uRes.data.data.units);
    } catch (err) {
      console.error("Failed to load syllabus/units data:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SAVE SUBJECT ---------------- */
  const saveSubject = async () => {
    if (!newSubject.trim()) {
      alert("Subject name is required");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ subject
      const subjectRes = await findOrCreateSubject(newSubject);
      const subjectId = subjectRes.data.data._id;

      // 2️⃣ syllabus
      try {
        await getSyllabusBySubject(subjectId);
      } catch {
        await createSyllabus(subjectId);
      }

      // 3️⃣ refresh
      await loadSubjects();
      setActiveSubjectId(subjectId);
      await loadSyllabusData(subjectId);

      setNewSubject("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADD UNIT ---------------- */
  const handleAddUnit = async () => {
    if (!newUnitTitle.trim() || !syllabus) return;

    try {
      setLoading(true);
      await addUnit(syllabus._id, newUnitTitle.trim());
      setNewUnitTitle("");
      await loadSyllabusData(activeSubjectId);
    } catch (err) {
      console.error(err);
      alert("Failed to add unit");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE UNIT ---------------- */
  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm("Delete this unit?")) return;

    try {
      setLoading(true);
      await deleteUnit(unitId);
      await updateProgress(syllabus._id);
      await loadSyllabusData(activeSubjectId);
    } catch (err) {
      console.error(err);
      alert("Failed to delete unit");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- TOGGLE UNIT COMPLETION (PROGRESS MARKER) ---------------- */
  const handleToggleUnit = async (unitId) => {
    try {
      await toggleUnit(unitId);
      await updateProgress(syllabus._id);
      await loadSyllabusData(activeSubjectId);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle progress");
    }
  };

  /* ---------------- PROGRESS ---------------- */
  const calculateProgress = () => {
    if (units.length === 0) return 0;
    const completedUnits = units.filter((u) => u.completed).length;
    return Math.round((completedUnits / units.length) * 100);
  };

  const handleSubjectChange = (subjectId) => {
    setActiveSubjectId(subjectId);
    loadSyllabusData(subjectId);
  };

  /* ---------------- UI ---------------- */
  const activeSubject = subjects.find((s) => s._id === activeSubjectId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-sky-800">Syllabus Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Manage subjects, units, and mark completion progress.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition shadow-sm"
        >
          ➕ Add Subject
        </button>
      </div>

      {/* ADD SUBJECT FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-md space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Create New Subject</h3>
          <input
            type="text"
            placeholder="Enter Subject Name (e.g. Mathematics)"
            className="border border-slate-200 p-2.5 rounded-lg w-full text-sm outline-none focus:border-sky-500 transition"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={saveSubject}
              disabled={loading}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition"
            >
              {loading ? "Creating..." : "Create Subject"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN SYLLABUS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SUBJECT TABS */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">My Subjects</h3>
          {subjects.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No subjects added yet.</p>
          ) : (
            subjects.map((sub) => (
              <button
                key={sub._id}
                onClick={() => handleSubjectChange(sub._id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  activeSubjectId === sub._id
                    ? "bg-sky-50 border-sky-200 text-sky-800 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200 text-slate-600"
                }`}
              >
                <div className="font-semibold capitalize text-base">{sub.name}</div>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                  <span>Syllabus Progress</span>
                  <span className="font-bold text-sky-600">
                    {syllabus && activeSubjectId === sub._id ? calculateProgress() : 0}%
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE SYLLABUS WORKSPACE */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
          {!activeSubject ? (
            <div className="text-center py-12 text-slate-400">
              <span className="text-3xl block mb-2">📚</span>
              Select a subject from the left panel or create a new one to begin.
            </div>
          ) : (
            <>
              {/* Active Subject Heading & Progress */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeSubject.name}</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Manage Units and Track Completion Progress.</p>
                </div>
                <div className="flex items-center gap-3 bg-sky-50 text-sky-800 px-4 py-2 rounded-xl border border-sky-100 self-start md:self-auto">
                  <span className="text-sm font-semibold">Total Progress</span>
                  <span className="text-xl font-black">{calculateProgress()}%</span>
                </div>
              </div>

              {/* Progress Bar Visual */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>

              {/* Add Unit Controller */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add Unit/Chapter</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Unit 1: Introduction to Calculus"
                    className="flex-1 border border-slate-200 px-3 py-2 rounded-lg text-sm bg-white outline-none focus:border-sky-500 transition"
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddUnit(); }}
                  />
                  <button
                    onClick={handleAddUnit}
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Units Checklist Render */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Units Checklist
                </h3>
                
                {units.length === 0 ? (
                  <p className="text-slate-400 text-sm italic text-center py-6">No units added to this syllabus yet.</p>
                ) : (
                  <div className="space-y-3">
                    {units.map((unit) => (
                      <div key={unit._id} className="border border-slate-100 rounded-xl shadow-sm p-4 bg-white flex items-center justify-between gap-4">
                        {/* Progress Marker checkbox + Unit Title */}
                        <div
                          onClick={() => handleToggleUnit(unit._id)}
                          className="flex items-center gap-3 cursor-pointer select-none flex-1"
                        >
                          <span className="text-xl select-none">
                            {unit.completed ? "✅" : "⬜"}
                          </span>
                          <span className={`font-semibold text-slate-700 text-base ${unit.completed ? "line-through text-slate-400" : ""}`}>
                            {unit.title}
                          </span>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={() => handleDeleteUnit(unit._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold transition"
                        >
                          Delete Unit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
