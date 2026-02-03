import { WorkflowExecutor } from '../../../src/services/core/WorkflowExecutor';
import { prisma } from '../../../src/lib/prisma';
import { AgentOrchestrator } from '../../../src/services/core/AgentOrchestrator';

jest.mock('../../../src/lib/prisma', () => ({
    prisma: {
        workflow: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock('../../../src/services/core/AgentOrchestrator');

describe('WorkflowExecutor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('executeWorkflow', () => {
        it('should execute workflow with multiple steps', async () => {
            const mockWorkflow = {
                id: 'workflow-123',
                steps: JSON.stringify({
                    steps: [
                        {
                            id: 'step-1',
                            type: 'ACTION',
                            targetAgentId: 'agent-1',
                            actionType: 'SWAP',
                        },
                        {
                            id: 'step-2',
                            type: 'DELAY',
                            params: { durationMs: 100 }, // Reduced delay for faster tests
                        },
                        {
                            id: 'step-3',
                            type: 'ACTION',
                            targetAgentId: 'agent-2',
                            actionType: 'TRANSFER',
                        },
                    ],
                }),
            };

            (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
            (prisma.workflow.update as jest.Mock).mockResolvedValue({});
            (AgentOrchestrator.executeCycle as jest.Mock).mockResolvedValue(undefined);

            const executePromise = WorkflowExecutor.executeWorkflow('workflow-123');

            // Fast-forward timers for DELAY step
            await jest.advanceTimersByTimeAsync(100);

            await executePromise;

            expect(prisma.workflow.findUnique).toHaveBeenCalledWith({ where: { id: 'workflow-123' } });
            expect(AgentOrchestrator.executeCycle).toHaveBeenCalledWith('agent-1');
            expect(AgentOrchestrator.executeCycle).toHaveBeenCalledWith('agent-2');
            expect(prisma.workflow.update).toHaveBeenCalledWith({
                where: { id: 'workflow-123' },
                data: { status: 'completed' },
            });
        }, 10000);

        it('should handle workflow not found', async () => {
            (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

            // The executor doesn't throw on missing workflow, it just returns
            await WorkflowExecutor.executeWorkflow('invalid-id');

            expect(prisma.workflow.update).not.toHaveBeenCalled();
        });

        it('should handle invalid JSON in steps', async () => {
            const mockWorkflow = {
                id: 'workflow-123',
                steps: 'invalid-json{',
            };

            (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

            await WorkflowExecutor.executeWorkflow('workflow-123');

            expect(prisma.workflow.update).not.toHaveBeenCalled();
        });

        it('should handle array-only steps format', async () => {
            const mockWorkflow = {
                id: 'workflow-123',
                steps: JSON.stringify([
                    {
                        id: 'step-1',
                        type: 'ACTION',
                        targetAgentId: 'agent-1',
                        actionType: 'SWAP',
                    },
                ]),
            };

            (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
            (prisma.workflow.update as jest.Mock).mockResolvedValue({});
            (AgentOrchestrator.executeCycle as jest.Mock).mockResolvedValue(undefined);

            await WorkflowExecutor.executeWorkflow('workflow-123');

            expect(AgentOrchestrator.executeCycle).toHaveBeenCalledWith('agent-1');
            expect(prisma.workflow.update).toHaveBeenCalled();
        });

        it('should skip unknown step types', async () => {
            const mockWorkflow = {
                id: 'workflow-123',
                steps: JSON.stringify({
                    steps: [
                        {
                            id: 'step-1',
                            type: 'UNKNOWN_TYPE',
                        },
                    ],
                }),
            };

            (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
            (prisma.workflow.update as jest.Mock).mockResolvedValue({});

            await WorkflowExecutor.executeWorkflow('workflow-123');

            expect(AgentOrchestrator.executeCycle).not.toHaveBeenCalled();
            expect(prisma.workflow.update).toHaveBeenCalledWith({
                where: { id: 'workflow-123' },
                data: { status: 'completed' },
            });
        });

        it('should handle DELAY step with custom duration', async () => {
            const mockWorkflow = {
                id: 'workflow-123',
                steps: JSON.stringify({
                    steps: [
                        {
                            id: 'step-1',
                            type: 'DELAY',
                            params: { durationMs: 200 }, // Reduced for faster tests
                        },
                    ],
                }),
            };

            (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
            (prisma.workflow.update as jest.Mock).mockResolvedValue({});

            const executePromise = WorkflowExecutor.executeWorkflow('workflow-123');

            await jest.advanceTimersByTimeAsync(200);

            await executePromise;

            expect(prisma.workflow.update).toHaveBeenCalled();
        }, 10000);
    });
});
