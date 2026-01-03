import Link from 'next/link';
import { ArrowRight, Zap, Cloud, Brain, Wrench, Workflow, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                        <span className="text-xl font-bold">SyncFlow</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#use-cases" className="text-sm font-medium hover:text-primary transition-colors">
                            Use Cases
                        </Link>
                        <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
                            Docs
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/login">Get Started</Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container relative py-20 md:py-32">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
                    <div className="mx-auto max-w-4xl text-center">
                        <Badge variant="secondary" className="mb-4">
                            Built for Cronos x402 Paytech Hackathon
                        </Badge>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Autonomous Financial Settlement for{' '}
                            <span className="text-gradient">AI Agents</span> on Cronos
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                            SyncFlow enables AI agents to autonomously execute complex payment workflows
                            and financial operations on Cronos EVM through x402 settlement.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/login">
                                    Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#demo">View Live Demo</Link>
                            </Button>
                        </div>

                        {/* Visual Placeholder */}
                        <div className="mt-16 rounded-xl border border-border bg-muted/30 p-8">
                            <div className="flex items-center justify-center gap-8">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Brain className="h-8 w-8 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">AI Agent</span>
                                </div>
                                <ArrowRight className="h-8 w-8 text-muted-foreground" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <Workflow className="h-8 w-8 text-secondary" />
                                    </div>
                                    <span className="text-sm font-medium">Multi-Leg Workflow</span>
                                </div>
                                <ArrowRight className="h-8 w-8 text-muted-foreground" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Zap className="h-8 w-8 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">x402 Settlement</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem/Solution Section */}
                <section className="border-t border-border bg-muted/30 py-20">
                    <div className="container">
                        <div className="mx-auto max-w-5xl">
                            <div className="grid gap-12 md:grid-cols-2">
                                <div>
                                    <h2 className="mb-4 text-3xl font-bold">The Problem</h2>
                                    <p className="mb-6 text-lg text-muted-foreground">
                                        DAO treasurers spend <strong className="text-foreground">20+ hours per week</strong> on manual financial operations.
                                        Every payment, rebalancing, and hedge requires human intervention.
                                    </p>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">✗</span>
                                            <span>Manual execution: 2-4 hours per operation</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">✗</span>
                                            <span>Error rate: 5-10% in complex workflows</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">✗</span>
                                            <span>High costs: 2-5% in fees and slippage</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="mb-4 text-3xl font-bold">The Solution</h2>
                                    <p className="mb-6 text-lg text-muted-foreground">
                                        SyncFlow automates treasury operations with <strong className="text-foreground">autonomous AI agents</strong> that
                                        monitor conditions, make decisions, and execute settlements—all on Cronos EVM.
                                    </p>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">✓</span>
                                            <span>Autonomous execution: &lt;30 seconds</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">✓</span>
                                            <span>Error rate: &lt;0.1% with smart contracts</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">✓</span>
                                            <span>Low costs: 0.1% platform fee</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Metrics */}
                <section className="container py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Platform Metrics</h2>
                            <p className="text-muted-foreground">Production-ready performance on Cronos EVM</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-4xl font-bold text-primary">&lt;30s</CardTitle>
                                    <CardDescription>Settlement Time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Instant payments on Cronos EVM via x402 protocol
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-4xl font-bold text-primary">0.1%</CardTitle>
                                    <CardDescription>Platform Fee</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Lowest fees in DeFi for multi-recipient distributions
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-4xl font-bold text-primary">4</CardTitle>
                                    <CardDescription>Protocol Integrations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Deep integrations with Crypto.com, Moonlander, Delphi, VVS
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-4xl font-bold text-primary">100%</CardTitle>
                                    <CardDescription>Autonomous Execution</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        AI agents execute without human intervention
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-4xl font-bold text-primary">✓</CardTitle>
                                    <CardDescription>Enterprise Compliance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Deterministic execution with full audit trails
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-4xl font-bold text-primary">SDK</CardTitle>
                                    <CardDescription>Developer-First</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Reusable SDK and MCP servers for ecosystem builders
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Feature Highlights */}
                <section id="features" className="border-t border-border bg-muted/30 py-20">
                    <div className="container">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-12 text-center">
                                <h2 className="mb-4 text-3xl font-bold md:text-4xl">Key Features</h2>
                                <p className="text-muted-foreground">
                                    Everything you need to build autonomous financial systems
                                </p>
                            </div>
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader>
                                        <Brain className="mb-2 h-10 w-10 text-primary" />
                                        <CardTitle>Autonomous Agents</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Deploy AI agents that autonomously monitor market conditions, assess risks,
                                            and execute complex financial workflows without human input.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <Workflow className="mb-2 h-10 w-10 text-secondary" />
                                        <CardTitle>Multi-Leg Settlement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Create sophisticated multi-step payment pipelines that combine swaps,
                                            distributions, deposits, and hedges in single atomic transactions.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <Network className="mb-2 h-10 w-10 text-primary" />
                                        <CardTitle>Protocol Integration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Native integrations with Crypto.com, Moonlander perpetuals, Delphi
                                            predictions, and VVS Finance enable agents to access all Cronos DeFi.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <Zap className="mb-2 h-10 w-10 text-secondary" />
                                        <CardTitle>x402 Settlement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Leverage HTTP 402 payments for instant settlement of multi-recipient
                                            distributions with zero friction on Cronos EVM.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <Cloud className="mb-2 h-10 w-10 text-primary" />
                                        <CardTitle>Data Intelligence</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            MCP-compatible servers provide unified access to portfolio state, market
                                            data, and protocol metrics for informed agent decision-making.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <Wrench className="mb-2 h-10 w-10 text-secondary" />
                                        <CardTitle>Developer Tooling</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Comprehensive SDK, testing framework, and documentation enable developers
                                            to build agentic applications 10x faster.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section id="use-cases" className="container py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Use Cases</h2>
                            <p className="text-muted-foreground">Real-world applications powered by SyncFlow</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>DAO Treasury Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Agents autonomously rebalance portfolios, hedge risks, and distribute payments
                                        to contributors—saving treasury managers 20+ hours per week.
                                    </p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Automated portfolio rebalancing</li>
                                        <li>• Risk-based hedging strategies</li>
                                        <li>• Batch contributor payments</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Perpetuals Trading</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        AI-driven trading agents execute strategies, manage margins, and prevent
                                        liquidations automatically across Moonlander.
                                    </p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Automated strategy execution</li>
                                        <li>• Dynamic margin management</li>
                                        <li>• Liquidation prevention</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Prediction Markets</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Agents analyze market data and autonomously enter prediction markets on Delphi,
                                        with automatic hedging on perpetuals for risk management.
                                    </p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Market analysis & entry</li>
                                        <li>• Cross-protocol hedging</li>
                                        <li>• Automated profit taking</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border bg-muted/30 py-12">
                    <div className="container">
                        <div className="grid gap-8 md:grid-cols-4">
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                                    <span className="text-lg font-bold">SyncFlow</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Autonomous Financial Settlement for AI Agents on Cronos
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold">Product</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <Link href="/dashboard" className="hover:text-primary transition-colors">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs" className="hover:text-primary transition-colors">
                                            Documentation
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="hover:text-primary transition-colors">
                                            API Reference
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold">Resources</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <Link href="#" className="hover:text-primary transition-colors">
                                            GitHub
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="hover:text-primary transition-colors">
                                            Discord
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="hover:text-primary transition-colors">
                                            Twitter
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <Link href="#" className="hover:text-primary transition-colors">
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="hover:text-primary transition-colors">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                            <p>© 2025 SyncFlow Protocol. All rights reserved.</p>
                            <p className="mt-2">Built on Cronos EVM • Powered by x402 • Secured by Smart Contracts</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
