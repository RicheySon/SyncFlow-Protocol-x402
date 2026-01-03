# SyncFlow Protocol

**Autonomous DeFi Agents for Cronos zkEVM**

SyncFlow Protocol is a comprehensive framework for building, deploying, and managing autonomous DeFi agents on the Cronos blockchain. It combines AI-driven decision making with on-chain execution, x402 payment settlement, and Model Context Protocol (MCP) integration to enable sophisticated agentic finance workflows.

## Features

### Core Capabilities
- **Autonomous Agent Orchestration**: Self-executing agents with configurable risk management and AI decision engines
- **Multi-Step Workflow Automation**: Chain complex DeFi operations with conditional logic and delays
- **x402 Payment Protocol**: Batch optimization and settlement verification for efficient cross-chain payments
- **MCP Integration**: Expose portfolio data, transactions, and market information to AI models via standardized protocol

### Protocol Integrations
- **VVS Finance**: Live DEX swap quote integration on Cronos
- **Crypto.com AI Agents**: AI-powered market sentiment and predictions
- **Moonlander**: Perpetual futures positions (mock)
- **Delphi**: On-chain prediction markets (mock)

### Developer Tools
- **TypeScript SDK**: Easy-to-use client library for building on SyncFlow
- **Workflow Builder**: Fluent API for creating complex agent workflows
- **MCP Servers**: Portfolio aggregation, transaction monitoring, protocol indexing, and market data feeds

## Tech Stack

**Frontend**: Next.js 14, React, TailwindCSS, Shadcn/UI  
**Backend**: Express.js, Prisma ORM, PostgreSQL  
**Blockchain**: Ethers.js v6, Cronos zkEVM Testnet  
**Agent System**: TypeScript, Custom Orchestrator, Risk Manager  
**MCP**: Model Context Protocol SDK, stdio transport  
**SDK**: Axios, Zod validation

## Project Structure

```
SyncFlow-Protocol-x402/
├── packages/
│   ├── frontend/          # Next.js dashboard
│   ├── backend/           # Express API + Agent logic
│   ├── sdk/               # TypeScript SDK for developers
│   ├── mcp-servers/       # MCP protocol servers
│   └── contracts/         # Smart contracts (future)
├── docs/                  # Documentation
└── README.md
```

## Quick Start

See [INSTALLATION.md](./docs/INSTALLATION.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# Run database migrations
cd packages/backend && npx prisma migrate dev

# Start backend
npm run dev:backend

# Start frontend (in another terminal)
npm run dev:frontend
```

## Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [SDK Guide](./docs/SDK_GUIDE.md)

### Hackathon Tracks

- [Main Track: Autonomous Agents](./docs/tracks/MAIN_TRACK.md)
- [Agentic Finance](./docs/tracks/AGENTIC_FINANCE.md)
- [Ecosystem Integration](./docs/tracks/ECOSYSTEM.md)
- [Developer Tooling](./docs/tracks/DEV_TOOLING.md)

## Status

- Phase 1-6: Complete
- Phase 7: Documentation (In Progress)
- Phase 8-10: Testing, Deployment, Submission (Pending)

## License

MIT
