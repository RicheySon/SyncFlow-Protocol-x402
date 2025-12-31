import { Response } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class TransactionsController {
    static async getTransactions(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const filters = {
                status: req.query.status as string | undefined,
                type: req.query.type as string | undefined,
            };

            const transactions = await TransactionsService.getTransactions(req.user.id, filters);
            res.status(200).json(transactions);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getTransactionById(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const transaction = await TransactionsService.getTransactionById(req.user.id, req.params.id);
            res.status(200).json(transaction);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    static async getTransactionsByAgent(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const transactions = await TransactionsService.getTransactionsByAgent(
                req.user.id,
                req.params.agentId
            );
            res.status(200).json(transactions);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}
