import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export interface GenerationJobData {
  assignmentId: string;
  title: string;
  subject: string;
  className: string;
  questionTypes: { type: string; count: number; marks: number }[];
  additionalInstructions: string;
}

export const generationQueue = new Queue<GenerationJobData>('ai-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

generationQueue.on('error', (err) => {
  console.error('⚠️ BullMQ queue error (non-fatal):', err.message);
});

console.log('✅ BullMQ queue initialized');
