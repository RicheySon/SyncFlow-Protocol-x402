import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';
import { hashPassword } from '../src/services/auth.service';

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Starting Transactions API Tests...');

    // 1. Setup: Create User, Agent, and Transaction in DB directly
    const email = `test-tx-${Date.now()}@example.com`;
    const password = 'password123';
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: 'Tx Tester',
            role: 'user',
        },
    });

    const agent = await prisma.agent.create({
        data: {
            name: 'Tx Agent',
            type: 'trading',
            config: '{}',
            userId: user.id,
        },
    });

    const txHash = `0x${Date.now().toString(16)}`;
    const transaction = await prisma.transaction.create({
        data: {
            txHash,
            type: 'swap',
            status: 'success',
            amount: '100.00',
            token: 'USDC',
            agentId: agent.id,
        },
    });

    console.log('✅ Setup complete: Created User, Agent, and Transaction in DB');

    // 2. Login to get token
    const loginRes = await request(app).post('/auth/login').send({
        email,
        password,
    });
    const token = loginRes.body.token;
    if (!token) throw new Error('Login failed: Is the server running? (Supertest uses app instance so it should work)');

    // 3. Test GET /transactions
    console.log('🔄 Testing GET /transactions...');
    const getAllRes = await request(app)
        .get('/transactions')
        .set('Authorization', `Bearer ${token}`);

    if (getAllRes.status !== 200) {
        console.error('❌ GET /transactions failed:', getAllRes.body);
        process.exit(1);
    }

    const foundTx = getAllRes.body.find((t: any) => t.id === transaction.id);
    if (foundTx) {
        console.log('✅ GET /transactions returned the seeded transaction');
    } else {
        console.error('❌ Transaction not found in list');
        process.exit(1);
    }

    // 4. Test GET /transactions/:id
    console.log(`🔄 Testing GET /transactions/${transaction.id}...`);
    const getByIdRes = await request(app)
        .get(`/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${token}`);

    if (getByIdRes.status === 200 && getByIdRes.body.id === transaction.id) {
        console.log('✅ GET /transactions/:id working');
    } else {
        console.error('❌ GET /transactions/:id failed');
        process.exit(1);
    }

    console.log('🎉 All Transactions Tests Passed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
