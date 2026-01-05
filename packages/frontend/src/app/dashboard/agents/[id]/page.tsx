'use client';

import React, { useState, useEffect } from 'react';
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
import { agentsApi, type Agent } from '@/lib/api/agents';

// Mock transactions and other data not yet in API can remain as placeholders or empty for now
const mockTransactions: any[] = [];
const mockMcpServers: any[] = [];

// BatchPaymentModal component remains the same
function BatchPaymentModal({ subUsersCount }: { subUsersCount: number }) {
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
                                Ready to distribute funds to {subUsersCount} recipients.
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

function AddUserModal({ onAddUser }: { onAddUser: (user: any) => void }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        allocation: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddUser({
            id: Date.now().toString(),
            ...formData,
            allocation: formData.allocation.includes('%') ? formData.allocation : `${formData.allocation}%`
        });
        setFormData({ name: '', address: '', allocation: '' });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Recipient</DialogTitle>
                    <DialogDescription>
                        Add a new user to the distribution list.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Alice (Dev)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Wallet Address</Label>
                            <Input
                                id="address"
                                placeholder="0x..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="allocation">Allocation (%)</Label>
                            <Input
                                id="allocation"
                                placeholder="e.g. 20"
                                value={formData.allocation}
                                onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Recipient</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditUserModal({ user, onEditUser }: { user: any; onEditUser: (userId: string, updatedUser: any) => void }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        address: user.address,
        allocation: user.allocation.replace('%', '')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onEditUser(user.id, {
            ...formData,
            allocation: formData.allocation.includes('%') ? formData.allocation : `${formData.allocation}%`
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Recipient</DialogTitle>
                    <DialogDescription>
                        Update recipient information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="e.g. Alice (Dev)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-address">Wallet Address</Label>
                            <Input
                                id="edit-address"
                                placeholder="0x..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-allocation">Allocation (%)</Label>
                            <Input
                                id="edit-allocation"
                                placeholder="e.g. 20"
                                value={formData.allocation}
                                onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [subUsers, setSubUsers] = useState<any[]>([]); // Initialize empty
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                setLoading(true);
                const data = await agentsApi.getById(params.id);
                setAgent(data);
                // Future: fetch subUsers here if API supports it
            } catch (err: any) {
                setError(err.message || 'Failed to load agent');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchAgent();
        }
    }, [params.id]);

    const handleAddUser = (user: any) => {
        setSubUsers([...subUsers, user]);
    };

    const handleEditUser = (userId: string, updatedUser: any) => {
        setSubUsers(subUsers.map(user => 
            user.id === userId ? { ...user, ...updatedUser } : user
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading agent details...</p>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-destructive">{error || 'Agent not found'}</p>
                <Button asChild>
                    <Link href="/dashboard/agents">Back to Agents</Link>
                </Button>
            </div>
        );
    }

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
                        {agent.name}
                        <Badge variant="default" className="ml-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                            {agent.status}
                        </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{agent.id}</span>
                        <span className="text-slate-600">•</span>
                        <Badge variant="outline" className="text-xs bg-slate-900 border-slate-800 capitalize">{agent.type}</Badge>
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
                                <AddUserModal onAddUser={handleAddUser} />
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
                                        {subUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No recipients added yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            subUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{user.address}</TableCell>
                                                    <TableCell>{user.allocation}</TableCell>
                                                    <TableCell className="text-right">
                                                        <EditUserModal user={user} onEditUser={handleEditUser} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
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
                                <h2 className="text-3xl font-bold font-mono tracking-tight">$0.00</h2>
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
                                    <p className="font-mono text-xs truncate text-slate-300">
                                        {agent.walletAddress || 'Not Deployed'}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">CRO Balance</span>
                                    <span className="font-mono">0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">USDC Balance</span>
                                    <span className="font-mono">0.00</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <BatchPaymentModal subUsersCount={subUsers.length} />
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
                            {mockTransactions.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No recent activity.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {mockTransactions.map((tx) => (
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
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
