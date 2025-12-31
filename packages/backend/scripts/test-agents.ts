
const BASE_URL = 'http://localhost:3001';

async function testAgentsCRUD() {
    try {
        console.log('=== Testing Agents CRUD ===\n');

        // Step 1: Signup
        console.log('1. Creating test user...');
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `agent_test_${Date.now()}@example.com`,
                password: 'password123',
                name: 'Agent Tester',
            }),
        });
        const signupData = await signupRes.json();
        console.log('✅ User created:', signupData.user.email);
        const token = (signupData as any).token;

        // Step 2: Create Agent
        console.log('\n2. Creating agent...');
        const createRes = await fetch(`${BASE_URL}/agents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: 'Treasury Bot Alpha',
                description: 'AI-powered treasury management agent',
                type: 'invest',
                config: JSON.stringify({ risk: 'low', allocation: 'balanced' }),
            }),
        });
        const createdAgent = await createRes.json();
        console.log('✅ Agent created:', createdAgent.name, `(ID: ${createdAgent.id})`);
        const agentId = createdAgent.id;

        // Step 3: Get All Agents
        console.log('\n3. Fetching all agents...');
        const getAllRes = await fetch(`${BASE_URL}/agents`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const allAgents = await getAllRes.json();
        console.log(`✅ Found ${allAgents.length} agent(s)`);

        // Step 4: Get Agent by ID
        console.log('\n4. Fetching agent by ID...');
        const getByIdRes = await fetch(`${BASE_URL}/agents/${agentId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const agentById = await getByIdRes.json();
        console.log('✅ Agent details:', agentById.name, `- Status: ${agentById.status}`);

        // Step 5: Update Agent
        console.log('\n5. Updating agent status...');
        const updateRes = await fetch(`${BASE_URL}/agents/${agentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                status: 'paused',
            }),
        });
        const updatedAgent = await updateRes.json();
        console.log('✅ Agent updated. New status:', updatedAgent.status);

        // Step 6: Delete Agent
        console.log('\n6. Deleting agent...');
        const deleteRes = await fetch(`${BASE_URL}/agents/${agentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const deleteResult = await deleteRes.json();
        console.log('✅ Agent deleted:', deleteResult.message);

        console.log('\n✅ All CRUD operations verified successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

testAgentsCRUD();
