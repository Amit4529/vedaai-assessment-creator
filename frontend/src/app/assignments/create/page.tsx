'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import {
  Upload,
  Calendar,
  Plus,
  X,
  Minus,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Sparkles,
  FileText,
  CheckCircle2,
} from 'lucide-react';

const availableQuestionTypes = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False Questions',
  'Fill in the Blanks',
  'Match the Following',
  'Case Study Questions',
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    formData,
    updateFormField,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    createNewAssignment,
    isLoading,
    error,
  } = useAssignmentStore();

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalQuestions = formData.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = formData.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date must be in the future';
    }

    if (formData.questionTypes.length === 0) {
      newErrors.questionTypes = 'At least one question type is required';
    }

    if (totalQuestions === 0) {
      newErrors.questionTypes = 'At least one question type must have count > 0';
    }

    const hasEmptyType = formData.questionTypes.some((qt) => !qt.type);
    if (hasEmptyType) {
      newErrors.questionTypes = 'All question types must have a name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!formData.title) {
      updateFormField('title', `Assignment - ${new Date().toLocaleDateString()}`);
    }

    const assignment = await createNewAssignment();
    if (assignment) {
      router.push(`/assignments/${assignment._id}`);
    }
  };

  return (
    <>
      <TopBar title="Create Assignment" backHref="/assignments" />

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1.5">Create Assignment</h1>
          <p className="text-sm text-subtext">Set up a new AI-powered question paper for your students</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700 w-full" />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-10 animate-slide-up">
          <div className="space-y-8">
          {/* Section Header */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-primary">Assignment Details</h2>
            </div>
            <p className="text-sm text-subtext ml-11">Basic information about your assignment</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Assignment Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              placeholder="e.g. Quiz on Electricity"
              className="w-full px-4 py-3 border border-border rounded-xl text-sm placeholder:text-subtext/40 transition-all bg-white"
            />
          </div>

          {/* Subject & Class in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => updateFormField('subject', e.target.value)}
                placeholder="e.g. Science"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm placeholder:text-subtext/40 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Class</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => updateFormField('className', e.target.value)}
                placeholder="e.g. 8th"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm placeholder:text-subtext/40 transition-all bg-white"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Upload Reference (Optional)</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? 'border-orange-400 bg-orange-50/50 shadow-inner'
                  : uploadedFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-border hover:border-gray-300 bg-gray-50/30'
              }`}
            >
              {uploadedFile ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-primary">{uploadedFile.name}</p>
                    <p className="text-xs text-subtext">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                    className="ml-2 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={14} className="text-subtext" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <Upload size={22} className="text-subtext" />
                  </div>
                  <p className="text-sm text-primary font-medium mb-1">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-xs text-subtext mb-4">PDF, JPEG, PNG up to 10MB</p>
                  <label className="px-5 py-2 border border-border rounded-xl text-xs font-semibold text-primary hover:bg-hover cursor-pointer transition-all duration-200 active:scale-95">
                    Browse Files
                    <input
                      type="file"
                      accept=".pdf,.txt,.png,.jpg,.jpeg"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Due Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => {
                  updateFormField('dueDate', e.target.value);
                  setErrors((prev) => ({ ...prev, dueDate: '' }));
                }}
                className={`w-full px-4 py-3 border rounded-xl text-sm transition-all appearance-none bg-white ${
                  errors.dueDate
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-border'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-subtext pointer-events-none" />
            </div>
            {errors.dueDate && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.dueDate}</p>}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Question Types Section */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Question Types</h2>
                <p className="text-xs text-subtext">Configure the types of questions for your paper</p>
              </div>
            </div>

            {/* Desktop Table Header */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_90px_90px] gap-3 mb-4 px-1">
              <span className="text-[11px] text-subtext font-semibold uppercase tracking-wide">Question Type</span>
              <span />
              <span className="text-[11px] text-subtext font-semibold uppercase tracking-wide text-center">Questions</span>
              <span className="text-[11px] text-subtext font-semibold uppercase tracking-wide text-center">Marks</span>
            </div>

            <div className="space-y-3">
              {formData.questionTypes.map((qt, index) => (
                <div
                  key={index}
                  className="bg-gray-50/80 rounded-xl p-3 border border-border/50 animate-fade-in hover:border-border transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={qt.type}
                          onChange={(e) => updateQuestionType(index, 'type', e.target.value)}
                          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-white appearance-none pr-8 cursor-pointer hover:bg-hover hover:border-gray-300 transition-all"
                        >
                          <option value="">Select type...</option>
                          {availableQuestionTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext pointer-events-none" />
                      </div>
                      <button
                        onClick={() => removeQuestionType(index)}
                        className="p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      >
                        <X size={16} className="text-subtext hover:text-red-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="text-[11px] text-subtext font-semibold mb-1.5 block uppercase tracking-wide">Questions</span>
                        <div className="flex items-center border border-border rounded-xl bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuestionType(index, 'count', Math.max(0, qt.count - 1))}
                            className="px-3 py-2.5 hover:bg-hover transition-colors text-subtext active:bg-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="flex-1 py-2.5 text-sm font-semibold text-primary text-center border-x border-border">
                            {qt.count}
                          </span>
                          <button
                            onClick={() => updateQuestionType(index, 'count', qt.count + 1)}
                            className="px-3 py-2.5 hover:bg-hover transition-colors text-subtext active:bg-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] text-subtext font-semibold mb-1.5 block uppercase tracking-wide">Marks</span>
                        <div className="flex items-center border border-border rounded-xl bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuestionType(index, 'marks', Math.max(0, qt.marks - 1))}
                            className="px-3 py-2.5 hover:bg-hover transition-colors text-subtext active:bg-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="flex-1 py-2.5 text-sm font-semibold text-primary text-center border-x border-border">
                            {qt.marks}
                          </span>
                          <button
                            onClick={() => updateQuestionType(index, 'marks', qt.marks + 1)}
                            className="px-3 py-2.5 hover:bg-hover transition-colors text-subtext active:bg-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid grid-cols-[1fr_auto_90px_90px] gap-3 items-center">
                    <div className="relative">
                      <select
                        value={qt.type}
                        onChange={(e) => updateQuestionType(index, 'type', e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm bg-white appearance-none pr-8 cursor-pointer hover:bg-hover hover:border-gray-300 transition-all"
                      >
                        <option value="">Select type...</option>
                        {availableQuestionTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext pointer-events-none" />
                    </div>
                    <button
                      onClick={() => removeQuestionType(index)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X size={16} className="text-subtext hover:text-red-500" />
                    </button>

                    {/* Count stepper */}
                    <div className="flex items-center border border-border rounded-xl bg-white overflow-hidden">
                      <button
                        onClick={() => updateQuestionType(index, 'count', Math.max(0, qt.count - 1))}
                        className="px-2.5 py-2 hover:bg-hover transition-colors text-subtext"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="flex-1 py-2 text-sm font-semibold text-primary text-center">
                        {qt.count}
                      </span>
                      <button
                        onClick={() => updateQuestionType(index, 'count', qt.count + 1)}
                        className="px-2.5 py-2 hover:bg-hover transition-colors text-subtext"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Marks stepper */}
                    <div className="flex items-center border border-border rounded-xl bg-white overflow-hidden">
                      <button
                        onClick={() => updateQuestionType(index, 'marks', Math.max(0, qt.marks - 1))}
                        className="px-2.5 py-2 hover:bg-hover transition-colors text-subtext"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="flex-1 py-2 text-sm font-semibold text-primary text-center">
                        {qt.marks}
                      </span>
                      <button
                        onClick={() => updateQuestionType(index, 'marks', qt.marks + 1)}
                        className="px-2.5 py-2 hover:bg-hover transition-colors text-subtext"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Question Type */}
            <button
              onClick={addQuestionType}
              className="flex items-center gap-2.5 mt-4 text-sm font-semibold text-primary hover:text-orange-600 transition-colors group"
            >
              <div className="w-6 h-6 rounded-lg bg-primary group-hover:bg-orange-500 text-white flex items-center justify-center transition-colors">
                <Plus size={12} />
              </div>
              Add Question Type
            </button>

            {/* Totals */}
            <div className="flex justify-end mt-6 gap-6 text-sm text-subtext bg-gray-50 rounded-xl px-4 py-3 border border-border/50">
              <span>Total Questions: <strong className="text-primary font-semibold">{totalQuestions}</strong></span>
              <span>Total Marks: <strong className="text-primary font-semibold">{totalMarks}</strong></span>
            </div>

            {errors.questionTypes && (
              <p className="text-xs text-red-500 mt-2 ml-1">{errors.questionTypes}</p>
            )}
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Additional Instructions (Optional)
            </label>
            <div className="relative">
              <textarea
                value={formData.additionalInstructions}
                onChange={(e) => updateFormField('additionalInstructions', e.target.value)}
                placeholder="e.g. Focus on NCERT chapters 1-5, include diagram-based questions..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-xl text-sm placeholder:text-subtext/40 transition-all resize-none bg-white"
              />
              <Sparkles size={16} className="absolute right-3.5 bottom-3.5 text-subtext/20" />
            </div>
          </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl text-sm font-semibold text-primary hover:bg-hover transition-all active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-7 py-3 btn-accent rounded-xl text-sm font-semibold active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Paper
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
