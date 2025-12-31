import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';

import { authRoutes } from './routes/auth.routes';
import { agentsRoutes } from './routes/agents.routes';
import { workflowsRoutes } from './routes/workflows.routes';
import { transactionsRoutes } from './routes/transactions.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/agents', agentsRoutes);
app.use('/workflows', workflowsRoutes);
app.use('/transactions', transactionsRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: env.NODE_ENV,
    });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Unhandled Error]', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
});

export { app };
