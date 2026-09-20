import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase, isMongoAtlasActive } from './server/db.js';
import authRoutes from './server/routes/auth.js';
import usersRoutes from './server/routes/users.js';
import itemsRoutes from './server/routes/items.js';
import connectionsRoutes from './server/routes/connections.js';
import chatRoutes from './server/routes/chat.js';
import statsRoutes from './server/routes/stats.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database (Atlas connection check + local persistent store cache)
  await initDatabase();

  // Configure CORS
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matching allowed origins
      if (!origin || origin === clientUrl || origin.includes('localhost') || origin.includes('run.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/preview
      }
    },
    credentials: true,
  }));

  // Body parser with 10MB limit for base64 photo uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health Check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CampusConnect API',
      database: isMongoAtlasActive() ? 'MongoDB Atlas' : 'Local Persistent Store (MongoDB compatible)',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/items', itemsRoutes);
  app.use('/api/connections', connectionsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/stats', statsRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusConnect] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CampusConnect] Fatal startup error:', err);
  process.exit(1);
});
