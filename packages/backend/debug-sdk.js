const sdk = require('@crypto.com/ai-agent-client');

try {
    const { createClient } = sdk;
    const client = createClient({ apiKey: 'dummy' });

    console.log('Client.agent keys:', Object.keys(client.agent));
    console.log('Client.agent prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(client.agent)));

} catch (e) {
    console.error(e);
}
