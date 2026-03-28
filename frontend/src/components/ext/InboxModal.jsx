import { X } from "lucide-react";

export default function InboxModal() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-96 p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-4 text-sm font-medium">
          <span className="text-gray-900">Inbox <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">2</span></span>
          <span className="text-gray-500">Archived</span>
          <span className="text-gray-500">All</span>
        </div>
        <X className="w-4 h-4 text-gray-500" />
      </div>

      <div className="flex justify-between mb-2">
        <button className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200">
          Mark all as read
        </button>
        <button className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200">
          Archive read
        </button>
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <p className="font-medium text-gray-800">Horizon Hub sent you a proposal</p>
        <p className="text-xs text-gray-500 mb-2">11 hours ago • Task List</p>

        <p className="text-sm mb-1"><span className="font-semibold">Purpose of Listing:</span> For sale</p>
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">Background:</span> Our company has a rich operational history with pre-covid annual revenue of USD 250,000.
        </p>

        <div className="flex space-x-2">
          <button className="border border-gray-300 rounded-md px-3 py-1 text-sm hover:bg-gray-100">Decline</button>
          <button className="bg-green-600 text-white rounded-md px-3 py-1 text-sm hover:bg-green-700">Review</button>
        </div>
      </div>
    </div>
  );
}
