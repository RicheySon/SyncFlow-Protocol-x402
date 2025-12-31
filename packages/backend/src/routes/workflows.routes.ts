import { Router } from 'express';
import { WorkflowsController } from '../controllers/workflows.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', WorkflowsController.createWorkflow);
router.get('/', WorkflowsController.getWorkflows);
router.get('/:id', WorkflowsController.getWorkflowById);
router.put('/:id', WorkflowsController.updateWorkflow);
router.delete('/:id', WorkflowsController.deleteWorkflow);

export { router as workflowsRoutes };
