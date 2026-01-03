import { WorkflowExecutor } from '../src/services/core/WorkflowExecutor';
import { prisma } from '../src/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log('⛓️ Testing Workflow Executor...');

    // 1. Find a user and agent
    const user = await prisma.user.findFirst();
    const agent = await prisma.agent.findFirst();

    if (!user || !agent) {
        console.error('❌ User or Agent not found. Run seed script.');
        process.exit(1);
    }

    // 2. Create a Test Workflow
    const steps = [
        {
            id: 'step-1',
            type: 'DELAY',
            params: { durationMs: 500 }
        },
        {
            id: 'step-2',
            type: 'ACTION',
            targetAgentId: agent.id,
            actionType: 'SWAP',
            params: { tokenIn: 'TCRO', tokenOut: 'USDC' }
        }
    ];

    const workflow = await prisma.workflow.create({
        data: {
            id: uuidv4(),
            name: 'Test Workflow',
            userId: user.id,
            status: 'draft',
            steps: JSON.stringify(steps)
        }
    });

    console.log(`✅ Created Workflow: ${workflow.id}`);

    // 3. Execute
    console.log('▶️ Executing...');
    await WorkflowExecutor.executeWorkflow(workflow.id);

    // 4. Verify completion
    const updated = await prisma.workflow.findUnique({ where: { id: workflow.id } });
    console.log(`🏁 Final Status: ${updated?.status}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
