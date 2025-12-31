import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', TransactionsController.getTransactions);
router.get('/:id', TransactionsController.getTransactionById);
router.get('/agent/:agentId', TransactionsController.getTransactionsByAgent);

export { router as transactionsRoutes };
