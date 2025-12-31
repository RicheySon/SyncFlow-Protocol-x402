'use client';

import { useState } from 'react';
import {
    ArrowLeft,
    Play,
    Pause,
    Settings,
    Save,
    Plus,
    Trash2,
    ArrowRight,
    Zap,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock Workflow Data
const workflowData = {
    id: '1',
    name: 'Auto-Hedge Staking Strategy',
    description: 'Stake CRO on VVS and open short on Moonlander to hedge price exposure.',
    status: 'active',
    agent: 'Hedge Manager X',
    triggers: ['Price Movement > 5%', 'Every 1 Hour'],
    steps: [
        { id: 1, type: 'trigger', name: 'Price Check', detail: 'CRO price > $0.15' },
        { id: 2, type: 'action', name: 'Swap', detail: 'Swap 1000 USDC to CRO' },
        { id: 3, type: 'action', name: 'Stake', detail: 'Stake CRO on VVS Finance' },
        { id: 4, type: 'action', name: 'Open Short', detail: 'Open 1x Short on Moonlander' },
    ]
};

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <a href="/dashboard/workflows">
                        <ArrowLeft className="h-4 w-4" />
                    </a>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {workflowData.name}
                        <Badge variant="success" className="ml-2">Active</Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-xs">ID: {workflowData.id}</span>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" /> Pause
                    </Button>
                    <Button size="sm">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Visual Builder Area */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="min-h-[600px] flex flex-col bg-slate-50/50 dark:bg-slate-950/30">
                        <CardHeader>
                            <CardTitle>Workflow Visualizer</CardTitle>
                            <CardDescription>Drag and drop steps to configure the execution flow.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 relative p-8">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                            <div className="relative z-10 flex flex-col items-center space-y-8 max-w-md mx-auto">
                                {/* Trigger Node */}
                                <div className="relative group w-full">
                                    <div className="bg-background border-2 border-primary rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Trigger: {workflowData.triggers[0]}</p>
                                                <p className="text-xs text-muted-foreground">Checks every 10 minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Connector Line */}
                                    <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-border -translate-x-1/2"></div>
                                    <div className="absolute left-1/2 -bottom-2 w-2 h-2 bg-border rounded-full -translate-x-1/2"></div>
                                </div>

                                {/* Steps */}
                                {workflowData.steps.slice(1).map((step, index) => (
                                    <div key={step.id} className="relative group w-full">
                                        <div className="bg-background border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                                    <Zap className="h-5 w-5 text-secondary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">{step.name}</p>
                                                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Connector Line (except for last) */}
                                        {index < workflowData.steps.length - 2 && (
                                            <>
                                                <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-border -translate-x-1/2"></div>
                                                <div className="absolute left-1/2 -bottom-2 w-2 h-2 bg-border rounded-full -translate-x-1/2"></div>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* Add Step Button */}
                                <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-dashed border-2">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="md:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Properties</CardTitle>
                            <CardDescription>Configure the selected step.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Action Type</Label>
                                <Select defaultValue="swap">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="swap">Token Swap</SelectItem>
                                        <SelectItem value="stake">Stake / Deposit</SelectItem>
                                        <SelectItem value="payment">Send Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Protocol</Label>
                                <Select defaultValue="vvs">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vvs">VVS Finance</SelectItem>
                                        <SelectItem value="moonlander">Moonlander</SelectItem>
                                        <SelectItem value="cronos">Cronos Swap</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Input Token</Label>
                                <Input defaultValue="USDC" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input defaultValue="1000" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/30 p-4">
                            <Button className="w-full">Update Step</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Execution History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Successfully executed</p>
                                        <p className="text-xs text-muted-foreground">Today, 10:2{i} AM</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
