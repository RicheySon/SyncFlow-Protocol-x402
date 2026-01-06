// Quick test to verify Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';

console.log('Testing Gemini API...');
console.log('API Key found:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');

if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in .env');
    process.exit(1);
}

try {
    const genAI = new GoogleGenerativeAI(apiKey);

    console.log('\n📋 Listing available models...');
    const modelsResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    const modelsData = await modelsResponse.json();

    if (modelsData.models) {
        console.log('Available models:');
        modelsData.models.forEach(m => {
            if (m.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`  - ${m.name.replace('models/', '')}`);
            }
        });

        // Try first available model
        const availableModel = modelsData.models.find(m =>
            m.supportedGenerationMethods?.includes('generateContent')
        );

        if (availableModel) {
            const modelName = availableModel.name.replace('models/', '');
            console.log(`\n🔍 Testing with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "Hello from Gemini!" in one sentence');
            const response = await result.response;
            const text = response.text();

            console.log('✅ Gemini Response:', text);
            console.log(`\n✅ Use this model name in your code: ${modelName}`);
        }
    }
} catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
        console.error('\n💡 The API key appears to be invalid. Please check:');
        console.error('   1. Go to https://aistudio.google.com/app/apikey');
        console.error('   2. Create a new API key');
        console.error('   3. Update GEMINI_API_KEY in .env');
    }
    process.exit(1);
}
