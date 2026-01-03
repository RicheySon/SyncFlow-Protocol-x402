'use client';

import { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Download,
    ExternalLink,
    RefreshCw,
    Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { transactionsApi, type Transaction } from '@/lib/api/transactions';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionsApi.getAll(
                filter !== 'all' ? { type: filter } : undefined
            );
            setTransactions(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
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
                    <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>History</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-[250px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search tx hash or agent..." className="pl-9" />
                            </div>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filter type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="payment">Payments</SelectItem>
                                    <SelectItem value="swap">Swaps</SelectItem>
                                    <SelectItem value="rebalance">Rebalance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && transactions.length === 0 ? (
                        <div className="flex justify-center py-8 text-muted-foreground">Loading transactions...</div>
                    ) : error ? (
                        <div className="flex justify-center py-8 text-destructive">{error}</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction Hash</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-mono text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary hover:underline cursor-pointer">
                                                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "p-1 rounded-full",
                                                        tx.type === 'Deposit' ? "bg-green-500/10 text-green-500" :
                                                            tx.type === 'Payment' ? "bg-blue-500/10 text-blue-500" :
                                                                "bg-orange-500/10 text-orange-500"
                                                    )}>
                                                        {tx.type === 'Deposit' ? <ArrowDownLeft className="h-3 w-3" /> :
                                                            tx.type === 'Payment' ? <ArrowUpRight className="h-3 w-3" /> :
                                                                <RefreshCw className="h-3 w-3" />}
                                                    </div>
                                                    {tx.type}
                                                </div>
                                            </TableCell>
                                            <TableCell>{tx.agent?.name || 'Unknown Agent'}</TableCell>
                                            <TableCell>
                                                <span className="font-medium">{tx.amount}</span>
                                                <span className="text-xs text-muted-foreground ml-1">{tx.token}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    tx.status === 'success' ? 'default' :
                                                        tx.status === 'pending' ? 'secondary' :
                                                            'destructive'
                                                } className="capitalize">
                                                    {tx.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-sm">
                                                {new Date(tx.createdAt).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
