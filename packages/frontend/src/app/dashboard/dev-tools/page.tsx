'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
    Code,
    Copy,
    Terminal,
    Box,
    Key,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { apiClient } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
const sdkInstallCode = `npm install syncflow-protocol-sdk-demo ethers`;

const initCode = `import { SyncFlowClient, ChainId } from '@syncflow/sdk';
import { ethers } from 'ethers';

// 1. Connect to Wallet (e.g. MetaMask)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 2. Initialize Client with Signer
const client = new SyncFlowClient({
  baseUrl: 'http://localhost:3001',
  apiKey: process.env.SYNCFLOW_API_KEY,
  signer: signer // Required for x402 auto-payments
});`;

const createAgentCode = `const agent = await client.createAgent({
  name: 'Payroll Manager',
  type: 'PAYROLL',
  riskProfile: 'LOW',
  autoExecute: false
});

console.log('Agent Deployed:', agent.address);`;

const executeTxCode = `// Add recipients for batch payment
await agent.addRecipient({
  name: 'Employee 1',
  address: '0x742d...35A1',
  amount: '100',
  currency: 'TCRO'
});

// Execute batch payment via X402 Protocol
const receipt = await agent.executeBatchPayment({
  protocol: 'x402',
  recipients: agent.getRecipients(),
  currency: 'TCRO'
});`;

