'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  BookOpen,
  Wand2,
  Library,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';

import { useEffect } from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const navItems = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'My Groups', href: '#', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: BookOpen, badge: true },
  { label: "AI Teacher's Toolkit", href: '#', icon: Wand2 },
  { label: 'My Library', href: '#', icon: Library },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments, loadAssignments } = useAssignmentStore();

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  return (
    <aside className="hidden md:flex flex-col w-[260px] min-h-screen bg-white border-r border-border fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 4.2L18.6 8 12 11.8 5.4 8 12 4.2zM5 9.5l6 3.3V19l-6-3.3V9.5zm8 6.5v6.2l6-3.3V9.5l-6 3.3V16z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-primary tracking-tight">VedaAI</span>
        </div>
      </div>

      {/* Create Assignment Button */}
      <div className="px-4 pb-5">
        <Link
          href="/assignments/create"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 btn-primary rounded-xl text-sm font-semibold active:scale-[0.98]"
        >
          <Sparkles size={16} />
          Create Assignment
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/assignments'
                ? pathname.startsWith('/assignments')
                : pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/5 text-primary font-semibold border border-primary/10'
                      : 'text-subtext hover:bg-hover hover:text-primary'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                  {item.badge && assignments.length > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-sm">
                      {assignments.length}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="px-3 pb-2">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-subtext hover:bg-hover hover:text-primary transition-all duration-200"
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
            D
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary truncate">Delhi Public School</p>
            <p className="text-xs text-subtext truncate">Bokaro Steel City</p>
          </div>
          <button className="p-1.5 hover:bg-hover rounded-lg transition-colors">
            <LogOut size={16} className="text-subtext" />
          </button>
        </div>
      </div>
    </aside>
  );
}
