import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // MOCK IMPLEMENTATION for Unified Demo

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            email: email || 'demo@syncflow.ai',
            name: 'Demo Agent',
            role: 'user',
        };

        return NextResponse.json({
            user: mockUser,
            token: 'mock-jwt-token-' + Date.now(),
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
