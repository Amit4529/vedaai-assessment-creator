'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    completed: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      icon: <CheckCircle2 size={10} />,
      label: 'Completed',
    },
    processing: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: <Loader2 size={10} className="animate-spin" />,
      label: 'Processing',
    },
    pending: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: <Clock size={10} />,
      label: 'Pending',
    },
    failed: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: <AlertCircle size={10} />,
      label: 'Failed',
    },
  };
  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { assignments, isLoading, loadAssignments, removeAssignment } = useAssignmentStore();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAssignments(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadAssignments]);

  const handleDelete = async (id: string) => {
    await removeAssignment(id);
    setMenuOpen(null);
  };

  const isEmpty = assignments.length === 0 && !isLoading;

  return (
    <>
      <TopBar title="Assignments" showBack={false} />

      <div className="p-4 md:p-8">
        {isEmpty && !search ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[65vh] animate-fade-in">
            {/* Illustration */}
            <div className="relative mb-10">
              <div className="w-52 h-52 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-[3px] border-gray-200 flex items-center justify-center bg-white shadow-inner">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center">
                        <FileText size={28} className="text-orange-500" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-7 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full transform rotate-45 origin-top shadow-sm" />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-8 w-3 h-3 bg-orange-300 rounded-full animate-float" />
                <div className="absolute bottom-12 left-4 w-2.5 h-2.5 bg-blue-300 rounded-full animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-12 left-6">
                  <div className="w-10 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="w-5 h-0.5 bg-gray-300 rounded" />
                  </div>
                </div>
                <div className="absolute top-6 right-2">
                  <Sparkles size={14} className="text-orange-400 animate-pulse" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">No assignments yet</h2>
            <p className="text-sm md:text-base text-subtext text-center max-w-md mb-10 leading-relaxed">
              Create your first assignment to generate AI-powered question papers. Set up rubrics, define marking criteria, and let AI assist with paper creation.
            </p>
            <Link
              href="/assignments/create"
              className="flex items-center gap-2.5 px-7 py-3.5 btn-primary rounded-xl text-sm font-semibold active:scale-[0.98]"
            >
              <Plus size={18} />
              Create Your First Assignment
            </Link>
          </div>
        ) : (
          /* Filled State */
          <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1.5">Assignments</h1>
              <p className="text-sm text-subtext">Manage and create AI-powered question papers for your classes.</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1 order-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext/60" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assignments..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-white text-sm placeholder:text-subtext/40 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 border border-border rounded-xl bg-white text-sm font-medium text-subtext hover:bg-hover hover:text-primary transition-all duration-200 order-2 sm:order-2 shrink-0">
                <SlidersHorizontal size={14} />
                <span>Filter</span>
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border p-6 h-[140px] skeleton" />
                ))}
              </div>
            )}

            {/* Assignment Grid */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment._id}
                    onClick={() => router.push(`/assignments/${assignment._id}`)}
                    className="bg-white rounded-2xl border border-border p-6 card-hover cursor-pointer relative group flex flex-col justify-between animate-slide-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div>
                      {/* Top Action / Status Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          <StatusBadge status={assignment.status} />
                          {assignment.subject && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 border border-orange-100 text-orange-700">
                              {assignment.subject}
                            </span>
                          )}
                          {assignment.className && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 border border-blue-100 text-blue-700">
                              Class {assignment.className}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {assignment.status === 'failed' && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                router.push(`/assignments/${assignment._id}`);
                              }}
                              title="Retry generation"
                              className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-lg transition-all duration-200"
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(menuOpen === assignment._id ? null : assignment._id);
                              }}
                              className="p-1.5 hover:bg-hover rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical size={16} className="text-subtext" />
                            </button>

                            {menuOpen === assignment._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }} />
                                <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-xl z-20 min-w-[170px] py-1.5 dropdown-enter">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/assignments/${assignment._id}`);
                                      setMenuOpen(null);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-primary hover:bg-hover transition-colors rounded-lg mx-1"
                                    style={{ width: 'calc(100% - 8px)' }}
                                  >
                                    <Eye size={14} className="text-subtext" />
                                    View Assignment
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(assignment._id);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1"
                                    style={{ width: 'calc(100% - 8px)' }}
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-primary text-base group-hover:text-orange-600 transition-colors mb-3 leading-snug line-clamp-2">
                        {assignment.title}
                      </h3>
                    </div>

                    {/* Meta info bottom */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-subtext mt-4 pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-subtext/60" />
                        Assigned: {format(new Date(assignment.createdAt), 'dd MMM yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock size={12} className="text-subtext/60" />
                        Due: {format(new Date(assignment.dueDate), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Create Button */}
            <div className="hidden md:flex justify-center mt-10">
              <Link
                href="/assignments/create"
                className="flex items-center gap-2.5 px-7 py-3 btn-primary rounded-xl text-sm font-semibold active:scale-[0.98]"
              >
                <Plus size={16} />
                Create Assignment
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
