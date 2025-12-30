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
  const [syllabus, setSyllabus] = useState(null);
  const [units, setUnits] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD SUBJECTS ---------------- */
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const res = await getAllSubjects();
    console.log(res)
    setSubjects(res.data.data);
  };

  /* ---------------- LOAD SYLLABUS + UNITS ---------------- */
  const loadSyllabusData = async (subjectId) => {
    setLoading(true);
    try {
      // syllabus
      let sRes;
      try {
        sRes = await getSyllabusBySubject(subjectId);
      } catch (err) {
        if (err.response?.status === 404) {
          sRes = await createSyllabus(subjectId);
        } else throw err;
      }

      setSyllabus(sRes.data.data);

      // units (IMPORTANT FIX)
      const uRes = await getUnitBySubject(subjectId);
      setUnits(uRes.data.data.units);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SAVE SUBJECT + UNIT ---------------- */
  const saveSubject = async () => {
    if (!newSubject.trim() || !newUnit.trim()) {
      alert("Subject and unit both required");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ subject
      const subjectRes = await findOrCreateSubject(newSubject);
      console.log(subjectRes)
      const subjectId = subjectRes.data.data._id;

      // 2️⃣ syllabus
      let sRes;
      try {
        sRes = await getSyllabusBySubject(subjectId);
      } catch {
        sRes = await createSyllabus(subjectId);
      }

      // 3️⃣ add unit
      await addUnit(sRes.data.data._id, newUnit);

      // 4️⃣ refresh
      await loadSubjects();
      await loadSyllabusData(subjectId);

      setNewSubject("");
      setNewUnit("");
      setShowForm(false);
    } catch {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- TOGGLE UNIT ---------------- */
  const toggleUnitUI = async (unitId) => {
    await toggleUnit(unitId);
    await updateProgress(syllabus._id);
    await loadSyllabusData(syllabus.subjectId._id);
  };

  /* ---------------- DELETE UNIT ---------------- */
  const deleteUnitUI = async (unitId) => {
    if (!window.confirm("Delete unit?")) return;

    await deleteUnit(unitId);
    await updateProgress(syllabus._id);
    await loadSyllabusData(syllabus.subjectId._id);
  };

  /* ---------------- PROGRESS ---------------- */
  const calculateProgress = () => {
    if (!units.length) return 0;
    const done = units.filter((u) => u.completed).length;
    return Math.round((done / units.length) * 100);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-800">
          Syllabus Overview
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
        >
          ➕ Add Subject
        </button>
      </div>

      {/* ADD SUBJECT FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-4">
          <input
            type="text"
            placeholder="Subject Name"
            className="border p-2 rounded w-full"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />

          <input
            type="text"
            placeholder="Add Unit"
            className="border p-2 rounded w-full"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={saveSubject}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Saving..." : "Save Subject"}
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

      {/* SUBJECT CARDS */}
      <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
        {subjects.map((subject) => (
        <div
          key={subject._id}
          className="bg-white rounded-xl shadow p-6 max-w-3xl"
        >
          <div
            className="flex justify-between items-center mb-4 cursor-pointer"
            onClick={() => loadSyllabusData(subject._id)}
          >
            <h2 className="text-xl font-semibold text-sky-700">
              {subject.name}
            </h2>
            <span className="font-semibold">
              {syllabus?.subjectId?._id === subject._id
                ? calculateProgress()
                : 0}
              %
            </span>
          </div>

          {/* UNITS */}
          {syllabus?.subjectId?._id === subject._id && (
            <>
              <div className="space-y-2 mb-5 max-h-56 overflow-auto pr-2">
                {units.map((unit) => (
                  <div
                    key={unit._id}
                    className="flex items-center justify-between gap-3 text-gray-700"
                  >
                    <div
                      onClick={() => toggleUnitUI(unit._id)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <span className="text-lg">
                        {unit.completed ? "✅" : "⬜"}
                      </span>
                      <span className="break-words">{unit.title}</span>
                    </div>

                    <button
                      onClick={() => deleteUnitUI(unit._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-sky-100 h-3 rounded-full">
                <div
                  className="bg-sky-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${calculateProgress()}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
        ))}
      </div>
    </div>
  );
}
