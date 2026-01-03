import { prisma } from '../../lib/prisma';
import { WorkflowStep, WorkflowConfig } from '../../types/workflow.types';
import { AgentOrchestrator } from './AgentOrchestrator';
import logger from '../../utils/logger';

export class WorkflowExecutor {
    static async executeWorkflow(workflowId: string) {
        logger.info(`[WorkflowExecutor] Starting workflow ${workflowId}`);

        try {
            const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
            if (!workflow) throw new Error('Workflow not found');

            // Parse steps
            let config: WorkflowConfig;
            try {
                // Handle case where steps might be just an array string or nested object
                const parsed = JSON.parse(workflow.steps);
                config = Array.isArray(parsed) ? { steps: parsed } : parsed;
            } catch (e) {
                logger.error(`[WorkflowExecutor] Invalid workflow steps format for ${workflowId}`, e);
                return;
            }

            logger.info(`[WorkflowExecutor] Found ${config.steps.length} steps`);

            for (const step of config.steps) {
                await this.executeStep(step);
            }

            // Update status
            await prisma.workflow.update({
                where: { id: workflowId },
                data: { status: 'completed' }
            });

            logger.info(`[WorkflowExecutor] Workflow ${workflowId} completed`);

        } catch (error) {
            logger.error(`[WorkflowExecutor] Error executing workflow ${workflowId}`, error);
        }
    }

    private static async executeStep(step: WorkflowStep) {
        logger.info(`[WorkflowExecutor] Executing step ${step.id} (${step.type})`);

        switch (step.type) {
            case 'ACTION':
                if (step.targetAgentId && step.actionType) {
                    // In a real system, we'd pass specific params to the Orchestrator
                    // For MVP, we trigger a cycle which uses the agent's internal logic
                    // OR we could expose a method to force a specific action.
                    // Let's assume we force a cycle for now.
                    logger.info(`[WorkflowExecutor] Triggering agent ${step.targetAgentId}`);
                    await AgentOrchestrator.executeCycle(step.targetAgentId);
                }
                break;

            case 'DELAY':
                const ms = step.params.durationMs || 1000;
                logger.info(`[WorkflowExecutor] Waiting ${ms}ms...`);
                await new Promise(resolve => setTimeout(resolve, ms));
                break;

            default:
                logger.warn(`[WorkflowExecutor] Unknown step type ${step.type}`);
        }
    }
}
