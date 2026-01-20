import { NextRequest, NextResponse } from 'next/server';
import { CdcAgentService } from '../../../lib/backend/cdc-agent.service';

const agentService = new CdcAgentService();

export async function POST(req: NextRequest) {
    try {
        const { message, context } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const response = await agentService.processMessage(message, context);

        return NextResponse.json({
            response: response,
            timestamp: new Date().toISOString()
        }, { status: 200 });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
    }
}
