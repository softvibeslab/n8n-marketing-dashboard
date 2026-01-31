/**
 * ===========================================
 * n8n Marketing Dashboard - Server Entry Point
 * ===========================================
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth.routes';
import strategyRoutes from './routes/strategy.routes';
import workflowRoutes from './routes/workflow.routes';
import assetRoutes from './routes/asset.routes';
import campaignRoutes from './routes/campaign.routes';
import analyticsRoutes from './routes/analytics.routes';
import assistantRoutes from './routes/assistant.routes';
import n8nRoutes from './routes/n8n.routes';
import healthRoutes from './routes/health.routes';

/**
 * Create and configure Express application
 */
function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  if (config.env !== 'test') {
    app.use(
      morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      })
    );
  }

  // Health check (before rate limiting)
  app.use('/health', healthRoutes);

  // Rate limiting
  app.use('/api', rateLimiter);

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/strategy', authMiddleware, strategyRoutes);
  app.use('/api/v1/workflows', authMiddleware, workflowRoutes);
  app.use('/api/v1/assets', authMiddleware, assetRoutes);
  app.use('/api/v1/campaigns', authMiddleware, campaignRoutes);
  app.use('/api/v1/analytics', authMiddleware, analyticsRoutes);
  app.use('/api/v1/assistant', authMiddleware, assistantRoutes);
  app.use('/api/v1/n8n', authMiddleware, n8nRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Initialize WebSocket server
 */
function initializeWebSocket(httpServer: ReturnType<typeof createServer>): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    path: config.websocket.path,
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  // Authentication middleware for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Token validation would happen here
    // For now, allow connection (to be implemented with JWT validation)
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('join-workflow', (workflowId: string) => {
      socket.join(`workflow:${workflowId}`);
      logger.info(`Client ${socket.id} joined workflow ${workflowId}`);
    });

    socket.on('leave-workflow', (workflowId: string) => {
      socket.leave(`workflow:${workflowId}`);
      logger.info(`Client ${socket.id} left workflow ${workflowId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    const app = createApp();
    const httpServer = createServer(app);
    const io = initializeWebSocket(httpServer);

    httpServer.listen(config.port, config.host, () => {
      logger.info(`Server listening on http://${config.host}:${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`WebSocket path: ${config.websocket.path}`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      httpServer.close(() => {
        logger.info('HTTP server closed');
        io.close(() => {
          logger.info('WebSocket server closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if not in test mode
if (config.env !== 'test') {
  startServer();
}

export { createApp, initializeWebSocket };
