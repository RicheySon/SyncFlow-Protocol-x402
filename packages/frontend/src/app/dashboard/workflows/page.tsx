'use client';

import Link from 'next/link';
import {
    Workflow,
    ArrowRight,
    Play,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Plus,
    GitBranch,
    Zap,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const workflows = [
    {
        id: '1',
        name: 'Auto-Hedge Staking',
        description: 'Stake CRO on VVS and open short on Moonlander to hedge price exposure.',
        status: 'active',
        agent: 'Hedge Manager X',
        steps: 5,
        lastRun: '10 mins ago',
        successRate: '98%',
    },
    {
        id: '2',
        name: 'Treasury Distribution',
        description: 'Monthly payout to contributors via batch distribution.',
        status: 'paused',
        agent: 'Treasury Bot Alpha',
        steps: 3,
        lastRun: '25 days ago',
        successRate: '100%',
    },
    {
        id: '3',
        name: 'Arbitrage Loop',
        description: 'Monitor price diff between VVS and Cronos Swap.',
        status: 'failed',
        agent: 'Arb Bot Delta',
        steps: 4,
        lastRun: '1 hour ago',
        successRate: '65%',
    },
];

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
                                    workflow.status === 'active' ? 'success' :
                                        workflow.status === 'paused' ? 'secondary' :
                                            'destructive'
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
                                {workflow.steps > 2 && (
                                    <>
                                        <ArrowRight className="h-3 w-3" />
                                        <Badge variant="outline" className="h-5 px-1 bg-background">+{workflow.steps - 2}</Badge>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Assigned Agent</p>
                                    <p className="font-medium truncate">{workflow.agent}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Success Rate</p>
                                    <p className="font-medium">{workflow.successRate}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/30 p-4">
                            <div className="flex w-full items-center justify-between">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Ran {workflow.lastRun}
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
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}

                {/* Create Card */}
                <Card className="flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all min-h-[300px]">
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
