import http from 'http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { config } from './config/env';
import { connectRedis, disconnectRedis } from './config/redis';
import { startAllJobs } from './jobs/jobs';

async function bootstrap(): Promise<void> {
  // 1. Connect infrastructure
  await connectDatabase();
  await connectRedis();

  // 2. Create Express app
  const app = createApp();

  // 3. Create HTTP server
  const server = http.createServer(app);

  // 4. Start listening
  server.listen(config.port, () => {
    console.log(`[Server] MiniFlicks backend running on port ${config.port} (${config.nodeEnv})`);
  });

  // 5. Start background jobs
  startAllJobs();

  // ─── Graceful shutdown ────────────────────────────────────────────────────────

  async function shutdown(signal: string): Promise<void> {
    console.log(`\n[Server] ${signal} received — shutting down gracefully...`);

    server.close(async () => {
      console.log('[Server] HTTP server closed');
      await disconnectDatabase();
      await disconnectRedis();
      console.log('[Server] Shutdown complete');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[Server] Graceful shutdown timeout — forcing exit');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('[Server] Unhandled promise rejection:', reason);
    // Don't crash in development; crash in production to allow restart
    if (config.isProduction) process.exit(1);
  });

  process.on('uncaughtException', (err: Error) => {
    console.error('[Server] Uncaught exception:', err.message, err.stack);
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  console.error('[Server] Bootstrap failed:', err);
  process.exit(1);
});
