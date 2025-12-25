export default function LectureCard({ title, subject, duration }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
      <h4 className="font-semibold text-lg mb-1">{title}</h4>
      <span className="text-sm text-sky-600">{subject}</span>

      <p className="text-sm text-gray-500 mt-2">⏱ {duration}</p>

      <button className="mt-4 w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition">
        Watch Now
      </button>
    </div>
  );
}
