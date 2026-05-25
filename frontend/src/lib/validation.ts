import { z } from 'zod';

const questionTypeSchema = z.object({
  type: z.string().min(1, 'Question type is required'),
  count: z.number().int().min(0, 'Count must be non-negative'),
  marks: z.number().int().min(0, 'Marks must be non-negative'),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().optional().default(''),
  className: z.string().optional().default(''),
  dueDate: z.string().min(1, 'Due date is required').refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  questionTypes: z
    .array(questionTypeSchema)
    .min(1, 'At least one question type is required')
    .refine((types) => types.some((t) => t.count > 0), {
      message: 'At least one question type must have count > 0',
    }),
  additionalInstructions: z.string().optional().default(''),
});

export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;
