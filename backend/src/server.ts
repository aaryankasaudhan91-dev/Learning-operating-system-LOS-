import {setupWebsite} from './website';
import dotenv from 'dotenv';
import {createServer} from 'node:http';
import path from 'node:path';
import mongoose from 'mongoose';
import {createApp} from './app';
import {attachRealtime} from './realtime';
import {connectDatabase} from './database';

dotenv.config();
export * from './models';

async function start() {
  const http = createServer();
  let io: ReturnType<typeof attachRealtime>;
  const app = createApp({beforeRoutes: application => {io = attachRealtime(application, http)}});
  http.on('request', app);
  try {
    await connectDatabase();
    console.log('Database connected');
  } catch {
    // Connection errors may contain credentials; keep them out of public logs.
    await mongoose.disconnect();
    console.error('Configured MongoDB unavailable. Database-backed APIs return 503; no fallback or seed data is used.');
  }
  if (process.env.NODE_ENV === 'production') {
    setupWebsite(app, path.resolve(process.env.WEB_PORTAL_DIR || '../frontends/website/dist'));
  }
  const port = Number(process.env.PORT || 3000);
  http.listen(port, process.env.HOST || '127.0.0.1', () => console.log('Synapse API listening on ' + port));
  const shutdown = () => {
    io.close();
    http.close(() => {void mongoose.disconnect().finally(() => process.exit(0))});
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
void start().catch(() => {console.error('Server startup failed'); process.exitCode = 1});
