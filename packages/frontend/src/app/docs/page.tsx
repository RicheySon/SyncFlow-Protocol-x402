'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Book,
    Code,
    Terminal,
    Layers,
    ShieldCheck,
    Cpu,
    Search,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const categories = [
    {
        title: 'Getting Started',
        icon: Book,
        items: [
            { title: 'Introduction', href: '#' },
            { title: 'Quick Start', href: '#' },
            { title: 'Architecture Overview', href: '#' },
        ]
    },
    {
        title: 'Core Concepts',
        icon: Layers,
        items: [
            { title: 'Autonomous Agents', href: '#' },
            { title: 'x402 Payment Protocol', href: '#' },
            { title: 'MCP Servers', href: '#' },
            { title: 'Smart Wallets', href: '#' },
        ]
    },
    {
        title: 'Guides & Tutorials',
        icon: Terminal,
        items: [
            { title: 'Building a Trading Bot', href: '#' },
            { title: 'Creating Custom Workflows', href: '#' },
            { title: 'Integrating with Moonlander', href: '#' },
        ]
    },
    {
        title: 'API Reference',
        icon: Code,
        items: [
            { title: 'Agent SDK', href: '#' },
            { title: 'REST API', href: '#' },
            { title: 'Smart Contracts', href: '#' },
        ]
    }
];

export default function DocumentationPage() {
    return (
        <div className="container mx-auto py-10 max-w-7xl">
            {/* Hero Search */}
            <div className="mb-12 text-center space-y-6">
                <Badge variant="outline" className="mb-4">v1.0.0-beta</Badge>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                    SyncFlow Documentation
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Learn how to build, deploy, and manage autonomous financial agents on Cronos EVM.
                </p>
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search documentation..."
                        className="pl-10 h-12 text-lg bg-muted/50"
                    />
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Sidebar Nav (Desktop) */}
                <div className="hidden lg:block space-y-8">
                    {categories.map((category) => (
                        <div key={category.title}>
                            <h4 className="mb-3 font-semibold flex items-center gap-2">
                                <category.icon className="h-4 w-4" />
                                {category.title}
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {category.items.map((item) => (
                                    <li key={item.title}>
                                        <Link href={item.href} className="hover:text-primary transition-colors">
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-10">
                    {/* Quick Links */}
                    <section className="grid sm:grid-cols-2 gap-4">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="group-hover:text-primary transition-colors">Quick Start Guide</CardTitle>
                                <CardDescription>Deploy your first agent in under 5 minutes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-medium text-primary">
                                    Read Guide <ChevronRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="group-hover:text-primary transition-colors">SDK Reference</CardTitle>
                                <CardDescription>Complete API documentation for @syncflow/sdk.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-medium text-primary">
                                    View Reference <ChevronRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Featured Topic: Architecture */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">System Architecture</h2>
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="space-y-2 text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Cpu className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold">AI Agents</h3>
                                    <p className="text-sm text-muted-foreground">Autonomous monitoring and execution logic running off-chain.</p>
                                </div>
                                <div className="space-y-2 text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                                        <Layers className="h-6 w-6 text-secondary" />
                                    </div>
                                    <h3 className="font-semibold">MCP Servers</h3>
                                    <p className="text-sm text-muted-foreground">Standardized data bridges for portfolio and market state.</p>
                                </div>
                                <div className="space-y-2 text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <ShieldCheck className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold">Smart Contracts</h3>
                                    <p className="text-sm text-muted-foreground">Trustless settlement and asset custody on Cronos EVM.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">Popular Integration Patterns</h2>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                <h4 className="font-medium mb-2">Portfolio Rebalancing</h4>
                                <p className="text-sm text-muted-foreground">Automated asset allocation based on target weights.</p>
                            </div>
                            <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                <h4 className="font-medium mb-2">Delta Neutral Yield</h4>
                                <p className="text-sm text-muted-foreground">Hedging staking positions with perpetual shorts.</p>
                            </div>
                            <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                <h4 className="font-medium mb-2">Payroll Distribution</h4>
                                <p className="text-sm text-muted-foreground">Batch payments to DAO contributors.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
