import { Response } from 'express';
import { WorkflowsService } from '../services/workflows.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class WorkflowsController {
    static async createWorkflow(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const workflow = await WorkflowsService.createWorkflow(req.user.id, req.body);
            res.status(201).json(workflow);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getWorkflows(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const workflows = await WorkflowsService.getWorkflows(req.user.id);
            res.status(200).json(workflows);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getWorkflowById(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const workflow = await WorkflowsService.getWorkflowById(req.user.id, req.params.id);
            res.status(200).json(workflow);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    static async updateWorkflow(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const workflow = await WorkflowsService.updateWorkflow(req.user.id, req.params.id, req.body);
            res.status(200).json(workflow);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async deleteWorkflow(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const result = await WorkflowsService.deleteWorkflow(req.user.id, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}
