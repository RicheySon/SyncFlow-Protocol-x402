import { Response } from 'express';
import { AgentsService } from '../services/agents.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AgentsController {
    static async createAgent(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const agent = await AgentsService.createAgent(req.user.id, req.body);
            res.status(201).json(agent);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getAgents(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const agents = await AgentsService.getAgents(req.user.id);
            res.status(200).json(agents);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getAgentById(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const agent = await AgentsService.getAgentById(req.user.id, req.params.id);
            res.status(200).json(agent);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    static async updateAgent(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const agent = await AgentsService.updateAgent(req.user.id, req.params.id, req.body);
            res.status(200).json(agent);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async deleteAgent(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const result = await AgentsService.deleteAgent(req.user.id, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}
