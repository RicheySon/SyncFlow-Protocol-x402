'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    MoreHorizontal,
    Play,
    Pause,
    Settings,
    Trash2,
    Wallet,
    Activity,
    Bot
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock Agents Data
const initialAgents = [
    {
        id: '1',
        name: 'Treasury Bot Alpha',
        type: 'DAO Manager',
        status: 'active',
        address: '0x71C...9A23',
        balance: { cro: '4,500', usdc: '12,450' },
        lastActive: '2 mins ago',
    },
    {
        id: '2',
        name: 'Hedge Manager X',
        type: 'Hedge Manager',
        status: 'paused',
        address: '0x82B...1C45',
        balance: { cro: '1,200', usdc: '5,000' },
        lastActive: '5 mins ago',
    },
    {
        id: '3',
        name: 'Yield Farmer Beta',
        type: 'Trading Bot',
        status: 'active',
        address: '0x93D...2E67',
        balance: { cro: '8,900', usdc: '25,000' },
        lastActive: '12 mins ago',
    },
];

export default function AgentsPage() {
    const [search, setSearch] = useState('');
    const [agents, setAgents] = useState(initialAgents);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
                    <p className="text-muted-foreground">
                        Manage your autonomous AI agents and their configurations.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create New Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Autonomous Agent</DialogTitle>
                            <DialogDescription>
                                Deploy a new AI agent with a dedicated smart wallet on Cronos EVM.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Agent Name</Label>
                                <Input id="name" placeholder="e.g. Treasury Manager Beta" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Agent Type</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select agent type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dao">DAO Manager</SelectItem>
                                        <SelectItem value="trading">Trading Bot</SelectItem>
                                        <SelectItem value="hedge">Hedge Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Risk Level</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" className="border-green-500/50 hover:bg-green-500/10 hover:text-green-500">Low</Button>
                                    <Button variant="outline" className="border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-500">Medium</Button>
                                    <Button variant="outline" className="border-red-500/50 hover:bg-red-500/10 hover:text-red-500">High</Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit">Deploy Agent</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Agents Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden transition-all hover:border-primary/50">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Bot className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold">{agent.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{agent.type}</p>
                                </div>
                            </div>
                            <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                                {agent.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Smart Wallet</span>
                                    <span className="font-mono">{agent.address}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Last Active</span>
                                    <span>{agent.lastActive}</span>
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted p-3 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                                    <Wallet className="h-3 w-3" /> Portfolio Balance
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">{agent.balance.cro} CRO</span>
                                    <span className="text-muted-foreground">${agent.balance.usdc} USDC</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/30 p-4">
                            <div className="flex w-full items-center justify-between gap-2">
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link href={`/dashboard/agents/${agent.id}`}>View Details</Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    {agent.status === 'active' ? (
                                        <Pause className="h-4 w-4" />
                                    ) : (
                                        <Play className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}

                {/* Empty State Create Card */}
                <Card
                    className="flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <div className="flex flex-col items-center gap-4 py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Deploy New Agent</p>
                            <p className="text-sm text-muted-foreground">Add another autonomous agent</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
