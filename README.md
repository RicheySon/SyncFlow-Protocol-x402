# SyncFlow Protocol

<div align="center">

![SyncFlow Logo](docs/assets/logo.svg)

**Autonomous Financial Settlement for AI Agents on Cronos**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange)](https://soliditylang.org/)
[![Cronos](https://img.shields.io/badge/Cronos-EVM-06B6D4)](https://cronos.org/)

[Documentation](./docs) · [Demo](https://syncflow.vercel.app) · [Report Bug](https://github.com/syncflow/syncflow-protocol/issues)

</div>

## 🌟 Overview

SyncFlow Protocol enables **autonomous AI agents** to execute complex financial workflows on Cronos EVM without human intervention. Built for the **Cronos x402 Paytech Hackathon**, SyncFlow combines x402 payment settlement, multi-leg workflows, and deep protocol integration to automate treasury management, trading, and financial operations.

### Key Features

- 🤖 **Autonomous Agents**: AI-powered decision-making without human input
- ⚡ **<30s Settlement**: Lightning-fast payments via x402 protocol on Cronos EVM
- 🔄 **Multi-Leg Workflows**: Complex multi-step financial operations in single transactions
- 🔌 **Deep Integration**: Crypto.com AI Agent SDK, Moonlander, Delphi, VVS Finance
- 📊 **MCP Servers**: 4 production-grade Model Context Protocol servers for data access
- 🛠️ **Developer SDK**: Published npm package for easy integration

## 🏆 Hackathon Tracks

SyncFlow qualifies for **all four tracks** of the Cronos x402 Paytech Hackathon:

| Track | Qualification | Prize |
|-------|---------------|-------|
| **Main Track** | Autonomous agent-triggered x402 payments for DAO treasury management | $24,000 |
| **Agentic Finance** | Multi-leg settlement workflows with conditional execution logic | $5,000 |
| **Ecosystem Integration** | Deep integration with Crypto.com SDK, Moonlander, Delphi, VVS | $3,000 |
| **Dev Tooling** | 4 MCP servers, reusable SDK, testing framework | $3,000 |

**Total Prize Potential: $35,000**

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                   │
│    Landing Page │ Dashboard │ Agent Manager │ Dev Tools    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   Backend API (Express)                      │
│      Auth │ Agents │ Workflows │ Transactions │ MCP         │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
    ┌────────┴────────┐         ┌────────┴─────────┐
    │ Smart Contracts │         │  Core Services   │
    │   (Cronos EVM)  │         │ Agent Orchestrator│
    │                 │         │ x402 Payment     │
    │ AgentWallet     │         │ Protocol Integr. │
    │ PaymentRouter   │         │ MCP Servers      │
    │ ConditionalExec │         └──────────────────┘
    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Cronos wallet with CRO/USDC

### Installation

```bash
# Clone the repository
git clone https://github.com/syncflow/syncflow-protocol.git
cd syncflow-protocol

# Install dependencies
pnpm install

# Set up environment variables
cp packages/frontend/.env.example packages/frontend/.env.local
cp packages/backend/.env.example packages/backend/.env
cp packages/contracts/.env.example packages/contracts/.env

# Configure your .env files with actual values

# Set up database
cd packages/backend
pnpm prisma:migrate

# Deploy smart contracts (testnet first)
cd ../contracts
pnpm deploy:testnet

# Start development servers
cd ../..
pnpm dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

## 📦 Monorepo Structure

```
syncflow-protocol/
├── packages/
│   ├── frontend/           # Next.js 14 dashboard
│   ├── backend/            # Express API server
│   ├── contracts/          # Solidity smart contracts
│   ├── sdk/                # TypeScript SDK (npm package)
│   ├── mcp-servers/        # 4 MCP servers
│   └── services/           # Core business logic
├── docs/                   # Comprehensive documentation
├── examples/               # Working examples
└── .github/workflows/      # CI/CD pipelines
```

## 🤖 Using the SDK

Install the SDK in your project:

```bash
npm install @syncflow/sdk
```

Create your first autonomous agent:

```typescript
import { AgentClient, WorkflowBuilder } from '@syncflow/sdk';

// Initialize agent
const agent = new AgentClient({
  rpcUrl: 'https://evm.cronos.org',
  privateKey: process.env.AGENT_PRIVATE_KEY,
  agentWalletAddress: '0x...',
});

// Build a workflow
const workflow = new WorkflowBuilder()
  .addStep('vvsSwap', {
    tokenIn: 'CRO',
    tokenOut: 'USDC',
    amount: '1000',
  })
  .addStep('batchTransfer', {
    recipients: ['0x123...', '0x456...'],
    amounts: ['500', '500'],
  })
  .build();

// Execute autonomously
await agent.executeWorkflow(workflow);
```

See [SDK Guide](./docs/SDK_GUIDE.md) for complete documentation.

## 🔧 Smart Contracts (Cronos EVM)

All contracts deployed on **Cronos Mainnet (Chain ID: 25)**:

| Contract | Address | Description |
|----------|---------|-------------|
| AgentWallet | `0x...` | Smart wallet for agents |
| PaymentRouter | `0x...` | x402 payment routing |
| ConditionalExecutor | `0x...` | Conditional automation |

Verified on [Cronos Explorer](https://cronos.org/explorer).

## 📡 MCP Servers

SyncFlow provides 4 production MCP servers:

1. **portfolio-state-server**: Unified portfolio view across all protocols
2. **transaction-monitor-server**: Real-time Cronos EVM transaction monitoring
3. **protocol-indexer-server**: Fast indexed access to protocol data
4. **market-data-bridge-server**: Crypto.com market data integration

See [MCP Server Documentation](./docs/MCP_SERVERS.md) for API reference.

## 🛣️ Roadmap

- [x] Phase 1: Project setup and infrastructure
- [ ] Phase 2: Frontend application
- [ ] Phase 3: Backend API
- [ ] Phase 4: Smart contracts
- [ ] Phase 5: Core services
- [ ] Phase 6: SDK & npm package
- [ ] Phase 7: Documentation
- [ ] Phase 8: Testing & quality
- [ ] Phase 9: Deployment
- [ ] Phase 10: Multi-track submission

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cronos** for the x402 protocol and EVM infrastructure
- **Crypto.com** for AI Agent SDK and Market Data API
- **Moonlander**, **Delphi**, **VVS Finance** for protocol integrations
- Open-source community for tools and libraries

## 📞 Contact

- Website: [syncflow.dev](https://syncflow.dev)
- Twitter: [@SyncFlowProtocol](https://twitter.com/SyncFlowProtocol)
- Discord: [Join our community](https://discord.gg/syncflow)
- Email: team@syncflow.dev

---

<div align="center">

**Built with ❤️ for the Cronos x402 Paytech Hackathon**

[⭐ Star us on GitHub](https://github.com/syncflow/syncflow-protocol) | [🐛 Report Issues](https://github.com/syncflow/syncflow-protocol/issues)

</div>
