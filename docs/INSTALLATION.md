# Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/syncflow/syncflow-protocol.git
cd syncflow-protocol
\`\`\`

## Step 2: Install Dependencies

\`\`\`bash
# Install all workspace dependencies
pnpm install
\`\`\`

This command will install dependencies for all packages in the monorepo.

## Step 3: Set Up Environment Variables

### Frontend

\`\`\`bash
cd packages/frontend
cp .env.example .env.local
\`\`\`

Edit `.env.local` and configure:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)
- `NEXT_PUBLIC_CONTRACT_*`: Will be filled after contract deployment

### Backend

\`\`\`bash
cd ../backend
cp .env.example .env
\`\`\`

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Random secret key for authentication
- `CRONOS_RPC_URL`: Cronos EVM RPC (https://evm.cronos.org)
- `PRIVATE_KEY`: Your wallet private key (keep secure!)

### Contracts

\`\`\`bash
cd ../contracts
cp .env.example .env
\`\`\`

Edit `.env` and configure:
- `PRIVATE_KEY`: Deployment wallet private key
- `CRONOS_EXPLORER_API_KEY`: For contract verification (get from Cronoscan)

## Step 4: Set Up Database

\`\`\`bash
cd packages/backend

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
\`\`\`

## Step 5: Deploy Smart Contracts

### Deploy to Cronos Testnet (Recommended First)

\`\`\`bash
cd ../contracts

# Compile contracts
pnpm compile

# Deploy to testnet
pnpm deploy:testnet
\`\`\`

Note the deployed contract addresses and add them to your frontend and backend `.env` files.

### Deploy to Cronos Mainnet

\`\`\`bash
pnpm deploy:mainnet

# Verify contracts
pnpm verify
\`\`\`

## Step 6: Start Development Servers

From the root directory:

\`\`\`bash
# Start all services in development mode
pnpm dev
\`\`\`

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Step 7: Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the SyncFlow landing page
3. Navigate to the dashboard
4. Try creating a test agent

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

\`\`\`bash
# Frontend
cd packages/frontend
PORT=3002 pnpm dev

# Backend
cd packages/backend
PORT=3003 pnpm dev
\`\`\`

### Database Connection Errors

Verify PostgreSQL is running:

\`\`\`bash
# On macOS/Linux
pg_isready

# On Windows (PowerShell)
pg_ctl status
\`\`\`

### Contract Deployment Fails

Ensure you have sufficient CRO for gas fees on your deployment wallet. Get testnet TCRO from the [Cronos Faucet](https://cronos.org/faucet).

## Next Steps

- Read the [Architecture Documentation](./ARCHITECTURE.md)
- Explore [SDK Guide](./SDK_GUIDE.md)
- Review [API Reference](./API_REFERENCE.md)
- Check out [Examples](../examples/)

## Getting Help

- Open an issue on [GitHub](https://github.com/syncflow/syncflow-protocol/issues)
- Join our [Discord](https://discord.gg/syncflow)
- Email: support@syncflow.dev
