import LectureCard from "./LectureCard";

export default function Dashboard() {
  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold text-sky-800">Dashboard</h2>
      <p className="text-gray-600 mb-6">Welcome back!</p>

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow p-6 max-w-4xl">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-sky-700">
            Syllabus Progress
          </span>
          <span className="font-semibold">65%</span>
        </div>

        <div className="w-full bg-sky-100 h-3 rounded-full mb-4">
          <div className="bg-sky-500 h-3 rounded-full w-[65%]" />
        </div>

        <p className="mb-2">
          Attendance: <b>72%</b> ⚠️
        </p>
        <p className="mb-2">
          Assignments Due: <b>2</b>
        </p>
        <p>
          Weak Topics: <b>Unit 3, Unit 5</b>
        </p>
      </div>

      {/* Recommended Lectures */}
      <section className="mt-10">
        <h3 className="text-xl font-semibold text-sky-800 mb-4">
          Recommended Lectures ▶
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LectureCard
            title="Quantum Mechanics Basics"
            subject="Physics"
            duration="45 min"
          />
          <LectureCard
            title="Organic Chemistry Intro"
            subject="Chemistry"
            duration="30 min"
          />
          <LectureCard
            title="World War II Overview"
            subject="History"
            duration="50 min"
          />
        </div>
      </section>
    </main>
  );
}
