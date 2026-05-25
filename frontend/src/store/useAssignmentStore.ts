import { create } from 'zustand';
import { Assignment, QuestionTypeConfig } from '@/lib/types';
import * as api from '@/lib/api';

interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
}

interface AssignmentStore {
  // State
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  isLoading: boolean;
  error: string | null;
  formData: AssignmentFormData;

  // Assignment actions
  loadAssignments: (search?: string) => Promise<void>;
  loadAssignment: (id: string) => Promise<void>;
  createNewAssignment: () => Promise<Assignment | null>;
  removeAssignment: (id: string) => Promise<void>;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  updateCurrentAssignment: (updates: Partial<Assignment>) => void;

  // Form actions
  updateFormField: <K extends keyof AssignmentFormData>(field: K, value: AssignmentFormData[K]) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, field: keyof QuestionTypeConfig, value: string | number) => void;
  resetForm: () => void;
}

const defaultQuestionTypes: QuestionTypeConfig[] = [
  { type: 'Multiple Choice Questions', count: 4, marks: 1 },
  { type: 'Short Questions', count: 3, marks: 2 },
  { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
  { type: 'Numerical Problems', count: 5, marks: 5 },
];

const defaultFormData: AssignmentFormData = {
  title: '',
  subject: '',
  className: '',
  dueDate: '',
  questionTypes: [...defaultQuestionTypes.map((qt) => ({ ...qt }))],
  additionalInstructions: '',
};

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  isLoading: false,
  error: null,
  formData: { ...defaultFormData, questionTypes: defaultFormData.questionTypes.map((qt) => ({ ...qt })) },

  loadAssignments: async (search?: string) => {
    set({ isLoading: true, error: null });
    const res = await api.fetchAssignments(search);
    if (res.success && res.data) {
      set({ assignments: res.data, isLoading: false });
    } else {
      set({ error: res.error || 'Failed to load assignments', isLoading: false });
    }
  },

  loadAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    const res = await api.fetchAssignment(id);
    if (res.success && res.data) {
      set({ currentAssignment: res.data, isLoading: false });
    } else {
      set({ error: res.error || 'Failed to load assignment', isLoading: false });
    }
  },

  createNewAssignment: async () => {
    const { formData } = get();
    set({ isLoading: true, error: null });
    const res = await api.createAssignment({
      title: formData.title || 'Untitled Assignment',
      subject: formData.subject,
      className: formData.className,
      dueDate: formData.dueDate,
      questionTypes: formData.questionTypes.filter((qt) => qt.count > 0),
      additionalInstructions: formData.additionalInstructions,
    });
    if (res.success && res.data) {
      set((state) => ({
        assignments: [res.data!, ...state.assignments],
        currentAssignment: res.data!,
        isLoading: false,
      }));
      return res.data;
    } else {
      set({ error: res.error || 'Failed to create assignment', isLoading: false });
      return null;
    }
  },

  removeAssignment: async (id: string) => {
    const res = await api.deleteAssignment(id);
    if (res.success) {
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
      }));
    }
  },

  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  updateCurrentAssignment: (updates) =>
    set((state) => ({
      currentAssignment: state.currentAssignment
        ? { ...state.currentAssignment, ...updates }
        : null,
    })),

  updateFormField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  addQuestionType: () =>
    set((state) => ({
      formData: {
        ...state.formData,
        questionTypes: [...state.formData.questionTypes, { type: '', count: 1, marks: 1 }],
      },
    })),

  removeQuestionType: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        questionTypes: state.formData.questionTypes.filter((_, i) => i !== index),
      },
    })),

  updateQuestionType: (index, field, value) =>
    set((state) => {
      const updated = [...state.formData.questionTypes];
      updated[index] = { ...updated[index], [field]: value };
      return { formData: { ...state.formData, questionTypes: updated } };
    }),

  resetForm: () =>
    set({
      formData: {
        ...defaultFormData,
        questionTypes: defaultFormData.questionTypes.map((qt) => ({ ...qt })),
      },
    }),
}));
