'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'agent',
            content: "Hello! I'm your SyncFlow AI Agent. I can help you with transactions, market data, or protocol info. How can I assist you today?",
            timestamp: new Date('2024-01-01T00:00:00') // Fixed timestamp to prevent hydration mismatch
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Call the backend chat endpoint
            // Assuming api wrapper or direct fetch. Using fetch for now to match pattern if api client not updated.
            const response = await fetch('http://localhost:3001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content })
            });
            const data = await response.json();

            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: data.response || "I didn't get a response. Please check the backend connection.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "Sorry, I encountered an error connecting to the server.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="flex flex-col h-[600px] bg-slate-950 border-slate-800">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            SyncFlow AI
                            <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                        </CardTitle>
                        <CardDescription>Powered by Crypto.com AI Agent SDK</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3 max-w-[80%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                msg.role === 'user' ? "bg-slate-700" : "bg-primary/20"
                            )}>
                                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-primary" />}
                            </div>
                            <div className={cn(
                                "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                msg.role === 'user'
                                    ? "bg-primary text-white rounded-tr-none"
                                    : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                            )}>
                                {msg.content}
                                <div className="text-[10px] opacity-50 mt-1 text-right">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your portfolio, execute a swap, or check market stats..."
                            className="bg-slate-900 border-slate-700 focus-visible:ring-primary"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mt-2 text-xs text-center text-muted-foreground">
                        AI can make mistakes. Please verify important financial transactions.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
