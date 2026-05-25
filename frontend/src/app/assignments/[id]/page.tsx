'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { regenerateAssignment } from '@/lib/api';
import { Section, Question } from '@/lib/types';
import {
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Pencil,
  Code,
  Plus,
} from 'lucide-react';

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    Easy: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700' },
    Moderate: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700' },
    Hard: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700' },
  };
  const c = config[difficulty] || config.Moderate;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${c.bg} ${c.text}`}>
      {difficulty}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-orange-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
            <Sparkles size={24} className="text-orange-500 animate-pulse" />
          </div>
        </div>
      </div>
      <h3 className="text-xl font-bold text-primary mb-2">Generating Question Paper</h3>
      <p className="text-sm text-subtext text-center max-w-sm leading-relaxed mb-6">
        Our AI is crafting a customized question paper based on your preferences. This typically takes 10-30 seconds...
      </p>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2.5 h-2.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function FailedState({
  onRetry,
  title = 'Generation Failed',
  description = 'Something went wrong while generating your question paper. This could be due to a temporary issue. Please try again.',
}: {
  onRetry: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <AlertCircle size={36} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-subtext text-center max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2.5 px-7 py-3 btn-primary rounded-xl text-sm font-semibold active:scale-[0.98]"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentAssignment, isLoading, loadAssignment, updateCurrentAssignment, error } = useAssignmentStore();
  const { connect, subscribe, isConnected } = useWebSocket();
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    loadAssignment(id);
    connect();
    const timer = setTimeout(() => {
      subscribe(id);
    }, 500);
    return () => clearTimeout(timer);
  }, [id, loadAssignment, connect, subscribe]);

  useEffect(() => {
    if (isConnected) {
      subscribe(id);
    }
  }, [isConnected, id, subscribe]);

  // Polling fallback when assignment generation is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const status = currentAssignment?.status;
    if (status === 'pending' || status === 'processing') {
      interval = setInterval(() => {
        loadAssignment(id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, currentAssignment?.status, loadAssignment]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    updateCurrentAssignment({ status: 'pending', result: undefined });
    await regenerateAssignment(id);
    subscribe(id);
    setIsRegenerating(false);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const result = currentAssignment?.result;
  const status = currentAssignment?.status;

  return (
    <>
      <div className="no-print">
        <TopBar title="Question Paper" backHref="/assignments" />
      </div>

      <div className="p-4 md:p-8">
        {/* AI Banner + Action Bar */}
        {result && (
          <div className="no-print mb-6 max-w-4xl mx-auto animate-slide-up">
            {/* AI Banner */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 md:p-6 mb-4 relative overflow-hidden">
              {/* Subtle decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-white font-semibold">Here&apos;s your question paper!</span> Customized for{' '}
                    <span className="text-orange-400 font-medium">
                      {result.subject || 'your subject'} {result.className ? `- Class ${result.className}` : ''}
                    </span>{' '}
                    based on NCERT curriculum.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-600 text-gray-200 rounded-xl text-sm font-medium hover:bg-white/10 transition-all duration-200 shrink-0 active:scale-95"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-primary bg-white hover:bg-hover transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(isLoading || status === 'pending' || status === 'processing') && !result && !error && (
          <LoadingState />
        )}

        {/* Failed State */}
        {status === 'failed' && !result && !error && (
          <FailedState 
            onRetry={handleRegenerate} 
            title="Generation Failed"
            description="Something went wrong while generating your question paper. Please try again."
          />
        )}

        {/* Error State */}
        {error && !result && (
          <FailedState 
            onRetry={() => loadAssignment(id)} 
            title="Failed to Load Assignment"
            description={error || "Could not retrieve the assignment details. The backend server might be offline or unreachable."}
          />
        )}

        {/* Question Paper Output */}
        {result && (
          <div className="bg-white rounded-2xl border border-border shadow-sm max-w-4xl mx-auto animate-slide-up" id="question-paper" style={{ animationDelay: '100ms' }}>
            <div className="p-6 md:p-10 lg:p-14">
              {/* School Header */}
              <div className="text-center border-b-2 border-gray-800 pb-5 mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-primary mb-2 tracking-tight">
                  {result.schoolName}
                </h1>
                <div className="flex items-center justify-center gap-8 text-sm text-subtext mt-3">
                  <span>Subject: <strong className="text-primary">{result.subject}</strong></span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>Class: <strong className="text-primary">{result.className}</strong></span>
                </div>
              </div>

              {/* Time & Marks */}
              <div className="flex items-center justify-between mb-8 px-4 py-3 bg-gray-50 rounded-xl border border-border/50">
                <span className="text-sm text-subtext">
                  Time Allowed: <strong className="text-primary">{result.timeAllowed}</strong>
                </span>
                <span className="text-sm text-subtext">
                  Maximum Marks: <strong className="text-primary">{result.maxMarks}</strong>
                </span>
              </div>

              {/* General Instructions */}
              <p className="text-sm text-subtext italic mb-8 px-1">
                <strong>General Instructions:</strong> All questions are compulsory unless stated otherwise. Read each question carefully before answering.
              </p>

              {/* Student Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 p-5 bg-gray-50/60 rounded-xl border border-border/50">
                {['Name', 'Roll Number', 'Class', 'Section'].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-sm text-subtext whitespace-nowrap font-medium">{label}:</span>
                    <div className="flex-1 border-b border-gray-300" />
                  </div>
                ))}
              </div>

              {/* Sections */}
              {result.sections.map((section: Section, sIdx: number) => (
                <div key={sIdx} className="mb-10">
                  {/* Section Divider */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <h2 className="text-base font-bold text-primary text-center px-3 bg-white">
                      {section.title}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  </div>

                  <div className="mb-4 px-1">
                    <h3 className="text-sm font-semibold text-primary">{section.type}</h3>
                    <p className="text-xs text-subtext italic mt-0.5">{section.instructions}</p>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4 mt-5">
                    {section.questions.map((question: Question, qIdx: number) => (
                      <div
                        key={qIdx}
                        className="flex gap-3 py-3 group hover:bg-gray-50/80 rounded-xl px-3 -mx-3 transition-colors"
                      >
                        <span className="text-sm font-semibold text-primary shrink-0 w-7 pt-0.5">
                          {question.number}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <DifficultyBadge difficulty={question.difficulty} />
                            <span className="text-sm text-primary leading-relaxed flex-1">
                              {question.text}
                            </span>
                            <span className="text-[11px] text-subtext font-semibold shrink-0 bg-gray-100 px-2 py-0.5 rounded-md">
                              {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                          </div>
                          {/* MCQ Options */}
                          {question.options && question.options.length > 0 && (
                            <div className="mt-3 ml-1 space-y-1.5">
                              {question.options.map((opt: string, oIdx: number) => (
                                <p key={oIdx} className="text-sm text-subtext flex items-start gap-2">
                                  <span className="font-medium text-primary/60">{String.fromCharCode(97 + oIdx)})</span>
                                  <span>{opt}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* End of Question Paper */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <span className="text-xs text-subtext font-semibold uppercase tracking-wider">End of Question Paper</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Answer Key */}
              {result.answerKey && result.answerKey.length > 0 && (
                <div className="mt-10 pt-8 border-t-2 border-gray-800">
                  <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                    Answer Key
                  </h2>
                  <div className="space-y-3 bg-gray-50/60 rounded-xl p-5 border border-border/50">
                    {result.answerKey.map((item, aIdx: number) => (
                      <div key={aIdx} className="flex gap-3 text-sm">
                        <span className="font-semibold text-primary shrink-0 w-7">
                          {item.number}.
                        </span>
                        <p className="text-subtext leading-relaxed">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        {result && (
          <div className="no-print fixed bottom-0 left-0 right-0 md:left-[260px] bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 py-3.5 px-4 md:px-6 z-20 mb-16 md:mb-0">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/assignments/create')}
                className="flex items-center gap-2 px-5 py-2.5 btn-accent rounded-xl text-sm font-semibold active:scale-95"
              >
                <Plus size={14} />
                Create New
              </button>
              
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-200 border border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors active:scale-95"
              >
                <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                Regenerate
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors active:scale-95"
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
