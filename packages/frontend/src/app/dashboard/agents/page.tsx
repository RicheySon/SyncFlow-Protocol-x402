'use client';

import { useState, useEffect } from 'react';
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
import { agentsApi, type Agent } from '@/lib/api/agents';

export default function AgentsPage() {
    const [search, setSearch] = useState('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'protocol',
        description: '',
        baseToken: 'eUSDC',
    });

    // Fetch agents on mount
    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await agentsApi.getAll();
            setAgents(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await agentsApi.create({
                name: formData.name,
                type: formData.type,
                description: formData.description,
                config: JSON.stringify({ risk: 'low', baseToken: formData.baseToken }), // Default config with Base Token
            });
            setIsCreateOpen(false);
            setFormData({ name: '', type: 'protocol', description: '', baseToken: 'eUSDC' });
            fetchAgents(); // Refresh list
        } catch (err: any) {
            alert(`Failed to create agent: ${err.message}`);
        }
    };

    const handleDeleteAgent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agent?')) return;
        try {
            await agentsApi.delete(id);
            fetchAgents(); // Refresh list
        } catch (err: any) {
            alert(`Failed to delete agent: ${err.message}`);
        }
    };

    const handleToggleStatus = async (agent: Agent) => {
        try {
            const newStatus = agent.status === 'active' ? 'paused' : 'active';
            await agentsApi.update(agent.id, { status: newStatus });
            fetchAgents(); // Refresh list
        } catch (err: any) {
            alert(`Failed to update agent: ${err.message}`);
        }
    };

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
                        <form onSubmit={handleCreateAgent}>
                            <DialogHeader>
                                <DialogTitle>Create Autonomous Agent</DialogTitle>
                                <DialogDescription>
                                    Deploy a new AI agent with a dedicated smart wallet on Cronos EVM.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Agent Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Treasury Manager Beta"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="baseToken">Base Token</Label>
                                    <Select
                                        value={formData.baseToken}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, baseToken: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select base token" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            <SelectItem value="eUSDC">eUSDC</SelectItem>
                                            <SelectItem value="eAVAX">eAVAX</SelectItem>
                                            <SelectItem value="eUSDT">eUSDT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Entity Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: any) =>
                                            setFormData({ ...formData, type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select entity type" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            <SelectItem value="protocol">Protocol</SelectItem>
                                            <SelectItem value="dao">DAO</SelectItem>
                                            <SelectItem value="fund">Investment Fund</SelectItem>
                                            <SelectItem value="individual">Individual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Brief description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit">Deploy Agent</Button>
                            </DialogFooter>
                        </form>
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
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Loading agents...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={fetchAgents}>Retry</Button>
                </div>
            ) : (
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
                                        <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                                    </div>
                                </div>
                                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                                    {agent.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Agent ID</span>
                                        <span className="font-mono text-xs">{agent.id.slice(0, 8)}...</span>
                                    </div>
                                    {agent.walletAddress && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Wallet className="h-3 w-3" /> Wallet
                                            </span>
                                            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded" title={agent.walletAddress}>
                                                {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
                                            </span>
                                        </div>
                                    )}
                                    {agent.description && (
                                        <div className="text-sm text-muted-foreground">
                                            {agent.description}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/30 p-4">
                                <div className="flex w-full items-center justify-between gap-2">
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/dashboard/agents/${agent.id}`}>View Details</Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => handleToggleStatus(agent)}
                                    >
                                        {agent.status === 'active' ? (
                                            <Pause className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteAgent(agent.id)}
                                    >
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
            )}
        </div>
    );
}
