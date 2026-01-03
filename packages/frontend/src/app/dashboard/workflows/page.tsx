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

    const handleCreateWorkflow = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await workflowsApi.create({
                name: formData.name,
                description: formData.description,
                steps: formData.steps
            });
            setIsCreateOpen(false);
            setFormData({ name: '', description: '', steps: '[]' });
            fetchWorkflows();
        } catch (err: any) {
            alert(`Failed to create: ${err.message}`);
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

    export default function WorkflowsPage() {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
                        <p className="text-muted-foreground">
                            Design and monitor multi-leg autonomous payment flows.
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Workflow
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map((workflow) => (
                        <Card key={workflow.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                            {workflow.description}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        workflow.status === 'active' ? 'default' :
                                            workflow.status === 'completed' ? 'secondary' :
                                                'outline'
                                    } className="capitalize">
                                        {workflow.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                {/* Visual Flow Mini */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg overflow-hidden">
                                    <div className="flex items-center gap-1">
                                        <div className="p-1 bg-background rounded border">
                                            <DollarSign className="h-3 w-3" />
                                        </div>
                                        <span>Trigger</span>
                                    </div>
                                    <ArrowRight className="h-3 w-3" />
                                    <div className="flex items-center gap-1">
                                        <div className="p-1 bg-background rounded border">
                                            <Zap className="h-3 w-3" />
                                        </div>
                                        <span>Action</span>
                                    </div>
                                    {workflow.steps && JSON.parse(workflow.steps).length > 2 && (
                                        <>
                                            <ArrowRight className="h-3 w-3" />
                                            <Badge variant="outline" className="h-5 px-1 bg-background">+{JSON.parse(workflow.steps).length - 2}</Badge>
                                        </>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Created</p>
                                        <p className="font-medium truncate">
                                            {new Date(workflow.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Status</p>
                                        <p className="font-medium capitalize">{workflow.status}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/30 p-4">
                                <div className="flex w-full items-center justify-between">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Play className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit Workflow</DropdownMenuItem>
                                                <DropdownMenuItem>View History</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(workflow.id)}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Create Card */}
                    <Card className="flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all min-h-[300px]"
                        onClick={() => setIsCreateOpen(true)}>
                        <div className="flex flex-col items-center gap-4 text-center p-6">
                            <div className="p-4 rounded-full bg-primary/10">
                                <GitBranch className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Design Workflow</h3>
                                <p className="text-sm text-muted-foreground max-w-[200px]">
                                    Create a new automation pipeline with drag-and-drop builder.
                                </p>
                            </div>
                            <Button variant="outline" className="mt-2">Start Builder</Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
