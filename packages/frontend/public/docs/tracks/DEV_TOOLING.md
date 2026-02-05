# Developer Tooling Track

## Overview

SyncFlow Protocol provides a comprehensive developer tooling suite that makes it easy to build, test, and deploy autonomous DeFi agents. Our tools span TypeScript SDK, MCP servers for AI integration, testing frameworks, and extensive documentation.

## 1. TypeScript SDK

**Package**: `@syncflow/sdk`  
**Location**: `packages/sdk/`

### Features

#### Fluent Agent Client
```typescript
import { SyncFlow } from '@syncflow/sdk';

const client = new SyncFlow({ apiKey: 'key' });
const agent = await client.agents.create({ name: 'Bot', type: 'TRADING' });
```

#### Workflow Builder
Declarative API for complex workflows:
```typescript
import { WorkflowBuilder } from '@syncflow/sdk';

const workflow = new WorkflowBuilder('Strategy')
    .addStep('CONDITION', { type: 'PRICE_ABOVE', value: 0.5 })
    .addDelay(5000)
    .addAction(agentId, 'SWAP', { tokenIn: 'CRO', tokenOut: 'USDC' })
    .build();
```

#### Type Safety
Full TypeScript support with exported types:
```typescript
import { Agent, Workflow, SyncFlowConfig } from '@syncflow/sdk';
```

#### Auto-Generated Declarations
```bash
npm run build  # Generates .d.ts files
```

**Documentation**: [SDK Guide](../SDK_GUIDE.md)

## 2. Model Context Protocol (MCP) Servers

MCP is the emerging standard for connecting AI models to data sources. SyncFlow implements 4 specialized servers.

### Portfolio Server
Exposes agent portfolio data to LLMs:

```json
// Request
{ "method": "tools/call", "params": { "name": "get_agent_portfolio", "arguments": { "agentId": "123" } } }

// Response
{
  "balances": [
    { "token": "CRO", "amount": "100.5" },
    { "token": "USDC", "amount": "50.0" }
  ],
  "positions": []
}
```

**Implementation**: `packages/mcp-servers/src/servers/PortfolioServer.ts`

### Transaction Monitor Server
Real-time transaction history for agents:

```json
{ "name": "get_recent_transactions", "arguments": { "agentId": "123" } }
```

Returns transaction hashes, types, amounts, and statuses.

**Implementation**: `packages/mcp-servers/src/servers/TransactionMonitorServer.ts`

### Protocol Indexer Server
Search across protocol data:

```json
{ "name": "search_protocol_data", "arguments": { "query": "TVL" } }
```

**Implementation**: `packages/mcp-servers/src/servers/ProtocolIndexerServer.ts`

### Market Data Bridge
Price feeds for AI decision making:

```json
{ "name": "get_token_price", "arguments": { "symbol": "CRO" } }
// Returns: { "symbol": "CRO", "price_usd": 0.10 }
```

**Implementation**: `packages/mcp-servers/src/servers/MarketDataBridgeServer.ts`

### MCP Usage Example

```bash
# Start MCP server
cd packages/mcp-servers
npm run dev

# Test via stdio
cd packages/backend
npx tsx scripts/test-mcp.ts
```

The test script spawns the server, sends JSON-RPC requests, and validates responses.

## 3. Testing Framework

### Unit Tests Scripts

**Core Services Test**:
```bash
npx tsx scripts/test-core-services.ts
```
Validates: Agent Orchestrator, Decision Engine, Risk Manager

**Workflow Test**:
```bash
npx tsx scripts/test-workflow.ts
```
Validates: Multi-step workflow execution

**Blockchain Test**:
```bash
npx tsx scripts/test-blockchain.ts
```
Validates: Cronos connectivity, wallet generation, balance queries

**MCP Test**:
```bash
npx tsx scripts/test-mcp.ts
```
Validates: MCP server stdio transport, tool calls

### Example Test Output

```
Testing Agent Orchestrator...
Agent State Fetch: OK
Decision Making: SWAP 1 TCRO for USDC
Risk Validation: APPROVED
Mock Execution: SUCCESS
Transaction Recorded: a1b2c3d4
```

## 4. Comprehensive Documentation

### Guides
- [Installation Guide](../INSTALLATION.md): Step-by-step setup
- [Architecture Overview](../ARCHITECTURE.md): System design with Mermaid diagrams
- [SDK Guide](../SDK_GUIDE.md): SDK usage and examples

### API Reference
Type definitions in code serve as living documentation:
```typescript
/**
 * Creates a new autonomous agent
 * @param data - Agent configuration
 * @returns Created agent with wallet address
 */
async create(data: Partial<Agent>): Promise<Agent>
```

### Track Submissions
- [Main Track](./MAIN_TRACK.md): Autonomous agents
- [Agentic Finance](./AGENTIC_FINANCE.md): x402 and workflows
- [Ecosystem](./ECOSYSTEM.md): Protocol integrations
- This document: Developer tooling

## 5. Developer Experience Features

### Hot Reload
Development servers support hot reload:
```bash
npm run dev:backend  # Nodemon watches for changes
npm run dev:frontend # Next.js Fast Refresh
```

### Environment Templates
```bash
packages/backend/.env.example
packages/frontend/.env.example
```

### Monorepo Architecture
Clean package separation:
- Independent versioning
- Shared TypeScript configuration
- Centralized dependency management

### Error Messages
Descriptive errors with actionable messages:
```
Risk Validation Failed: Transaction amount 1000 exceeds maxTransactionAmount 500
```

## Why This Wins

1. **Complete SDK**: Not just API wrappers, but developer-friendly abstractions (WorkflowBuilder)
2. **MCP Innovation**: First DeFi protocol with comprehensive MCP integration
3. **Testing First**: Comprehensive test scripts for every component
4. **Documentation Quality**: Architecture diagrams, code examples, track submissions
5. **TypeScript Native**: Full type safety from SDK to backend

## Developer Onboarding Time

**From zero to first agent**: Under 10 minutes
1. Clone repo (1 min)
2. Install dependencies (2 min)
3. Set up database (2 min)
4. Run backend (1 min)
5. Create agent via SDK (instant)

**From zero to custom integration**: Under 30 minutes
1. Copy existing integration file
2. Modify for new protocol
3. Import in orchestrator
4. Test with workflow

## Future Tooling Enhancements

- Interactive CLI for agent management
- Visual workflow builder (drag-and-drop in frontend)
- VSCode extension for SDK autocomplete
- Postman collection for API
- Docker Compose for one-command setup
- GitHub Actions CI/CD template

## Links

- [SDK Source](../../packages/sdk/src)
- [MCP Servers](../../packages/mcp-servers/src)
- [Test Scripts](../../packages/backend/scripts)
- [SDK Guide](../SDK_GUIDE.md)
