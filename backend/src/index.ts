import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initWebSocket } from './websocket/ws';
import { startWorker } from './queue/worker';
import { errorHandler } from './middleware/errorHandler';
import assignmentRoutes from './routes/assignments';

async function main() {
  // Connect to MongoDB
  await connectDB();

  const app = express();
  const server = createServer(app);

  // Middleware — flexible CORS
  const corsOrigin =
    env.NODE_ENV !== 'production'
      ? true                                       // allow any origin in dev
      : env.FRONTEND_URL.split(',').map(s => s.trim()); // comma-separated whitelist in prod

  app.use(cors({
    origin: corsOrigin,
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));

  // Routes
  app.use('/api/assignments', assignmentRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler
  app.use(errorHandler);

  // Initialize WebSocket
  initWebSocket(server);

  // Start BullMQ worker (non-fatal if Redis is down)
  try {
    startWorker();
  } catch (err: any) {
    console.warn('⚠️ BullMQ worker failed to start (non-fatal):', err.message);
  }

  // Start server
  server.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📡 WebSocket on ws://localhost:${env.PORT}/ws`);
  });
}

main().catch(console.error);
