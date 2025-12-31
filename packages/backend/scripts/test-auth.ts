

const BASE_URL = 'http://localhost:3001/auth';

async function testAuth() {
    try {
        console.log('Testing Signup...');
        const signupRes = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test_${Date.now()}@example.com`,
                password: 'password123',
                name: 'Test User',
            }),
        });
        const signupData = await signupRes.json();
        console.log('Signup Status:', signupRes.status);
        console.log('Signup Response:', signupData);

        if (signupRes.status !== 201) throw new Error('Signup failed');

        const { email } = (signupData as any).user;

        console.log('\nTesting Login...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'password123',
            }),
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', loginData);

        if (loginRes.status !== 200) throw new Error('Login failed');

        console.log('\n✅ Auth Flow Verified Successfully!');
    } catch (error) {
        console.error('\n❌ Auth Flow Failed:', error);
        process.exit(1);
    }
}

testAuth();
