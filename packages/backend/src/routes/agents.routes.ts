import { Router } from 'express';
import { AgentsController } from '../controllers/agents.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { x402Middleware } from '../middlewares/x402';
import { handleChat } from '../controllers/chat.controller';

const router = Router();

// Protected Interaction Endpoint (x402 Payment Required) - access via payment, not JWT
router.post('/interaction', x402Middleware, handleChat);

// All routes below require authentication
router.use(authenticate);

router.post('/', AgentsController.createAgent);
router.get('/', AgentsController.getAgents);
router.get('/:id', AgentsController.getAgentById);
router.put('/:id', AgentsController.updateAgent);
router.delete('/:id', AgentsController.deleteAgent);

export { router as agentsRoutes };
