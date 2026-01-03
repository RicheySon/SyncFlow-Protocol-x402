import { AgentOrchestrator } from '../src/services/core/AgentOrchestrator';
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('🧠 Testing Core Services...');

    // 1. Get an existing agent or create a test one (assuming database has seed data or previous usage)
    // For simplicity, we'll try to find the first active agent
    const agent = await prisma.agent.findFirst();

    if (!agent) {
        console.error('❌ No agents found. Run `npm run seed` or create an agent via API first.');
        process.exit(1);
    }

    console.log(`🤖 Using Agent: ${agent.name} (${agent.id})`);

    // 2. Trigger Orchestrator Cycle
    console.log('🔄 Triggering execution cycle...');
    await AgentOrchestrator.executeCycle(agent.id);

    // 3. Check for recent transaction
    const tx = await prisma.transaction.findFirst({
        where: { agentId: agent.id },
        orderBy: { createdAt: 'desc' }
    });

    if (tx) {
        console.log(`✅ Cycle Complete. Last Transaction:`);
        console.log(`   Type: ${tx.type}`);
        console.log(`   Hash: ${tx.hash}`);
        console.log(`   Meta: ${tx.metadata}`);
    } else {
        console.log('⚠️ Cycle completed but no transaction recorded (Decision Engine might have returned null or Risk blocked it).');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
