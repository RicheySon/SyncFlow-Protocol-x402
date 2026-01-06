import { Request, Response } from 'express';
import { CdcAgentService } from '../services/cdc-agent.service';

const agentService = new CdcAgentService();

export const handleChat = async (req: Request, res: Response) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        const response = await agentService.processMessage(message, context);

        res.status(200).json({
            response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
};
