import express from 'express';
import http from 'http';
import path from 'path';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';

const require = createRequire(import.meta.url);
const { app, initServer } = require('./backend/server.js');
const { initSocket } = require('./backend/utils/socket.js');

async function startServer() {
  console.log('[Applet] Initializing database and backend services...');
  try {
    await initServer();
    console.log('[Applet] Database and initial seed completed.');
  } catch (err: any) {
    console.error('[Applet] Warning during database init:', err?.message || err);
  }

  const PORT = 3000;
  const httpServer = http.createServer(app);

  // Initialize Socket.IO on the unified HTTP server
  initSocket(httpServer);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FoodieHub Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Applet] Fatal error starting server:', err);
});
