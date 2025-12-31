'use client';

import { useState } from 'react';
import {
    Code,
    Copy,
    Terminal,
    Box,
    Key,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const sdkInstallCode = `npm install @syncflow/sdk ethers`;

const initCode = `import { SyncFlowClient, ChainId } from '@syncflow/sdk';

const client = new SyncFlowClient({
  chainId: ChainId.CRONOS_MAINNET,
  apiKey: process.env.SYNCFLOW_API_KEY
});

await client.connect();`;

const createAgentCode = `const agent = await client.createAgent({
  name: 'Treasury Manager',
  type: 'DAO_MGR',
  riskProfile: 'LOW',
  autoExecute: true
});

console.log('Agent Deployed:', agent.address);`;

const executeTxCode = `const receipt = await agent.execute({
  action: 'SWAP',
  params: {
    tokenIn: 'USDC',
    tokenOut: 'CRO',
    amount: '1000'
  }
});`;

export default function DevToolsPage() {
    const [activeTab, setActiveTab] = useState('sdk');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
                    <p className="text-muted-foreground">
                        SDKs, API keys, and resources for building on SyncFlow.
                    </p>
                </div>
                <Button variant="outline">
                    <ExternalLinkIcon className="mr-2 h-4 w-4" /> View Full Documentation
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* API Keys Section */}
                <div className="md:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" /> API Keys
                            </CardTitle>
                            <CardDescription>Manage your access credentials.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Public Key</Label>
                                <div className="flex items-center space-x-2">
                                    <Input readOnly value="pk_live_51M..." className="font-mono text-xs" />
                                    <Button size="icon" variant="outline" className="shrink-0">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Secret Key</Label>
                                <div className="flex items-center space-x-2">
                                    <Input type="password" value="sk_live_..." className="font-mono text-xs" />
                                    <Button size="icon" variant="outline" className="shrink-0">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Button className="w-full">Generate New Keys</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-500" /> System Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Mainnet API</span>
                                <Badge variant="success">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Indexer</span>
                                <Badge variant="success">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">MCP Bridge</span>
                                <Badge variant="warning">Degraded</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SDK & Resources */}
                <div className="md:col-span-8">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>SDK Quickstart</CardTitle>
                            <CardDescription>Get started with the TypeScript SDK in minutes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="sdk" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="sdk" className="flex items-center gap-2">
                                        <Box className="h-4 w-4" /> Installation
                                    </TabsTrigger>
                                    <TabsTrigger value="init" className="flex items-center gap-2">
                                        <Terminal className="h-4 w-4" /> Initialization
                                    </TabsTrigger>
                                    <TabsTrigger value="agent" className="flex items-center gap-2">
                                        <Code className="h-4 w-4" /> Create Agent
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="sdk" className="space-y-4">
                                    <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50 relative group">
                                        <pre>{sdkInstallCode}</pre>
                                        <Button size="icon" variant="ghost" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" /> TypeScript Ready
                                            </h4>
                                            <p className="text-sm text-muted-foreground">Full type definitions included for all resources.</p>
                                        </div>
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" /> Ethers.js Compatible
                                            </h4>
                                            <p className="text-sm text-muted-foreground">Built on standard web3 primitives.</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="init" className="space-y-4">
                                    <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50 relative group">
                                        <pre>{initCode}</pre>
                                        <Button size="icon" variant="ghost" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="agent" className="space-y-4">
                                    <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50 relative group">
                                        <pre>{createAgentCode}</pre>
                                        <Button size="icon" variant="ghost" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-2">Next Steps:</h4>
                                        <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50 relative group">
                                            <pre>{executeTxCode}</pre>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ExternalLinkIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}
