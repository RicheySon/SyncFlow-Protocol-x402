'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Wallet,
    Settings,
    Activity,
    Database,
    Pause,
    Save,
    RefreshCw,
    Copy,
    Users,
    UserPlus,
    CreditCard,
    ShieldCheck,
    Lock,
    Zap,
    CheckCircle2,
    Key
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
        { id: 2, type: 'Batch Payment', amount: '$1,200.00', status: 'success', time: '2 hours ago' },
        { id: 3, type: 'Swap', amount: '$300.00', status: 'success', time: '5 hours ago' },
    ],
    metrics: {
        uptime: 99.9,
        successRate: 98.5,
        dailyVolume: '35%',
    },
    subUsers: [
        { id: 'u1', name: 'Alice (Dev)', address: '0x123...abc', allocation: '20%' },
        { id: 'u2', name: 'Bob (Design)', address: '0x456...def', allocation: '15%' },
        { id: 'u3', name: 'Charlie (Marketing)', address: '0x789...ghi', allocation: '10%' },
    ]
};

function BatchPaymentModal() {
    const [step, setStep] = useState(0);
    const [processing, setProcessing] = useState(false);

    const steps = [
        { title: 'Submit Request', icon: CreditCard, desc: 'Analyzing payout recipients...' },
        { title: 'Fee Calculation', icon: Activity, desc: 'Validating x402 fees (0.1%)...' },
        { title: 'Encryption', icon: Lock, desc: 'Encrypting batch payload w/ eERC...' },
        { title: 'Execution', icon: Zap, desc: 'Initiating execution on Cronos EVM...' },
        { title: 'Distribution', icon: CheckCircle2, desc: 'Recipients receiving encrypted payouts.' }
    ];

    const runSimulation = () => {
        setProcessing(true);
        setStep(0);

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            setStep(currentStep);
            if (currentStep >= steps.length - 1) {
                clearInterval(interval);
                setTimeout(() => setProcessing(false), 1000);
            }
        }, 1500);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
                    <Zap className="mr-2 h-4 w-4" /> Launch Batch Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>x402 Batch Settlement</DialogTitle>
                    <DialogDescription>
                        Secure, encrypted multi-party distribution.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {/* Status Steps */}
                    <div className="flex justify-between items-start relative px-2">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-10" />

                        {steps.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-20">
                                <div className={`
                                    h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-500
                                    ${i <= step ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}
                                    ${i === step && processing ? 'animate-pulse ring-2 ring-emerald-500/50' : ''}
                                `}>
                                    <s.icon className="h-4 w-4" />
                                </div>
                                <span className={`text-[10px] text-center font-medium ${i <= step ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Current Step Detail */}
                    <div className="mt-8 text-center min-h-[60px]">
                        {processing || step > 0 ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="font-semibold text-lg text-white mb-1">
                                    {steps[step]?.title || 'Complete'}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {steps[step]?.desc || 'Batch distribution completed successfully.'}
                                </p>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm">
                                Ready to distribute funds to {agentData.subUsers.length} recipients.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={runSimulation}
                        disabled={processing}
                        className={step === steps.length - 1 && !processing ? "bg-slate-700" : "bg-emerald-500 hover:bg-emerald-600"}
                    >
                        {processing ? 'Processing...' : (step === steps.length - 1 ? 'Close Report' : 'Execute Batch')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
    const [subUsers, setSubUsers] = useState(agentData.subUsers);

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
                        <Badge variant="default" className="ml-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{agentData.id}</span>
                        <span className="text-slate-600">•</span>
                        <Badge variant="outline" className="text-xs bg-slate-900 border-slate-800">{agentData.type}</Badge>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" /> Pause
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column (Main Config) */}
                <div className="md:col-span-8 space-y-6">

                    {/* Sub Users / Recipients */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-400" />
                                    <CardTitle>Sub Users & Recipients</CardTitle>
                                </div>
                                <Button size="sm" variant="secondary">
                                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                                </Button>
                            </div>
                            <CardDescription>Manage recipients for this entity's distributions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Allocation</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{user.address}</TableCell>
                                                <TableCell>{user.allocation}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logic / Instructions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-secondary" />
                                <CardTitle>Entity Logic</CardTitle>
                            </div>
                            <CardDescription>Define the conditional logic for this entity.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">
                                <Textarea
                                    className="min-h-[200px] border-none bg-transparent p-0 focus-visible:ring-0 text-slate-50 font-mono"
                                    defaultValue={`// Weekly Payroll Logic
IF (date.day === 'FRIDAY') {
  EXECUTE batchPayment(subUsers, {
    currency: 'eUSDC',
    total_amount: 5000
  });
}

// Auto-Swap
IF (wallet.cro > 10000) {
  EXECUTE swap('CRO', 'USDC', 5000);
}`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label>Auto-Execution</Label>
                                    <p className="text-xs text-muted-foreground">Allow autonomous transaction signing</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Wallet & Metrics) */}
                <div className="md:col-span-4 space-y-6">
                    {/* Wallet Card */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border-slate-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5" /> Wallet Info
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white">
                                    <RefreshCw className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs text-slate-400">Total Balance</p>
                                <h2 className="text-3xl font-bold font-mono tracking-tight">$16,950.50</h2>
                                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Protected by x402
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-slate-400">Smart Address</span>
                                        <Copy className="h-3 w-3 text-slate-500 cursor-pointer hover:text-white" />
                                    </div>
                                    <p className="font-mono text-xs truncate text-slate-300">{agentData.wallet.address}</p>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">CRO Balance</span>
                                    <span className="font-mono">{agentData.wallet.cro}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">USDC Balance</span>
                                    <span className="font-mono">{agentData.wallet.usdc}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <BatchPaymentModal />
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                        Deposit
                                    </Button>
                                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                        <Key className="mr-2 h-3 w-3" /> Keys
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {agentData.transactions.map((tx) => (
                                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type.includes('Payment') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{tx.type}</p>
                                                <p className="text-xs text-muted-foreground">{tx.time}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium">{tx.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
