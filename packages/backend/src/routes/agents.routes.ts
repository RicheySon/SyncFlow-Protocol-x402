import { Router } from 'express';
import { AgentsController } from '../controllers/agents.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', AgentsController.createAgent);
router.get('/', AgentsController.getAgents);
router.get('/:id', AgentsController.getAgentById);
router.put('/:id', AgentsController.updateAgent);
router.delete('/:id', AgentsController.deleteAgent);

export { router as agentsRoutes };
