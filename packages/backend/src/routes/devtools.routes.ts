import { Router } from 'express';
import { DevToolsController } from '../controllers/devtools.controller';

const router = Router();

router.get('/status', DevToolsController.getStatus);
router.get('/config', DevToolsController.getConfig);

export default router;
