import { Mail, Phone, Globe } from "lucide-react";

export default function BusinessCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 w-full max-w-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <img src="/logo.png" alt="Business Logo" className="w-8 h-8" />
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
            For Sale
          </span>
        </div>

        <h3 className="font-semibold text-gray-800">Horizon Hub</h3>
        <p className="text-sm text-gray-500 mb-2">Nigeria</p>

        <p className="text-gray-600 text-sm mb-3">
          Digital marketing, branding, and design agency. Our company has a rich
          operational history with pre-covid annual revenue of USD 250,000.
        </p>

        <div className="flex justify-between bg-gray-50 rounded-md p-2 mb-3 text-sm">
          <div>
            <p className="text-gray-500">Average Monthly:</p>
            <p className="font-medium text-gray-700">
              5,000,000 million naira
            </p>
          </div>
          <div>
            <p className="text-gray-500">EBITDA Margin</p>
            <p className="font-medium text-gray-700">10 - 20%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
          <span className="flex items-center space-x-1">
            <Mail className="w-4 h-4 text-blue-500" /> <span>Official Email</span>
          </span>
          <span className="flex items-center space-x-1">
            <Phone className="w-4 h-4 text-red-500" /> <span>Phone</span>
          </span>
          <span className="flex items-center space-x-1">
            <Globe className="w-4 h-4 text-gray-500" /> <span>Google</span>
          </span>
        </div>

        <p className="text-gray-500 text-xs mb-3">Available after connect</p>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-700">
          Asking Price: <span className="font-semibold">NGN 40 – 50m</span>
        </p>
        <button className="bg-teal-700 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-teal-800 transition">
          View details
        </button>
      </div>
    </div>
  );
}
