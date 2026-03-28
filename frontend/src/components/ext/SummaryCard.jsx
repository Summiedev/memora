export default function SummaryCard({ title, value, percentage }) {
  return (
    <div className="flex flex-col justify-between bg-white rounded-lg shadow-sm p-5 w-full max-w-xs border border-gray-100">
      <div className="text-gray-700 text-sm font-medium mb-2">{title}</div>
      <div className="flex justify-between items-center">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {percentage && (
          <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full text-xs">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
