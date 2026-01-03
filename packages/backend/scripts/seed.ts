import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create User
    const email = 'testuser@example.com';
    const password = await hash('password123', 10);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: uuidv4(),
                email,
                password,
                name: 'Test User'
            }
        });
        console.log(`✅ Created user: ${user.email}`);
    } else {
        console.log(`ℹ️ User already exists: ${user.email}`);
    }

    // 2. Create Agent
    const agentName = 'Seed Agent';
    let agent = await prisma.agent.findFirst({ where: { name: agentName } });

    if (!agent) {
        agent = await prisma.agent.create({
            data: {
                id: uuidv4(),
                userId: user.id,
                name: agentName,
                type: 'invest',
                status: 'active',
                description: 'Created by seed script',
                config: JSON.stringify({ risk: 'low', maxTransactionAmount: '100' }),
                walletAddress: '0x1234567890123456789012345678901234567890', // Mock
                walletPrivateKey: '0xabc...' // Mock
            }
        });
        console.log(`✅ Created agent: ${agent.name}`);
    } else {
        console.log(`ℹ️ Agent already exists: ${agent.name}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
