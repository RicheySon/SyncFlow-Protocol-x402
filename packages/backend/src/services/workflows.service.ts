import { prisma } from '../lib/prisma';
import { z } from 'zod';

const createWorkflowSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    steps: z.string(), // JSON string of workflow steps
    trigger: z.string().optional(),
});

const updateWorkflowSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['draft', 'active', 'completed']).optional(),
    steps: z.string().optional(),
    trigger: z.string().optional(),
});

export class WorkflowsService {
    static async createWorkflow(userId: string, data: z.infer<typeof createWorkflowSchema>) {
        const validated = createWorkflowSchema.parse(data);

        const workflow = await prisma.workflow.create({
            data: {
                ...validated,
                userId,
            },
        });

        return workflow;
    }

    static async getWorkflows(userId: string) {
        const workflows = await prisma.workflow.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return workflows;
    }

    static async getWorkflowById(userId: string, workflowId: string) {
        const workflow = await prisma.workflow.findFirst({
            where: {
                id: workflowId,
                userId,
            },
        });

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        return workflow;
    }

    static async updateWorkflow(userId: string, workflowId: string, data: z.infer<typeof updateWorkflowSchema>) {
        const validated = updateWorkflowSchema.parse(data);

        // Verify ownership
        const existingWorkflow = await prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });

        if (!existingWorkflow) {
            throw new Error('Workflow not found');
        }

        const updatedWorkflow = await prisma.workflow.update({
            where: { id: workflowId },
            data: validated,
        });

        return updatedWorkflow;
    }

    static async deleteWorkflow(userId: string, workflowId: string) {
        // Verify ownership
        const existingWorkflow = await prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });

        if (!existingWorkflow) {
            throw new Error('Workflow not found');
        }

        await prisma.workflow.delete({
            where: { id: workflowId },
        });

        return { message: 'Workflow deleted successfully' };
    }
}
