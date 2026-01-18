'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Bot, User, Loader2, Sparkles, Trash2, ArrowRight, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendTCRODeposit, getExplorerTxLink } from '@/lib/wallet';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: string;
    // Optional extras for UI state
    isProposal?: boolean;
    proposalData?: {
        to: string;
        amount: string;
        token: string;
        protocol?: string;
        quoteId?: string;
    };
    txHash?: string;
    status?: 'pending' | 'signed' | 'failed';
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'agent',
            content: "Hello! I'm your SyncFlow AI Agent. I can help you with transactions, market data, or protocol info. How can I assist you today?",
            timestamp: new Date('2024-01-01T00:00:00').toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [txLoading, setTxLoading] = useState<string | null>(null); // ID of message currently being signed
    const [isLoaded, setIsLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem('chat_history');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save messages whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages, isLoaded]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const clearChat = () => {
        const initialMessage: Message = {
            id: 'welcome',
            role: 'agent',
            content: "Hello! I'm your SyncFlow AI Agent. I can help you with transactions, market data, or protocol info. How can I assist you today?",
            timestamp: new Date().toISOString()
        };
        setMessages([initialMessage]);
        localStorage.removeItem('chat_history');
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content })
            });
            const data = await response.json();
            let content = data.response;
            let isProposal = false;
            let proposalData = undefined;

            // Try to parse if it's a JSON string (Transaction Proposal)
            try {
                if (content && content.trim().startsWith('{')) {
                    const parsed = JSON.parse(content);
                    if (parsed.type === 'transaction_proposal') {
                        content = parsed.message;
                        isProposal = true;
                        proposalData = parsed.data;
                    }
                }
            } catch (e) {
                // Not JSON, treat as text
            }

            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: content || "I didn't get a response. Please check the backend connection.",
                timestamp: new Date().toISOString(),
                isProposal,
                proposalData
            };

            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "Sorry, I encountered an error connecting to the server.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSignTransaction = async (msg: Message) => {
        if (!msg.proposalData) return;

        setTxLoading(msg.id);
        try {
            // Dynamically import helpers
            const { sendTCRODeposit, sendERC20Token } = await import('@/lib/wallet');
            const { CONTRACTS } = await import('@/lib/config');

            let result;

            // Check token type
            const token = msg.proposalData.token?.toLowerCase();

            if (token === 'tcro' || token === 'cro') {
                result = await sendTCRODeposit(msg.proposalData.to, msg.proposalData.amount);
            } else if (token === 'devusdc.e' || token === 'usdc') {
                // Use devUSDC address
                result = await sendERC20Token(CONTRACTS.devUSDC, msg.proposalData.to, msg.proposalData.amount);
            } else {
                throw new Error(`Unsupported token: ${msg.proposalData.token}`);
            }

            const { hash } = result;

            // Note: In a real app we might want to wait for confirmation, 
            // but for UI responsiveness we show "Sent" immediately with hash.

            // Update message status
            setMessages(prev => prev.map(m =>
                m.id === msg.id
                    ? { ...m, status: 'signed', txHash: hash }
                    : m
            ));
        } catch (error: any) {
            console.error("Transaction failed:", error);
            alert(`Transaction failed: ${error.message}`);
        } finally {
            setTxLoading(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    return (
        <Card className="flex flex-col h-[600px] bg-card border-border">
            <CardHeader className="border-b border-border bg-muted/30 flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            SyncFlow AI
                            <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
                        </CardTitle>
                        <CardDescription>Powered by Crypto.com AI Agent SDK</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearChat} title="Clear Chat History" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-muted" : "bg-primary/10")}>
                                {msg.role === 'user' ? <User className="h-5 w-5 text-muted-foreground" /> : <Bot className="h-5 w-5 text-primary" />}
                            </div>
                            <div className={cn(
                                "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none border border-border"
                            )}>
                                <div className="whitespace-pre-wrap mb-1">{msg.content}</div>

                                {/* Transaction Proposal Card */}
                                {msg.isProposal && msg.proposalData && (
                                    <div className="mt-3 mb-1 p-3 bg-card rounded-lg border border-border shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction Proposal</span>
                                                {msg.proposalData.protocol === 'x402' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                                                        x402 Protocol
                                                    </span>
                                                )}
                                            </div>
                                            <Sparkles className="h-3 w-3 text-secondary" />
                                        </div>
                                        <div className="space-y-1 mb-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Send:</span>
                                                <span className="font-mono font-bold text-foreground">{msg.proposalData.amount} {msg.proposalData.token}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">To:</span>
                                                <span className="font-mono text-primary" title={msg.proposalData.to}>
                                                    {msg.proposalData.to.substring(0, 6)}...{msg.proposalData.to.substring(38)}
                                                </span>
                                            </div>
                                        </div>

                                        {msg.status === 'signed' ? (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded p-2 flex items-center gap-2 text-green-600 text-xs">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Sent!</span>
                                                {msg.txHash && (
                                                    <a href={getExplorerTxLink(msg.txHash)} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center hover:underline">
                                                        View <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleSignTransaction(msg)}
                                                disabled={txLoading === msg.id}
                                            >
                                                {txLoading === msg.id ? (
                                                    <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Signing...</>
                                                ) : (
                                                    <>Sign & Send <ArrowRight className="ml-2 h-3 w-3" /></>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <div className="text-[10px] opacity-70 mt-1 text-right">{formatTime(msg.timestamp)}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 border border-border">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-border bg-muted/10">
                    <div className="flex gap-2">
                        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                            placeholder="Type 'send 10 cro to 0x...' or ask about blockchain..."
                            className="bg-background border-input focus-visible:ring-primary"
                        />
                        <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-primary hover:bg-primary/90">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
