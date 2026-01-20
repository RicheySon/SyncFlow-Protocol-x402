import Link from 'next/link';
import { ArrowRight, Zap, Cloud, Brain, Wrench, Workflow, Network, CheckCircle2, ChevronRight, Terminal, Shield, Lock, Activity, Server, Database, Code2, CreditCard, Coins } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EncryptionText } from '../components/ui/encryption-text';
import { SocialCard } from '../components/ui/social-card';

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#010314] text-[#DFE1F4] selection:bg-[#7D45FD]/30 font-sans">
            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-[#FFFFFF]/5 bg-[#010314]/80 backdrop-blur-xl">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="h-8 w-8 rounded-lg bg-[#7D45FD] flex items-center justify-center shadow-[0_0_15px_rgba(125,69,253,0.3)] transition-all group-hover:shadow-[0_0_25px_rgba(125,69,253,0.5)]">
                            <Zap className="h-5 w-5 text-white" fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#7D45FD] transition-colors">SyncFlow</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        {['Features', 'SDK', 'Developers', 'Pricing'].map((item) => (
                            <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-[#8890A6] hover:text-white transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#7D45FD] transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-[#8890A6] hover:text-white transition-colors hidden sm:block">
                            Sign In
                        </Link>
                        <Button asChild className="bg-white text-black hover:bg-[#E0E0E0] rounded-full px-6 font-semibold">
                            <Link href="/login">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative z-10">
                {/* Hero Section */}
                <section className="relative pt-32 pb-40 overflow-visible">
                    {/* "Spotlight" Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7D45FD]/10 rounded-full blur-[120px] -z-10 opacity-60" />

                    <div className="container relative z-10">
                        <div className="mx-auto max-w-5xl text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7D45FD]/10 border border-[#7D45FD]/20 text-[#7D45FD] text-xs font-medium mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7D45FD] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7D45FD]"></span>
                                </span>
                                Cronos x402 Hackathon Build
                            </div>

                            <h1 className="mb-8 text-5xl font-semibold tracking-tight sm:text-7xl leading-[1.1] text-white">
                                <span className="block mb-2">Orchestration Layer</span>
                                <span className="text-[#8890A6] font-normal">for </span>
                                <span className="text-[#7D45FD] inline-block">
                                    <EncryptionText text="AI Agents" interval={70} />
                                </span>
                            </h1>

                            <p className="mx-auto mb-10 max-w-2xl text-lg text-[#8890A6] md:text-xl leading-relaxed">
                                The unified infrastructure for deploying, managing, and securing autonomous agents.
                                Featuring native <span className="text-white font-medium">x402 Payments</span> and <span className="text-white font-medium">Auto-Transact</span> capabilities.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="h-14 px-8 text-base bg-[#7D45FD] hover:bg-[#6c3ce0] shadow-[0_0_30px_rgba(125,69,253,0.3)] rounded-full border-0 transition-transform hover:scale-105" asChild>
                                    <Link href="/login">
                                        Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-[#FFFFFF]/10 bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 text-white rounded-full transition-transform hover:scale-105" asChild>
                                    <Link href="https://github.com/RicheySon/SyncFlow-Protocol-x402" target="_blank">
                                        View Codebase
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* 3D "Metallic" Cards Visual (Dev Tool Focused) */}
                        <div className="relative mx-auto max-w-6xl h-[500px] perspective-1000">
                            {/* Card 1: Agent Status (Center) */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 hover:z-50 hover:scale-105 group" style={{ transform: 'rotateX(10deg) translateY(0px)' }}>
                                <div className="w-[400px] rounded-2xl bg-[#0A0C16] border border-[#FFFFFF]/10 p-1 shadow-2xl shadow-[#7D45FD]/10">
                                    <div className="h-full w-full rounded-xl bg-[#010314]/50 backdrop-blur-md overflow-hidden p-6 relative">
                                        {/* Metallic Sheen */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[#7D45FD]/20 flex items-center justify-center text-[#7D45FD]">
                                                    <Brain className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">Service Agent</div>
                                                    <div className="text-xs text-[#8890A6]">id: ag_8x92...</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10 uppercase text-[10px] tracking-wider">Online</Badge>
                                        </div>

                                        <div className="space-y-4 font-mono text-xs">
                                            <div className="flex justify-between p-3 rounded bg-[#FFFFFF]/5 border border-[#FFFFFF]/5">
                                                <span className="text-[#8890A6]">Task</span>
                                                <span className="text-[#7D45FD]">Data Procurement</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[#8890A6]">
                                                    <span>x402 Balance</span>
                                                    <span>450.00 Credits</span>
                                                </div>
                                                <div className="h-1 w-full bg-[#FFFFFF]/10 rounded-full overflow-hidden">
                                                    <div className="h-full w-[65%] bg-[#7D45FD] shadow-[0_0_10px_#7D45FD]" />
                                                </div>
                                            </div>
                                            <div className="p-3 bg-[#05060A] rounded border border-[#FFFFFF]/5 text-[#8890A6]">
                                                &gt; <span className="text-blue-400">INFO</span>: Requesting dataset via x402...<br />
                                                &gt; <span className="text-green-400">PAID</span>: 50 Credits sent to Provider A<br />
                                                &gt; <span className="text-[#7D45FD]">SUCCESS</span>: Dataset received (2.4GB)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Security Enclave (Left) */}
                            <div className="absolute top-24 left-1/2 -translate-x-[420px] z-20 hidden lg:block transition-all duration-700 hover:scale-105" style={{ transform: 'rotateY(15deg) rotateZ(-2deg) scale(0.9)' }}>
                                <div className="w-[340px] rounded-2xl bg-[#0A0C16]/90 border border-[#FFFFFF]/10 p-1 shadow-xl backdrop-blur-sm">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div className="text-sm font-semibold text-white">Auto-Transact Guard</div>
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-[#FFFFFF]/5 transition-colors">
                                                    <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                                                    <div className="text-xs text-[#8890A6]">Spend Limit Check: <span className="text-white font-mono">Passed</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: SDK Integration (Right) */}
                            <div className="absolute top-24 left-1/2 translate-x-[80px] z-20 hidden lg:block transition-all duration-700 hover:scale-105" style={{ transform: 'rotateY(-15deg) rotateZ(2deg) scale(0.9)' }}>
                                <div className="w-[340px] rounded-2xl bg-[#0A0C16]/90 border border-[#FFFFFF]/10 p-1 shadow-xl backdrop-blur-sm">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
                                                <Code2 className="h-5 w-5" />
                                            </div>
                                            <div className="text-sm font-semibold text-white">x402 SDK</div>
                                        </div>
                                        <div className="font-mono text-[10px] leading-relaxed text-[#8890A6]">
                                            <span className="text-pink-500">import</span> &#123; x402 &#125; <span className="text-pink-500">from</span> <span className="text-green-400">&apos;@syncflow/pay&apos;</span>;<br /><br />
                                            <span className="text-[#8890A6]">{'// Auto-Pay Service'}</span><br />
                                            <span className="text-pink-500">const</span> receipt = <span className="text-cyan-500">await</span> x402.pay(&#123;<br />
                                            &nbsp;&nbsp;recipient: <span className="text-green-400">&apos;data-provider-v1&apos;</span>,<br />
                                            &nbsp;&nbsp;amount: <span className="text-orange-400">50</span><br />
                                            &#125;);
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Grid (Dev Tools Focused) */}
                <section id="features" className="container py-32 relative z-10">
                    <div className="mb-20 max-w-2xl">
                        <h2 className="text-3xl font-semibold text-white mb-6">
                            Tools for the <br />
                            <span className="text-[#7D45FD]">Agent Age</span>
                        </h2>
                        <p className="text-[#8890A6] text-lg">
                            We provide the developer primitives to build, deploy, and scale autonomous AI workflows.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Feature: x402 Auto-Transact */}
                        <Card className="md:col-span-2 bg-[#05060A] border-[#FFFFFF]/10 hover:border-[#7D45FD]/50 transition-all duration-500 group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#7D45FD]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader>
                                <Coins className="h-8 w-8 text-[#7D45FD] mb-4" />
                                <CardTitle className="text-xl text-white">x402 Auto-Transact</CardTitle>
                                <CardDescription className="text-[#8890A6]">
                                    Enable your agents to autonomously pay for resources, APIs, and data. The standard for Machine-to-Machine (M2M) payments.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative h-48 mt-4">
                                {/* Abstract Visualization of Transaction */}
                                <div className="absolute inset-0 flex items-center justify-center gap-12 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <div className="h-16 w-16 rounded-full border border-[#FFFFFF]/10 bg-[#FFFFFF]/5 flex items-center justify-center animate-pulse">
                                        <Brain className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="h-[2px] w-32 bg-gradient-to-r from-[#FFFFFF]/10 via-[#7D45FD] to-[#FFFFFF]/10 relative flex items-center justify-center">
                                        <div className="absolute top-1/2 left-0 -translate-y-1/2 h-3 w-3 bg-[#7D45FD] rounded-full shadow-[0_0_10px_#7D45FD] animate-[moveRight_1.5s_linear_infinite]" />
                                        <div className="text-[10px] font-mono text-[#7D45FD] -mt-6 bg-[#010314] px-1 border border-[#7D45FD]/30 rounded">x402 Transfer</div>
                                    </div>
                                    <div className="h-16 w-16 rounded-full border border-[#FFFFFF]/10 bg-[#FFFFFF]/5 flex items-center justify-center">
                                        <Server className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Secondary Feature: Agent Orchestration */}
                        <Card className="bg-[#05060A] border-[#FFFFFF]/10 hover:border-cyan-500/50 transition-all duration-500 group">
                            <CardHeader>
                                <Workflow className="h-8 w-8 text-cyan-500 mb-4" />
                                <CardTitle className="text-xl text-white">Orchestration</CardTitle>
                                <CardDescription className="text-[#8890A6]">
                                    Coordinate multi-agent workflows with ease. Define triggers and hand-offs.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 rounded bg-[#0A0C16] border border-[#FFFFFF]/5 font-mono text-xs text-cyan-500/80 mt-4">
                                    workflow: serial<br />
                                    agents: [research, write]
                                </div>
                            </CardContent>
                        </Card>

                        {/* Third Feature: Secure Runtime */}
                        <Card className="bg-[#05060A] border-[#FFFFFF]/10 hover:border-pink-500/50 transition-all duration-500 group">
                            <CardHeader>
                                <Lock className="h-8 w-8 text-pink-500 mb-4" />
                                <CardTitle className="text-xl text-white">Secure Runtime</CardTitle>
                                <CardDescription className="text-[#8890A6]">
                                    Isolated execution environments with strict spending limits.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-end justify-between h-32 pb-2">
                                <div className="w-full text-center text-xs text-[#8890A6] font-mono">
                                    Sandbox Active<br />
                                    <span className="text-green-400">● Protected</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fourth Feature: Integrations */}
                        <Card className="md:col-span-2 bg-[#05060A] border-[#FFFFFF]/10 hover:border-green-500/50 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                            <CardHeader>
                                <Database className="h-8 w-8 text-green-500 mb-4" />
                                <CardTitle className="text-xl text-white">Tool Integrations</CardTitle>
                                <CardDescription className="text-[#8890A6]">
                                    Instant access to essential APIs and services for your agents.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-4 mt-2">
                                {['OpenAI', 'Anthropic', 'Pinecone', 'LangChain'].map((p) => (
                                    <Badge key={p} variant="outline" className="border-[#FFFFFF]/10 bg-[#FFFFFF]/5 text-[#8890A6] px-4 py-2 text-sm font-normal">
                                        {p}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Stats / Proof (Dev Focused) */}
                <section className="border-y border-[#FFFFFF]/5 bg-[#05060A]/50 backdrop-blur-sm py-20">
                    <div className="container">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: 'x402 Latency', value: '<50ms' },
                                { label: 'Active Agents', value: '12,000+' },
                                { label: 'Types Transacted', value: '$1.2M+' },
                                { label: 'Uptime', value: '99.99%' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center group cursor-default">
                                    <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-[#7D45FD] transition-colors duration-300">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-[#8890A6] uppercase tracking-wider font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 md:py-16 border-t border-[#FFFFFF]/5 bg-[#010314]">
                    <div className="container">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-[#8890A6]" />
                                    <span className="text-[#8890A6] font-medium">SyncFlow Protocol © 2026</span>
                                </div>
                                <p className="text-sm text-[#8890A6] max-w-sm">
                                    The infrastructure layer for autonomous agent transactions on Cronos.
                                </p>
                            </div>

                            {/* Replaced generic links with 3D Social Card */}
                            <div className="scale-75 md:scale-90 origin-right">
                                <SocialCard />
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
