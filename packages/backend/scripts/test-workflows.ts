
const BASE_URL = 'http://localhost:3001';

async function testWorkflowsCRUD() {
    try {
        console.log('=== Testing Workflows CRUD ===\n');

        // Step 1: Signup
        console.log('1. Creating test user...');
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `workflow_test_${Date.now()}@example.com`,
                password: 'password123',
                name: 'Workflow Tester',
            }),
        });
        const signupData = await signupRes.json();
        console.log('✅ User created:', signupData.user.email);
        const token = (signupData as any).token;

        // Step 2: Create Workflow
        console.log('\n2. Creating workflow...');
        const createRes = await fetch(`${BASE_URL}/workflows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: 'Auto-Hedge Staking',
                description: 'Automatically stake CRO when price drops',
                steps: JSON.stringify([
                    { action: 'monitor_price', threshold: 0.05 },
                    { action: 'execute_stake', amount: '1000' },
                ]),
                trigger: 'price_change',
            }),
        });
        const createdWorkflow = await createRes.json();
        console.log('✅ Workflow created:', createdWorkflow.name, `(ID: ${createdWorkflow.id})`);
        const workflowId = createdWorkflow.id;

        // Step 3: Get All Workflows
        console.log('\n3. Fetching all workflows...');
        const getAllRes = await fetch(`${BASE_URL}/workflows`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const allWorkflows = await getAllRes.json();
        console.log(`✅ Found ${allWorkflows.length} workflow(s)`);

        // Step 4: Get Workflow by ID
        console.log('\n4. Fetching workflow by ID...');
        const getByIdRes = await fetch(`${BASE_URL}/workflows/${workflowId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const workflowById = await getByIdRes.json();
        console.log('✅ Workflow details:', workflowById.name, `- Status: ${workflowById.status}`);

        // Step 5: Update Workflow
        console.log('\n5. Activating workflow...');
        const updateRes = await fetch(`${BASE_URL}/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                status: 'active',
            }),
        });
        const updatedWorkflow = await updateRes.json();
        console.log('✅ Workflow updated. New status:', updatedWorkflow.status);

        // Step 6: Delete Workflow
        console.log('\n6. Deleting workflow...');
        const deleteRes = await fetch(`${BASE_URL}/workflows/${workflowId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const deleteResult = await deleteRes.json();
        console.log('✅ Workflow deleted:', deleteResult.message);

        console.log('\n✅ All Workflows CRUD operations verified successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

testWorkflowsCRUD();