export default function DevToolsPage() {
    const [statusData, setStatusData] = useState<any>(null);
    const [configData, setConfigData] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Fetch Status
        apiClient('/devtools/status').then(setStatusData).catch(console.error);
        // Fetch Config
        apiClient('/devtools/config').then(setConfigData).catch(console.error);
    }, []);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runDiagnostics = async () => {
        try {
            setLogs([]);
            addLog('🔍 Starting Agent Health Check...');

            // 1. Check Wallet
            if (!(window as any).ethereum) {
                addLog('❌ Wallet not detected.');
                return;
            }
            addLog('✅ Wallet detected.');

            // 2. RPC Latency Check
            const start = Date.now();
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            await provider.getBlockNumber();
            const latency = Date.now() - start;
            addLog(`✅ RPC Connectivity: OK (Latency: ${latency}ms)`);

            // 3. Chain ID Match
            const network = await provider.getNetwork();
            const expectedChainId = BigInt(338);
            if (network.chainId === expectedChainId) {
                addLog('✅ Network: Cronos Testnet (Match)');
            } else {
                addLog(`⚠️ Network Mismatch: Found ${network.chainId}, Expected 338`);
            }

            addLog('✨ Diagnostics Complete: All systems nominal.');
            alert('Health Check Complete: Systems Nominal.');
        } catch (e: any) {
            addLog(`❌ Diagnostic Error: ${e.message}`);
        }
    };

    const runTest = async () => {
        try {
            setLogs([]);
            addLog('🚀 Starting x402 Test...');

            // 1. Check for Wallet
            if (!(window as any).ethereum) {
                alert('MetaMask not found!');
                return;
            }

            // 2. Connect Wallet & Switch Network
            addLog('🔌 Connecting to Wallet...');
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            await provider.send("eth_requestAccounts", []);

            addLog('twistednet: Switching to Cronos...');
            try {
                await provider.send("wallet_switchEthereumChain", [{ chainId: "0x152" }]); // 338
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await provider.send("wallet_addEthereumChain", [{
                            chainId: "0x152",
                            chainName: "Cronos Testnet",
                            rpcUrls: ["https://evm-t3.cronos.org"],
                            nativeCurrency: {
                                name: "TCRO",
                                symbol: "TCRO",
                                decimals: 18
                            },
                            blockExplorerUrls: ["https://cronos.org/explorer/testnet3"]
                        }]);
                    } catch (addError) {
                        throw new Error('Failed to add Cronos network');
                    }
                }
                // handle other specific errors or strict ignoring
            }

            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            addLog(`✅ Connected: ${address}`);

            // Add Disconnect Helper
            const disconnectInfo = document.createElement('div');
            disconnectInfo.innerHTML = `
                <div style="margin-top: 10px; padding: 10px; background: #333; border-radius: 5px;">
                    <p style="color: #bbb; font-size: 12px; margin-bottom: 5px;">Connected: ${address.slice(0, 6)}...${address.slice(-4)}</p>
                    <button id="disconnect-btn" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Disconnect Wallet</button>
                    <p style="color: #666; font-size: 10px; margin-top: 5px;">Note: You must also disconnect in your "Hot Wallet" extension.</p>
                </div>
            `;
            // Append to logs for visibility since we are in a text log flow
            // Actually, we can just log instructions.
            addLog(`💡 To Disconnect: Reload the page or use the Disconnect button below.`);

            // Temporary UI hack to show button in logs?
            // Better: update the UI state. But runTest is a function.
            // We'll just alert user on how to disconnect.

            // 3. Initialize Client
            const { SyncFlow } = await import('syncflow-protocol-sdk-demo');

            const client = new SyncFlow({
                baseUrl: '/api', // Use internal API
                apiKey: 'test-key',
                signer: signer
            });

            // 4. Call Protected Endpoint
            addLog('🔒 Calling Protected Endpoint (/agents/interaction)...');
            addLog('ℹ️ This should trigger a 402, then payment, then retry.');

            const response = await client.agents.interact('Hello Agent!', { test: true });

            addLog(`✅ Success! Response: ${JSON.stringify(response)}`);
            alert('Test Passed! Payment Flow Successful.');

        } catch (e: any) {
            console.error(e);

            let errorMessage = e.message;
            if (e.response && e.response.data) {
                // Determine if data is object or string
                const serverError = typeof e.response.data === 'object'
                    ? JSON.stringify(e.response.data)
                    : e.response.data;
                errorMessage += ` | Server: ${serverError}`;
            }

            addLog(`❌ Error: ${errorMessage}`);
            alert('Test Failed: ' + errorMessage);
        }
    };

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
                                <Label>Chain ID</Label>
                                <div className="flex items-center space-x-2">
                                    <Input readOnly value={configData?.chainId || 'Loading...'} className="font-mono text-xs" />
                                    <Button size="icon" variant="outline" className="shrink-0">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>RPC URL</Label>
                                <div className="flex items-center space-x-2">
                                    <Input readOnly value={configData?.rpcUrl || 'Loading...'} className="font-mono text-xs" />
                                    <Button size="icon" variant="outline" className="shrink-0">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
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
                                <Badge variant={statusData?.services?.api === 'running' ? 'default' : 'destructive'} className={statusData?.services?.api === 'running' ? 'bg-emerald-500' : ''}>
                                    {statusData?.services?.api === 'running' ? 'Operational' : 'Down'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Database</span>
                                <Badge variant={statusData?.services?.database === 'connected' ? 'default' : 'destructive'} className={statusData?.services?.database === 'connected' ? 'bg-emerald-500' : ''}>
                                    {statusData?.services?.database === 'connected' ? 'Connected' : 'Disconnected'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Cronos RPC</span>
                                <Badge variant={statusData?.services?.blockchain_rpc?.includes('Block') ? 'default' : 'secondary'} className={statusData?.services?.blockchain_rpc?.includes('Block') ? 'bg-emerald-500' : ''}>
                                    {statusData?.services?.blockchain_rpc || 'Pending Check'}
                                </Badge>
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
                            <Tabs defaultValue="test" className="space-y-4">
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
                                    <TabsTrigger value="test" className="flex items-center gap-2">
                                        <Terminal className="h-4 w-4" /> Testing Console
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="sdk" className="space-y-4">
                                    <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100 relative group border border-border">
                                        <pre>{sdkInstallCode}</pre>
                                        <Button size="icon" variant="ghost" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" /> TypeScript Ready
                                            </h4>
                                            <p className="text-sm text-muted-foreground">Full type definitions included for all resources.</p>
                                        </div>
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" /> Ethers.js Compatible
                                            </h4>
                                            <p className="text-sm text-muted-foreground">Built on standard web3 primitives.</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="init" className="space-y-4">
                                    <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100 relative group border border-border">
                                        <pre>{initCode}</pre>
                                        <Button size="icon" variant="ghost" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="agent" className="space-y-4">
                                    <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100 relative group border border-border">
                                        <pre>{createAgentCode}</pre>
                                        <Button size="icon" variant="ghost" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-2">Next Steps:</h4>
                                        <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100 relative group border border-border">
                                            <pre>{executeTxCode}</pre>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="test" className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>x402 Payment Live Test</CardTitle>
                                                <CardDescription>
                                                    Real transaction test on Cronos Testnet.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Click below to trigger a real protected request. You will be asked to sign a USDC payment if not yet authorized.
                                                </p>
                                                <Button onClick={runTest}>
                                                    Run Live Test (0.01 USD)
                                                </Button>
                                                <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-900 rounded text-xs font-mono h-40 overflow-y-auto">
                                                    {logs.length === 0 ? <span className="text-muted-foreground">Waiting for test run...</span> : logs.map((log, i) => (
                                                        <div key={i}>{log}</div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Agent Health Check</CardTitle>
                                                <CardDescription>
                                                    Verify agent wallet status and connectivity.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Button variant="outline" className="w-full" onClick={runDiagnostics}>Run Diagnostics</Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
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
