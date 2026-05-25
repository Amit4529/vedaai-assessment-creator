'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BookOpen, Bell, ChevronDown } from 'lucide-react';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function TopBar({ title = 'Assignment', showBack = true, backHref = '/assignments' }: TopBarProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-border/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href={backHref}
            className="p-2 hover:bg-hover rounded-xl transition-all duration-200 active:scale-95"
          >
            <ArrowLeft size={18} className="text-subtext" />
          </Link>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary/5 rounded-lg flex items-center justify-center">
            <BookOpen size={14} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary">{title}</span>
        </div>
      </div>

      {/* Right - Desktop */}
      <div className="hidden md:flex items-center gap-3">
        <button className="relative p-2.5 hover:bg-hover rounded-xl transition-all duration-200">
          <Bell size={18} className="text-subtext" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="h-6 w-px bg-border/60" />
        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-hover rounded-xl px-3 py-2 transition-all duration-200">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
            DP
          </div>
          <span className="text-sm font-medium text-primary">DPS Teacher</span>
          <ChevronDown size={14} className="text-subtext" />
        </div>
      </div>

      {/* Right - Mobile */}
      <div className="flex md:hidden items-center gap-2">
        <button className="relative p-2.5 hover:bg-hover rounded-xl transition-all duration-200">
          <Bell size={18} className="text-subtext" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
          DP
        </div>
      </div>
    </header>
  );
}
