import { SyncFlow, WorkflowBuilder } from '../src/index';

async function main() {
    console.log('🤖 Initializing SyncFlow SDK Bot...');

    // 1. Initialize Client
    const client = new SyncFlow({
        apiKey: 'test-api-key',
        baseUrl: 'http://localhost:3001'
    });

    try {
        // 2. Create Agent
        console.log('Creating Agent...');
        // Note: In a real test we'd hit the API. Here we might fail if backend isn't running
        // so we'll wrap in try/catch to show the intent.

        // const agent = await client.agents.create({
        //     name: 'SDK Bot',
        //     type: 'TRADING'
        // });
        // console.log('Agent Created:', agent.id);

        // 3. Build Workflow locally
        console.log('Building Workflow...');
        const workflow = new WorkflowBuilder('Arbitrage Strategy')
            .addStep('CONDITION', { type: 'PRICE_ABOVE', token: 'CRO', value: 0.50 })
            .addDelay(5000)
            .addAction('agent-123', 'SWAP', { tokenIn: 'CRO', tokenOut: 'USDC' })
            .build();

        console.log('Workflow Built:', JSON.stringify(workflow, null, 2));

        if (workflow.steps.length === 3) {
            console.log('✅ SDK Verification Passed: WorkflowBuilder works!');
        } else {
            console.error('❌ SDK Verification Failed: Steps mismatch');
        }

    } catch (e) {
        console.error('SDK Runtime Error:', e);
    }
}

main();
