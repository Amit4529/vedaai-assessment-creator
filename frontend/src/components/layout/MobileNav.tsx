'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BookOpen, Library, Wand2, Plus } from 'lucide-react';

const mobileNavItems = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'Assignments', href: '/assignments', icon: BookOpen },
  { label: 'Library', href: '#', icon: Library },
  { label: 'AI Toolkit', href: '#', icon: Wand2 },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* FAB Button */}
      <Link
        href="/assignments/create"
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 btn-accent rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-transform"
      >
        <Plus size={24} strokeWidth={2.5} />
      </Link>

      {/* Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-border/60 flex items-center justify-around z-30 px-2">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === '/assignments'
              ? pathname.startsWith('/assignments')
              : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${
                isActive ? 'text-orange-600' : 'text-subtext'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 bg-orange-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
