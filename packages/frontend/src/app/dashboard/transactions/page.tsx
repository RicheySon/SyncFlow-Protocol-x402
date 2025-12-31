'use client';

import { useState } from 'react';
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

// Mock Transactions Data
const transactions = [
    {
        id: 'tx_1',
        hash: '0x7f23...3a91',
        type: 'Rebalance',
        agent: 'Treasury Bot Alpha',
        amount: '4,500.00',
        token: 'USDC',
        status: 'success',
        time: '2 mins ago',
        fee: '0.002 CRO'
    },
    {
        id: 'tx_2',
        hash: '0x8a12...4b23',
        type: 'Open Position',
        agent: 'Hedge Manager X',
        amount: '1,200.00',
        token: 'CRO',
        status: 'pending',
        time: '5 mins ago',
        fee: '0.005 CRO'
    },
    {
        id: 'tx_3',
        hash: '0x9c34...5c12',
        type: 'Swap',
        agent: 'Arb Bot Delta',
        amount: '342.50',
        token: 'USDC',
        status: 'failed',
        time: '1 hour ago',
        fee: '0.003 CRO'
    },
    {
        id: 'tx_4',
        hash: '0x1d45...6d45',
        type: 'Payment',
        agent: 'Treasury Bot Alpha',
        amount: '12,000.00',
        token: 'USDC',
        status: 'success',
        time: '2 hours ago',
        fee: '0.001 CRO'
    },
    {
        id: 'tx_5',
        hash: '0x5e26...7e89',
        type: 'Deposit',
        agent: 'Yield Farmer Beta',
        amount: '5,000.00',
        token: 'CRO',
        status: 'success',
        time: '4 hours ago',
        fee: '0.004 CRO'
    }
];

export default function TransactionsPage() {
    const [filter, setFilter] = useState('all');

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
                    <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
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
                            <Select defaultValue="all">
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction Hash</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Gas Fee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-mono text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary hover:underline cursor-pointer">
                                                {tx.hash}
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
                                    <TableCell>{tx.agent}</TableCell>
                                    <TableCell>
                                        <span className="font-medium">{tx.amount}</span>
                                        <span className="text-xs text-muted-foreground ml-1">{tx.token}</span>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{tx.fee}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            tx.status === 'success' ? 'success' :
                                                tx.status === 'pending' ? 'warning' :
                                                    'destructive'
                                        } className="capitalize">
                                            {tx.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {tx.time}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
