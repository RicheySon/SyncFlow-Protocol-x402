const sdk = require('@crypto.com/ai-agent-client');

// Use the actual key the user provided in the chat history
// Key hint: sk-p...............2e7b
// I will paste a placeholder for now, but instructions to the user will be needed
// Wait, I can't know the full key unless I read the env file directly from disk

const fs = require('fs');
const path = require('path');

// Try reading .env manually
const envPath = path.join(__dirname, '.env');
let manualApiKey = 'dummy';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/CDC_AI_API_KEY=(.*)/);
    if (match) {
        manualApiKey = match[1].trim();
        console.log('Found key in .env with length:', manualApiKey.length);
    }
    const matchOpenAI = envContent.match(/OPENAI_API_KEY=(.*)/);
    if (matchOpenAI) {
        process.env.OPENAI_API_KEY = matchOpenAI[1].trim();
    }
} catch (e) {
    console.log('Could not read .env:', e.message);
}

// Hardcode keys for debug - user provided inputs in chat context previously
const OPENAI_KEY = process.env.OPENAI_API_KEY || 'sk-proj-dummy'; // Need to remind user to set this if missing

async function testQuery() {
    try {
        const { createClient } = sdk;
        console.log("Using CDC Key length:", manualApiKey.length);
        console.log("Using OpenAI Key length:", (process.env.OPENAI_API_KEY || '').length);

        const client = createClient({ apiKey: manualApiKey });

        console.log('Testing generateQuery with QueryOptions...');
        // Based on interface QueryOptions { openAI: { apiKey... }, chainId... }
        // The method signature is likely generateQuery(userMessage, options) or generateQuery(options)
        // I'll try generateQuery(message, options) first as that's standard

        const options = {
            openAI: {
                apiKey: OPENAI_KEY,
                model: 'gpt-3.5-turbo'
            },
            chainId: 338
            // explorerKeys: {} // Removing this to see if it fixes 400 error
        };

        try {
            console.log('Attempt 1: generateQuery(string, options) [Testnet 338]');
            const res1 = await client.agent.generateQuery('Hello world', options);
            console.log('Success Attempt 1!', res1);
        } catch (e1) {
            console.log('Failed Attempt 1:', e1.message);
            if (e1.response) console.log('Response status:', e1.response.status);
            if (e1.response && e1.response.data) console.log('Response body:', JSON.stringify(e1.response.data));
        }

        // Attempt 3: Try Chain ID 25 (Mainnet)
        try {
            console.log('Attempt 3: generateQuery(string, options) [Mainnet 25]');
            const optionsMain = { ...options, chainId: 25 };
            const res3 = await client.agent.generateQuery('Hello world', optionsMain);
            console.log('Success Attempt 3!', res3);
        } catch (e3) {
            console.log('Failed Attempt 3:', e3.message);
            if (e3.response && e3.response.data) console.log('Response body:', JSON.stringify(e3.response.data));
        }

    } catch (e) {
        console.error('Setup failed:', e);
    }
}

testQuery();
