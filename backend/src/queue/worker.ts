import { Worker } from 'bullmq';
import { redis, setCache } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { generateQuestionPaper } from '../services/aiService';
import { GenerationJobData } from './queue';
import { broadcastToAssignment } from '../websocket/ws';
import { env } from '../config/env';

export function startWorker() {
  const worker = new Worker<GenerationJobData>(
    'ai-generation',
    async (job) => {
      const { assignmentId, title, subject, className, questionTypes, additionalInstructions } = job.data;

      console.log(`🔄 Processing job ${job.id} for assignment ${assignmentId}`);

      // Update status to processing
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      broadcastToAssignment(assignmentId, {
        type: 'status',
        assignmentId,
        status: 'processing',
      });

      try {
        if (
          !env.GEMINI_API_KEY || 
          env.GEMINI_API_KEY === 'your_gemini_api_key_here' || 
          env.GEMINI_API_KEY.includes('placeholder') || 
          env.GEMINI_API_KEY.startsWith('your_')
        ) {
          throw new Error('Gemini API key is missing or set to a placeholder. Please configure a valid GEMINI_API_KEY in the backend .env file.');
        }

        // Generate question paper via AI
        const result = await generateQuestionPaper({
          title,
          subject,
          className,
          questionTypes,
          additionalInstructions,
        });

        // Save result to MongoDB
        const updated = await Assignment.findByIdAndUpdate(
          assignmentId,
          {
            status: 'completed',
            result,
          },
          { new: true }
        );

        // Cache the result in Redis
        await setCache(
          `assignment:result:${assignmentId}`,
          JSON.stringify(updated)
        );

        // Notify frontend via WebSocket
        broadcastToAssignment(assignmentId, {
          type: 'status',
          assignmentId,
          status: 'completed',
          result: updated,
        });

        console.log(`✅ Job ${job.id} completed for assignment ${assignmentId}`);
        return { success: true, assignmentId };
      } catch (error: any) {
        console.error(`❌ Job ${job.id} failed:`, error.message);

        // Update status to failed
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        broadcastToAssignment(assignmentId, {
          type: 'status',
          assignmentId,
          status: 'failed',
          error: error.message,
        });

        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Worker: Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Worker: Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('⚠️ BullMQ worker error (non-fatal):', err.message);
  });

  console.log('✅ BullMQ worker started');
  return worker;
}
