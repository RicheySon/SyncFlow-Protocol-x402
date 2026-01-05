# SyncFlow Protocol

**Autonomous DeFi Agents for Cronos zkEVM**

SyncFlow Protocol is a comprehensive framework for building, deploying, and managing autonomous DeFi agents on the Cronos blockchain. It combines AI-driven decision making with on-chain execution, x402 payment settlement, and Model Context Protocol (MCP) integration to enable sophisticated agentic finance workflows.

## Features

### Core Capabilities (Cloakefy-Aligned)

- **Secure Batch Payments (Encrypted Distributions)**: Execute private, batch-optimized payouts to multiple recipients on Cronos EVM.
- **x402 Settlement**: Unified, secure, and validated payment processing rail for agentic workflows.
- **Secure Cronos Tokens**: Risk-managed, privacy-preserving token wrappers native to Cronos (replacing eERC).
- **Entity Management (Smart Wallets)**: Create and manage autonomous agents with dedicated smart wallets and governance controls.

### Protocol Integrations
### Protocol Integrations
- **SyncFlow Agent**: Batch payment processing
- **Transaction Monitor**: Global activity tracking

### Developer Tools
- **TypeScript SDK**: Easy-to-use client library for building on SyncFlow
- **MCP Servers**: Transaction monitoring and agent data feeds

## Architecture

![Architecture Diagram](/brain/c339cb3a-512f-44c9-8bc5-d829e8fa9861/syncflow_architecture_v3_lean_1767633702741.png)

## Tech Stack

**Frontend**: Next.js 14, React, TailwindCSS, Shadcn/UI  
**Backend**: Express.js, Prisma ORM, PostgreSQL  
**Blockchain**: Ethers.js v6, Cronos EVM (Chain ID 25)  
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
│   └── contracts/         # Smart contracts
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
- [Developer Tooling](./docs/tracks/DEV_TOOLING.md)

## Status

- Phase 1-6: Complete
- Phase 7: Documentation (In Progress)
- Phase 8-10: Testing, Deployment, Submission (Pending)

## License

MIT
