import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  number: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  options?: string[];
}

export interface ISection {
  title: string;
  type: string;
  instructions: string;
  marksPerQuestion: number;
  questions: IQuestion[];
}

export interface IAnswerKeyItem {
  number: number;
  answer: string;
}

export interface IResult {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: ISection[];
  answerKey: IAnswerKeyItem[];
}

export interface IQuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  dueDate: Date;
  questionTypes: IQuestionType[];
  additionalInstructions: string;
  fileUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: IResult;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
  options: [{ type: String }],
}, { _id: false });

const sectionSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  instructions: { type: String, default: '' },
  marksPerQuestion: { type: Number, required: true },
  questions: [questionSchema],
}, { _id: false });

const answerKeySchema = new Schema({
  number: { type: Number, required: true },
  answer: { type: String, required: true },
}, { _id: false });

const resultSchema = new Schema({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  sections: [sectionSchema],
  answerKey: [answerKeySchema],
}, { _id: false });

const questionTypeSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 0 },
  marks: { type: Number, required: true, min: 0 },
}, { _id: false });

const assignmentSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, default: '' },
  className: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  questionTypes: [questionTypeSchema],
  additionalInstructions: { type: String, default: '' },
  fileUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  result: resultSchema,
}, { timestamps: true });

assignmentSchema.index({ status: 1 });
assignmentSchema.index({ createdAt: -1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
