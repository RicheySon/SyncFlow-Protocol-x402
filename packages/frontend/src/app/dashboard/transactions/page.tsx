'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Activity,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Download,
    RefreshCw,
    ExternalLink,
    Copy,
    Wallet,
    Check
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { ConfigurationStatus } from '../../../components/ConfigurationStatus';
import { ProtectedFeature } from '../../../components/ProtectedFeature';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Load transactions from API (Database)
    const loadTransactions = async () => {
        setLoading(true);
        try {
            const { transactionsApi } = await import('../../../lib/api/transactions');
            const data = await transactionsApi.getAll();

            // Normalize for UI
            const formatted = data.map((tx: any) => ({
                ...tx,
                date: tx.createdAt,
                agentId: tx.agentId || 'Unknown',
                txHash: tx.txHash,
                amount: tx.amount,
                type: tx.type,
                status: tx.status
            }));

            setTransactions(formatted);
        } catch (e) {
            console.error("Failed to load transactions from DB", e);
            // Fallback to empty or toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const handleSync = async () => {
        setLoading(true);
        try {
            const token = (await import('../../../lib/api')).TokenManager.getToken();
            await fetch('/api/transactions/sync', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await loadTransactions();
        } catch (e) {
            console.error('Sync failed', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadTransactions();
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(tx => {
        const matchesFilter = filter === 'all' || (tx.type && tx.type.toLowerCase().includes(filter.toLowerCase()));
        const matchesSearch = search === '' ||
            (tx.txHash && tx.txHash.toLowerCase().includes(search.toLowerCase())) ||
            (tx.agentId && tx.agentId.toLowerCase().includes(search.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Configuration Status */}
            <ConfigurationStatus />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">
                        Monitor autonomous settlement activity on Cronos EVM.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button variant="outline" onClick={handleSync} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sync Status
                    </Button>
                </div>
            </div>

            <ProtectedFeature feature="transactionHistoryEnabled">
                <Card className="border-border bg-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>History</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tx hash or agent..."
                                    className="pl-8 w-[300px] bg-background"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-[150px] bg-background">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="payment">Payments</SelectItem>
                                    <SelectItem value="swap">Swaps</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3">Transaction Hash</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Agent ID</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            {loading ? 'Loading history...' : 'No transactions found'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx, i) => (
                                        <tr key={i} className="border-b border-border hover:bg-muted/50">
                                            <td className="px-4 py-4 font-mono text-xs text-foreground/80">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`https://cronos.org/explorer/testnet3/tx/${tx.txHash}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="hover:text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        {tx.txHash ? `${tx.txHash.substring(0, 10)}...${tx.txHash.substring(tx.txHash.length - 8)}` : 'N/A'}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleCopy(tx.txHash, i.toString())}
                                                        className="hover:text-foreground transition-colors p-1"
                                                        title="Copy Transaction Hash"
                                                    >
                                                        {copiedId === i.toString() ? (
                                                            <Check className="h-3 w-3 text-primary" />
                                                        ) : (
                                                            <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`border-primary/20 ${tx.type.includes('Payment') ? 'bg-primary/10 text-primary' :
                                                    'bg-secondary/10 text-secondary'
                                                    }`}>
                                                    {tx.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground font-mono text-xs">
                                                {tx.agentId ? tx.agentId.substring(0, 8) : 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4 font-medium text-foreground">
                                                {tx.amount}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`flex items-center gap-2 text-xs ${tx.status === 'success' ? 'text-green-500' :
                                                        tx.status === 'failed' ? 'text-destructive' :
                                                            'text-primary animate-pulse'
                                                    }`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${tx.status === 'success' ? 'bg-green-500' :
                                                            tx.status === 'failed' ? 'bg-destructive' :
                                                                'bg-primary'
                                                        }`} />
                                                    {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Pending'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right text-muted-foreground">
                                                {new Date(tx.date).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                </Card>
            </ProtectedFeature>
        </div>
    );
}
