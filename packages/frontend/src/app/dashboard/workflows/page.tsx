'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Workflow as WorkflowIcon,
    ArrowRight,
    Play,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Plus,
    GitBranch,
    Zap,
    DollarSign,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { workflowsApi, type Workflow } from '@/lib/api/workflows';

const initialWorkflows: Workflow[] = [];

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        steps: '[]', // Default empty steps JSON
    });

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const data = await workflowsApi.getAll();
            setWorkflows(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch workflows');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name) {
            alert('Please enter a workflow name');
            return;
        }
        try {
            await workflowsApi.create(formData);
            setFormData({ name: '', description: '', steps: '[]' });
            setIsCreateOpen(false);
            fetchWorkflows();
        } catch (err: any) {
            alert(`Failed to create workflow: ${err.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this workflow?')) return;
        try {
            await workflowsApi.delete(id);
            fetchWorkflows();
        } catch (err: any) {
            alert(`Failed to delete: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor your automated workflows
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Workflow
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Workflow</DialogTitle>
                            <DialogDescription>
                                Create a new automated workflow
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Workflow Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="My Trading Strategy"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Automated DCA strategy"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading workflows...</div>
            ) : error ? (
                <div className="text-center py-12 text-destructive">{error}</div>
            ) : workflows.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <WorkflowIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No workflows yet</h3>
                        <p className="text-muted-foreground">Get started by creating your first workflow</p>
                        <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Workflow
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map((workflow) => (
                        <Card key={workflow.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                                        {workflow.description && (
                                            <p className="text-sm text-muted-foreground">{workflow.description}</p>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <Play className="mr-2 h-4 w-4" />
                                                Execute Now
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(workflow.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                                            {workflow.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Steps</span>
                                        <span className="font-medium">
                                            {Array.isArray(workflow.steps) ? workflow.steps.length : 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/dashboard/workflows/${workflow.id}`} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
