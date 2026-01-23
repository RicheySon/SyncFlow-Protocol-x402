'use client';

import { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    CheckCircle2,
    Clock,
    Activity,
    DollarSign,
    Bot,
    MessageSquare,
    BarChart3,
    Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../components/ui/table';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { agentsApi } from '../../lib/api/agents';
import { transactionsApi } from '../../lib/api/transactions';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalVolume: 0,
        activeAgents: 0,
        successRate: 100,
        avgSettlementTime: '2.4s'
    });
    const [recentTx, setRecentTx] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Data in Parallel
            const [agents, transactions] = await Promise.all([
                agentsApi.getAll(),
                transactionsApi.getAll()
            ]);

            // 2. Aggregate Stats
            let totalVol = 0;
            let successCount = 0;
            const txCount = transactions.length;

            const allTxs = transactions.map((tx: any) => {
                const amount = parseFloat(tx.amount || '0');
                totalVol += amount;
                if (tx.status === 'success') successCount++;

                const agentName = agents.find(a => a.id === tx.agentId)?.name || 'Unknown Agent';

                return {
                    id: tx.id || tx.txHash,
                    agent: agentName,
                    action: tx.type || 'Payment',
                    amount: `${amount.toFixed(2)} ${tx.currency || 'TCRO'}`,
                    status: tx.status || 'success',
                    time: new Date(tx.createdAt || Date.now()).toLocaleTimeString(),
                    timestamp: new Date(tx.createdAt || Date.now()).getTime(),
                    hash: tx.txHash || '0x...'
                };
            });

            // Sort by new
            allTxs.sort((a, b) => b.timestamp - a.timestamp);

            setStats({
                totalVolume: totalVol,
                activeAgents: agents.length,
                successRate: txCount > 0 ? (successCount / txCount) * 100 : 100,
                avgSettlementTime: '2.1s'
            });

            setRecentTx(allTxs.slice(0, 10)); // Top 10

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
        // Listen for updates
        window.addEventListener('storage', loadDashboardData);
        return () => window.removeEventListener('storage', loadDashboardData);
    }, []);

    // Chart Data
    const settlementData = [
        { time: '00:00', volume: stats.totalVolume * 0.1 },
        { time: '04:00', volume: stats.totalVolume * 0.3 },
        { time: '08:00', volume: stats.totalVolume * 0.8 },
        { time: '12:00', volume: stats.totalVolume * 0.4 },
        { time: '16:00', volume: stats.totalVolume * 0.6 },
        { time: '20:00', volume: stats.totalVolume * 0.5 },
        { time: '23:59', volume: stats.totalVolume * 0.2 },
    ];

    // Quick Access Cards Data
    const quickAccessPages = [
        {
            title: 'Agents',
            description: 'Manage AI agents',
            icon: <Bot className="h-8 w-8" />,
            href: '/dashboard/agents',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Chat',
            description: 'AI conversations',
            icon: <MessageSquare className="h-8 w-8" />,
            href: '/dashboard/chat',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Transactions',
            description: 'Payment history',
            icon: <BarChart3 className="h-8 w-8" />,
            href: '/dashboard/transactions',
            gradient: 'from-orange-500 to-red-500'
        },
        {
            title: 'Dev Tools',
            description: 'SDK & API',
            icon: <Settings className="h-8 w-8" />,
            href: '/dashboard/dev-tools',
            gradient: 'from-green-500 to-emerald-500'
        }
    ];

    return (
        <div className="space-y-12">
            {/* Hero Section with Floating Cards */}
            <div className="relative min-h-[500px] flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border p-8">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

                {/* Title */}
                <div className="relative z-10 text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">SyncFlow</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Autonomous financial settlement for AI agents. Powered by x402 protocol on Cronos EVM.
                    </p>
                </div>

                {/* Typedream-style Clustered Composition */}
                <div className="relative w-full max-w-6xl h-[500px] flex items-center justify-center perspective-1000 mt-8">
                    {/* 1. Transactions - Left */}
                    <Link
                        href="/dashboard/transactions"
                        className="absolute z-20 transition-all duration-500 hover:scale-105 hover:z-40 group cursor-pointer hidden md:block"
                        style={{
                            transform: 'translateX(-280px) translateY(20px) rotateY(15deg) rotateZ(-2deg)',
                        }}
                    >
                        <Card className="w-[300px] h-[360px] border-border/50 shadow-xl bg-card/85 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full" />
                            <CardHeader>
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 mb-2">
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-xl">Transactions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-3xl font-bold tracking-tight">${stats.totalVolume.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Total settled volume</p>
                                </div>
                                <div className="space-y-2">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded border border-border/30">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span>Payment</span>
                                            </div>
                                            <span className="font-mono">+$24.00</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* 2. Agents - Center Hero */}
                    <Link
                        href="/dashboard/agents"
                        className="absolute z-30 transition-all duration-500 hover:scale-105 hover:z-40 group cursor-pointer"
                        style={{
                            transform: 'translateZ(50px) scale(1.05)',
                        }}
                    >
                        <Card className="w-[340px] h-[440px] border-border/50 shadow-2xl bg-card/90 backdrop-blur-xl border-t border-t-primary/20 relative overflow-hidden">
                            {/* Decorative top bar */}
                            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                            <CardHeader>
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                                    <Bot className="h-8 w-8 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl">Agents</CardTitle>
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                                            {stats.activeAgents} Active
                                        </Badge>
                                    </div>
                                    <CardDescription>Manage your autonomous workforce</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg border border-border/50">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="flex items-center gap-2 text-green-500 font-medium">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            Online
                                        </span>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg border border-border/50 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Performance</span>
                                            <span className="font-medium">98.5%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                            <div className="h-full w-[98.5%] bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0">
                                    Launch Agent <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* 3. Chat - Right */}
                    <Link
                        href="/dashboard/chat"
                        className="absolute z-20 transition-all duration-500 hover:scale-105 hover:z-40 group cursor-pointer hidden md:block"
                        style={{
                            transform: 'translateX(280px) translateY(20px) rotateY(-15deg) rotateZ(2deg)',
                        }}
                    >
                        <Card className="w-[300px] h-[360px] border-border/50 shadow-xl bg-card/85 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-br-full" />
                            <CardHeader>
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-2">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-xl">AI Chat</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="bg-primary/5 rounded-lg p-3 rounded-tl-none text-xs leading-relaxed border border-primary/10">
                                        Hello! I&apos;m your SyncFlow assistant.
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-3 rounded-tr-none text-xs leading-relaxed border border-border ml-auto max-w-[90%]">
                                        Check my detailed analytics.
                                    </div>
                                    <div className="bg-primary/5 rounded-lg p-3 rounded-tl-none text-xs leading-relaxed border border-primary/10">
                                        You&apos;ve processed 15 transactions...
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* 4. Dev Tools - Far Right (Vertical Stack) */}
                    <Link
                        href="/dashboard/dev-tools"
                        className="absolute z-10 transition-all duration-500 hover:scale-105 hover:z-40 group cursor-pointer hidden lg:block"
                        style={{
                            transform: 'translateX(480px) translateY(40px) rotateY(-25deg) rotateZ(4deg)',
                            opacity: 0.95
                        }}
                    >
                        <Card className="w-[300px] h-[360px] border-border/50 shadow-xl bg-card/85 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-700/20 to-transparent rounded-bl-full" />
                            <CardHeader>
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-900/20 mb-2 border border-slate-600">
                                    <Settings className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-xl">Dev Tools</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-mono text-[10px] bg-muted/80 p-3 rounded-lg border border-border text-muted-foreground leading-relaxed">
                                    <span className="text-purple-500">import</span> {'{ SyncFlow }'} <span className="text-purple-500">from</span>
                                    <br />
                                    <span className="text-green-500">&apos;@syncflow/sdk&apos;</span>;
                                    <br />
                                    <br />
                                    <span className="text-blue-500">const</span> client = <span className="text-purple-500">new</span> SyncFlow(config);
                                    <br />
                                    <span className="text-muted-foreground/50">{'// Initialize agent'}</span>
                                    <br />
                                    <span className="text-yellow-500">await</span> client.connect();
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Traditional Dashboard Metrics & Data (Scrollable Section) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                        <p className="text-muted-foreground">
                            Your platform metrics and recent activity.
                        </p>
                    </div>
                    <Link href="/dashboard/agents">
                        <Button>Create Agent</Button>
                    </Link>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="text-green-500 flex items-center">
                                    +{stats.activeAgents > 0 ? '12.5' : '0'}% <ArrowUpRight className="h-3 w-3" />
                                </span>{' '}
                                from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeAgents}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="text-green-500 flex items-center">
                                    +{stats.activeAgents} <ArrowUpRight className="h-3 w-3" />
                                </span>{' '}
                                new this week
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Settlement Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgSettlementTime}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="text-green-500 flex items-center">
                                    -150ms <ArrowDownRight className="h-3 w-3" />
                                </span>{' '}
                                average
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="text-green-500 flex items-center">
                                    +0.1% <ArrowUpRight className="h-3 w-3" />
                                </span>{' '}
                                uptime
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Activity */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Settlement Volume</CardTitle>
                            <CardDescription>
                                Transaction volume settled on Cronos EVM over the last 24 hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={settlementData}>
                                        <defs>
                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                        <XAxis
                                            dataKey="time"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="volume"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorVolume)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest autonomous actions executed by your agents.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentTx.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No recent activity found.</p>
                                ) : (
                                    recentTx.slice(0, 5).map((item, i) => (
                                        <div key={i} className="flex items-center">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className={
                                                    item.status === 'success' ? 'bg-green-500/20 text-green-600 dark:text-green-500' :
                                                        item.status === 'failed' ? 'bg-red-500/20 text-red-600 dark:text-red-500' :
                                                            'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500'
                                                }>
                                                    {item.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                                                        item.status === 'failed' ? <Zap className="h-4 w-4" /> :
                                                            <Clock className="h-4 w-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{item.agent}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.action} • {item.time}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                <span className={item.status === 'failed' ? 'text-destructive' : 'text-primary'}>
                                                    {item.status === 'failed' ? 'Failed' : '+' + item.amount}
                                                </span>
                                            </div>
                                        </div>
                                    )))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            A list of recent x402 settlements and on-chain operations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Tx Hash</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTx.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No transactions found. Create an agent and execute a payment!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentTx.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{item.agent}</TableCell>
                                            <TableCell>{item.action}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.status === 'success' ? 'default' :
                                                            item.status === 'failed' ? 'destructive' :
                                                                'secondary'
                                                    }
                                                    className={`capitalize ${item.status === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/20' : ''}`}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.amount}</TableCell>
                                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                                <a href={`https://cronos.org/explorer/testnet3/tx/${item.hash}`} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary">
                                                    {item.hash.substring(0, 10)}...
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    )))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .bg-grid-pattern {
                    background-image: linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                        linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
            `}</style>
        </div>
    );
}
