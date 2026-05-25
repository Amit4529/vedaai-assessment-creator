export interface Question {
  number: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  options?: string[];
}

export interface Section {
  title: string;
  type: string;
  instructions: string;
  marksPerQuestion: number;
  questions: Question[];
}

export interface AnswerKeyItem {
  number: number;
  answer: string;
}

export interface AssignmentResult {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Section[];
  answerKey: AnswerKeyItem[];
}

export interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AssignmentResult;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { path: string; message: string }[];
}
