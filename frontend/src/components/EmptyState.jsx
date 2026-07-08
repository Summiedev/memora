import { Inbox } from "lucide-react";

export default function EmptyState({ message, icon: Icon, action }) {
  const IconComp = Icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 shadow-sm">
        <IconComp size={28} className="text-purple-400" />
      </div>
      <p className="text-sm font-semibold text-purple-600 mb-1">
        {message || "Nothing to show just yet."}
      </p>
      <p className="text-xs text-purple-400 max-w-xs">
        Add your first memory to get started
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 rounded-2xl text-white text-sm font-bold shadow-md hover:scale-105 transition-transform"
          style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}