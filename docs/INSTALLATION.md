# Installation Guide

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v14 or higher
- **Git**: For cloning the repository

## Step 1: Clone the Repository

```bash
git clone https://github.com/RicheySon/SyncFlow-Protocol-x402.git
cd SyncFlow-Protocol-x402
```

## Step 2: Install Dependencies

```bash
npm install
```

This command will install all dependencies for all packages in the monorepo.

## Step 3: Configure Environment Variables

### Backend

Create `packages/backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/syncflow"
JWT_SECRET="your-secret-key-here-change-in-production"
PORT=3001
CRONOS_RPC_URL="https://evm-t3.cronos.org"
```

Replace `USER` and `PASSWORD` with your PostgreSQL credentials.

### Frontend

Create `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 4: Database Setup

```bash
cd packages/backend
npx prisma migrate dev
npx prisma generate
```

## Step 5: Seed the Database (Optional)

```bash
npx tsx scripts/seed.ts
```

This creates a test user and agent for development.

## Step 6: Run the Application

### Terminal 1 - Backend

```bash
cd packages/backend
npm run dev
```

The backend will start on `http://localhost:3001`.

### Terminal 2 - Frontend

```bash
cd packages/frontend
npm run dev
```

The frontend will start on `http://localhost:3000`.

## Step 7: Verify Installation

Visit `http://localhost:3000` and you should see the SyncFlow dashboard.

## Testing Components

### Test Core Services

```bash
cd packages/backend
npx tsx scripts/test-core-services.ts
```

### Test MCP Server

```bash
cd packages/backend
npx tsx scripts/test-mcp.ts
```

### Test Workflow Execution

```bash
cd packages/backend
npx tsx scripts/test-workflow.ts
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use, kill the process or change the port in the environment variables.

### Database Connection Errors

Ensure PostgreSQL is running and the connection string in `.env` is correct.

### Module Not Found Errors

Run `npm install` again from the root directory.

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions
