import React from "react";
import { Home, Archive, Users, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home",     icon: Home },
  { href: "/capsules",  label: "Capsules", icon: Archive },
  { href: "/friends",   label: "Friends",  icon: Users },
  { href: "/memories",  label: "Memories", icon: BookOpen },
];

export default function MobileBottomNav() {
  const current = window.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(139,92,246,0.12)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = current === href;
          return (
            <a key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all active:scale-90"
              style={isActive ? { background: 'linear-gradient(135deg,rgba(236,72,153,0.12),rgba(139,92,246,0.12))' } : {}}>
              <div className={`w-6 h-6 flex items-center justify-center transition-all ${isActive ? 'scale-110' : ''}`}>
                <Icon size={20} className={isActive ? 'text-purple-600' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-bold transition-all ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-purple-500 mt-0.5" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
