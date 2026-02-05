# SDK Guide

## Installation

```bash
npm install @syncflow/sdk
```

## Quick Start

### Initialize the Client

```typescript
import { SyncFlow } from '@syncflow/sdk';

const client = new SyncFlow({
    apiKey: 'your-api-key',
    baseUrl: 'https://api.syncflow.protocol' // or http://localhost:3001 for local
});
```

### Create an Agent

```typescript
const agent = await client.agents.create({
    name: 'My Trading Bot',
    type: 'TRADING'
});

console.log('Agent created:', agent.id);
console.log('Wallet address:', agent.walletAddress);
```

### List Agents

```typescript
const agents = await client.agents.list();
console.log('Total agents:', agents.length);
```

### Get Agent Details

```typescript
const agent = await client.agents.get('agent-id-here');
console.log(agent);
```

## Building Workflows

Use the `WorkflowBuilder` to create complex multi-step workflows:

```typescript
import { WorkflowBuilder } from '@syncflow/sdk';

const workflow = new WorkflowBuilder('Arbitrage Strategy')
    .addStep('CONDITION', { 
        type: 'PRICE_ABOVE', 
        token: 'CRO', 
        value: 0.50 
    })
    .addDelay(5000) // Wait 5 seconds
    .addAction('agent-id', 'SWAP', { 
        tokenIn: 'CRO', 
        tokenOut: 'USDC',
        amount: '100'
    })
    .build();

console.log(workflow);
// {
//   name: 'Arbitrage Strategy',
//   steps: [...]
// }
```

### Workflow Builder Methods

#### `addStep(type, params)`
Add a generic step to the workflow.

**Parameters:**
- `type`: `'ACTION' | 'CONDITION' | 'DELAY'`
- `params`: Step-specific parameters

#### `addDelay(ms)`
Convenience method to add a delay step.

**Parameters:**
- `ms`: Milliseconds to delay

#### `addAction(agentId, actionType, params)`
Convenience method to add an action step.

**Parameters:**
- `agentId`: ID of the agent to execute the action
- `actionType`: Type of action (e.g., 'SWAP', 'TRANSFER')
- `params`: Action-specific parameters

#### `build()`
Returns the final workflow object ready to submit to the API.

## Complete Example

```typescript
import { SyncFlow, WorkflowBuilder } from '@syncflow/sdk';

async function main() {
    // Initialize client
    const client = new SyncFlow({
        apiKey: process.env.SYNCFLOW_API_KEY,
        baseUrl: 'http://localhost:3001'
    });

    // Create an agent
    const agent = await client.agents.create({
        name: 'DCA Bot',
        type: 'TRADING'
    });

    console.log('Created agent:', agent.id);

    // Build a workflow
    const workflow = new WorkflowBuilder('Daily DCA')
        .addStep('CONDITION', {
            type: 'TIME_ELAPSED',
            seconds: 86400 // 24 hours
        })
        .addAction(agent.id, 'SWAP', {
            tokenIn: 'USDC',
            tokenOut: 'CRO',
            amount: '10'
        })
        .build();

    console.log('Workflow:', workflow);

    // In a real scenario, you would submit this workflow via the API
    // await client.workflows.create(workflow);
}

main();
```

## Advanced Usage

### Custom Headers

```typescript
const client = new SyncFlow({
    apiKey: 'your-key',
    baseUrl: 'https://api.syncflow.protocol',
    // axios config is exposed
});
```

### Error Handling

```typescript
try {
    const agent = await client.agents.get('invalid-id');
} catch (error) {
    if (error.response?.status === 404) {
        console.error('Agent not found');
    } else {
        console.error('API error:', error.message);
    }
}
```

## Type Definitions

The SDK exports TypeScript types for all entities:

```typescript
import { Agent, Workflow, SyncFlowConfig } from '@syncflow/sdk';

const config: SyncFlowConfig = {
    apiKey: 'key',
    baseUrl: 'url'
};

const agent: Agent = {
    id: '123',
    name: 'Bot',
    type: 'TRADING',
    status: 'ACTIVE'
};
```

## Next Steps

- Explore the [API Reference](./API_REFERENCE.md) for complete endpoint documentation
- Check the [examples](https://github.com/syncflow/syncflow-protocol/tree/main/packages/sdk/examples) for more use cases
- Join our [Discord](https://discord.gg/syncflow) for support
