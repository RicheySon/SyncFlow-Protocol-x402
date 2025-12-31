'use client';

import Link from 'next/link';
import {
    ArrowLeft,
    Wallet,
    Settings,
    Activity,
    Database,
    Play,
    Pause,
    ExternalLink,
    ChevronRight,
    Save,
    RefreshCw,
    Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Mock Data
const agentData = {
    id: '1',
    name: 'Treasury Bot Alpha',
    type: 'DAO Manager',
    status: 'active',
    created: '2025-01-15',
    wallet: {
        address: '0x71C...9A23',
        cro: '4,500.50',
        usdc: '12,450.00',
    },
    mcpServers: [
        { name: 'Portfolio Server', status: 'connected', lastSync: '10s ago' },
        { name: 'Market Data Bridge', status: 'connected', lastSync: '12s ago' },
        { name: 'Cronos Indexer', status: 'connected', lastSync: '5s ago' },
    ],
    transactions: [
        { id: 1, type: 'Rebalance', amount: '$450.00', status: 'success', time: '10 mins ago' },
        { id: 2, type: 'Payment', amount: '$1,200.00', status: 'success', time: '2 hours ago' },
        { id: 3, type: 'Swap', amount: '$300.00', status: 'success', time: '5 hours ago' },
    ],
    metrics: {
        uptime: 99.9,
        successRate: 98.5,
        dailyVolume: '35%',
    }
};

export default function AgentDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/agents">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {agentData.name}
                        <Badge variant="success" className="ml-2">Active</Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-xs">{agentData.id}</span> • {agentData.type}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" /> Pause Agent
                    </Button>
                    <Button size="sm" variant="destructive">
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column (Main Config) */}
                <div className="md:col-span-7 space-y-6">
                    {/* Configuration Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                <CardTitle>Configuration</CardTitle>
                            </div>
                            <CardDescription>Manage agent behavior and risk parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Agent Name</Label>
                                <Input defaultValue={agentData.name} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Agent Type</Label>
                                    <Select defaultValue="dao">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dao">DAO Manager</SelectItem>
                                            <SelectItem value="trading">Trading Bot</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Risk Profile</Label>
                                    <Select defaultValue="medium">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Conservative</SelectItem>
                                            <SelectItem value="medium">Balanced</SelectItem>
                                            <SelectItem value="high">Aggressive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label>Auto-Execution</Label>
                                    <p className="text-xs text-muted-foreground">Allow autonomous transaction signing</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/50 px-6 py-3">
                            <Button size="sm" className="ml-auto">
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Logic / Instructions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-secondary" />
                                <CardTitle>Agent Instructions</CardTitle>
                            </div>
                            <CardDescription>Define the conditional logic for this agent.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">
                                <Textarea
                                    className="min-h-[200px] border-none bg-transparent p-0 focus-visible:ring-0 text-slate-50 font-mono"
                                    defaultValue={`// DAO Rebalancing Logic
IF (portfolio.usdc_ratio > 0.40) {
  EXECUTE swap({
    tokenIn: 'USDC',
    tokenOut: 'CRO',
    amount: portfolio.excess_usdc
  });
}

IF (date.isFirstOfMonth()) {
  EXECUTE batchPayment(contributors);
}`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* MCP Servers */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-blue-500" />
                                <CardTitle>MCP Data Sources</CardTitle>
                            </div>
                            <CardDescription>Connected Model Context Protocol servers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {agentData.mcpServers.map((server, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <div>
                                                <p className="font-medium text-sm">{server.name}</p>
                                                <p className="text-xs text-muted-foreground">Synced {server.lastSync}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Configure</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Wallet & Metrics) */}
                <div className="md:col-span-5 space-y-6">
                    {/* Wallet Card */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5" /> Smart Wallet
                                </CardTitle>
                                <Badge variant="secondary" className="font-mono text-xs">Cronos EVM</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <span className="font-mono truncate">{agentData.wallet.address}</span>
                                <Copy className="h-3 w-3 cursor-pointer hover:text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Total Balance</p>
                                <div className="text-3xl font-bold">$16,950.50</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-white/5 p-3">
                                    <p className="text-xs text-slate-400 mb-1">CRO Balance</p>
                                    <p className="font-semibold text-lg">{agentData.wallet.cro}</p>
                                </div>
                                <div className="rounded-lg bg-white/5 p-3">
                                    <p className="text-xs text-slate-400 mb-1">USDC Balance</p>
                                    <p className="font-semibold text-lg">{agentData.wallet.usdc}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Deposit</Button>
                                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-white/10">Withdraw</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Success Rate</span>
                                    <span className="font-medium">{agentData.metrics.successRate}%</span>
                                </div>
                                <Progress value={agentData.metrics.successRate} className="bg-slate-100" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Uptime</span>
                                    <span className="font-medium">{agentData.metrics.uptime}%</span>
                                </div>
                                <Progress value={agentData.metrics.uptime} className="bg-slate-100" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent History */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Recent Activity</CardTitle>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {agentData.transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-sm">{tx.type}</p>
                                            <p className="text-xs text-muted-foreground">{tx.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-sm text-green-600">+{tx.amount}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                                View All Transactions <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
