'use client';

import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Zap,
    CheckCircle2,
    Clock,
    Activity,
    DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

// Mock Data
const settlementData = [
    { time: '00:00', volume: 2400 },
    { time: '04:00', volume: 1398 },
    { time: '08:00', volume: 9800 },
    { time: '12:00', volume: 3908 },
    { time: '16:00', volume: 4800 },
    { time: '20:00', volume: 3800 },
    { time: '23:59', volume: 4300 },
];

const recentActivity = [
    {
        id: '1',
        agent: 'Treasury Bot Alpha',
        action: 'Rebalancing',
        amount: '$12,450.00',
        status: 'success',
        time: '2 mins ago',
        hash: '0x7f2...3a9',
    },
    {
        id: '2',
        agent: 'Hedge Manager X',
        action: 'Open Position',
        amount: '$5,000.00',
        status: 'pending',
        time: '5 mins ago',
        hash: '0x8a1...4b2',
    },
    {
        id: '3',
        agent: 'Yield Farmer Beta',
        action: 'Harvest',
        amount: '$342.50',
        status: 'success',
        time: '12 mins ago',
        hash: '0x9c3...5c1',
    },
    {
        id: '4',
        agent: 'Arb Bot Delta',
        action: 'Swap',
        amount: '$1,200.00',
        status: 'failed',
        time: '1 hour ago',
        hash: '0x1d4...6d4',
    },
    {
        id: '5',
        agent: 'Treasury Bot Alpha',
        action: 'Payment',
        amount: '$4,500.00',
        status: 'success',
        time: '2 hours ago',
        hash: '0x5e2...7e8',
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, Admin. Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button>Create Agent</Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-green-500 flex items-center">
                                +20.1% <ArrowUpRight className="h-3 w-3" />
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
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-green-500 flex items-center">
                                +2 <ArrowUpRight className="h-3 w-3" />
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
                        <div className="text-2xl font-bold">2.4s</div>
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
                        <div className="text-2xl font-bold">99.8%</div>
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
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0F172A',
                                            border: '1px solid #1E293B',
                                            borderRadius: '8px',
                                            color: '#F1F5F9'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="volume"
                                        stroke="#10B981"
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
                            {recentActivity.map((item) => (
                                <div key={item.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={
                                            item.status === 'success' ? 'bg-green-500/20 text-green-500' :
                                                item.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-yellow-500/20 text-yellow-500'
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
                            ))}
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
                            {recentActivity.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.agent}</TableCell>
                                    <TableCell>{item.action}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                item.status === 'success' ? 'success' :
                                                    item.status === 'failed' ? 'destructive' :
                                                        'warning'
                                            }
                                            className="capitalize"
                                        >
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.amount}</TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {item.hash}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
