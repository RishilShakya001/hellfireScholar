import { useNavigate } from "react-router-dom";

export default function Overview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white px-6">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto pt-24 pb-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <h1 className="text-5xl font-bold text-sky-800 leading-tight">
            Study Smarter with <br />
            <span className="text-sky-600">Hellfire Scholar</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            An all-in-one academic platform to manage syllabus, notes,
            assignments, attendance, and planning — all in one dashboard.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition"
            >
              Explore Dashboard
            </button>

            <button
              disabled
              className="px-6 py-3 rounded-lg border border-sky-600 text-sky-600 font-semibold cursor-not-allowed"
            >
              Login / Signup
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Authentication coming soon
          </p>
        </div>

        {/* Right Visual */}
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-72 h-72 bg-sky-100 rounded-full blur-3xl" />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <Stat label="Syllabus Completed" value="65%" />
            <Stat label="Assignments Pending" value="2" />
            <Stat label="Attendance" value="72%" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto pb-24">
        <h2 className="text-3xl font-bold text-sky-800 text-center mb-12">
          What Hellfire Scholar Offers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature
            title="📚 Smart Syllabus Tracking"
            desc="Track topic-wise progress with interactive checklists and live completion percentage."
          />
          <Feature
            title="📝 Notes, PYQs & Resources"
            desc="Store all study material in one organized place — no more searching."
          />
          <Feature
            title="⏰ Assignments & Quizzes"
            desc="Keep track of deadlines, submission status, and quiz performance."
          />
          <Feature
            title="📊 Attendance Manager"
            desc="Know your attendance percentage, shortages, and minimum requirements."
          />
          <Feature
            title="🗓 Smart Planner"
            desc="Plan your study schedule efficiently with a dedicated planner."
          />
          <Feature
            title="🔐 Secure Dashboard"
            desc="Personalized dashboard experience with secure login (coming soon)."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center pb-10 text-gray-500">
        Built for students • Designed for productivity
      </footer>
    </div>
  );
}

/* Small Components */

function Feature({ title, desc }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-sky-700">{title}</h3>
      <p className="text-gray-600 mt-2">{desc}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-sky-50 rounded-lg p-4">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-sky-700">{value}</span>
    </div>
  );
}
 