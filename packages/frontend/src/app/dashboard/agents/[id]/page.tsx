'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Wallet,
    Settings,
    Activity,
    Database,
    Pause,
    Save,
    RefreshCw,
    Copy,
    Users,
    UserPlus,
    CreditCard,
    ShieldCheck,
    Lock,
    Zap,
    CheckCircle2,
    Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { agentsApi, type Agent } from '@/lib/api/agents';

// Mock transactions and other data not yet in API can remain as placeholders or empty for now
const mockTransactions: any[] = [];
const mockMcpServers: any[] = [];

// BatchPaymentModal component remains the same
// BatchPaymentModal component
function BatchPaymentModal({ subUsers, onTransactionSuccess }: {
    subUsers: any[],
    onTransactionSuccess?: (txHash: string, amount: number, recipientsCount: number) => void
}) {
    const [step, setStep] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [txHashes, setTxHashes] = useState<string[]>([]);
    const [recipientStatuses, setRecipientStatuses] = useState<{ [key: string]: 'pending' | 'success' | 'error' }>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState(0);

    const steps = [
        { title: 'Connect Wallet', icon: Wallet, desc: 'Connect your wallet to proceed...' },
        { title: 'Validate Balance', icon: Activity, desc: 'Checking sufficient TCRO balance...' },
        { title: 'Execute Payments', icon: Zap, desc: 'Sending TCRO to recipients...' },
        { title: 'Confirm Transactions', icon: ShieldCheck, desc: 'Waiting for blockchain confirmations...' },
        { title: 'Complete', icon: CheckCircle2, desc: 'All payments processed successfully!' }
    ];

    // Calculate total amount when modal opens
    const calculateTotal = () => {
        const total = subUsers.reduce((sum, user) => {
            const amount = parseFloat(user.amount || '0');
            return sum + (user.currency === 'TCRO' ? amount : 0);
        }, 0);
        setTotalAmount(total);
    };

    const handleConnectWallet = async () => {
        setProcessing(true);
        setErrorMessage(null);
        try {
            console.log('Attempting wallet connection...');
            const { connectWallet } = await import('@/lib/wallet');

            if (!window.ethereum) {
                throw new Error('MetaMask is not installed. Please install it to continue.');
            }

            const state = await connectWallet();
            console.log('Wallet connected:', state);

            setWalletConnected(state.isConnected);
            setWalletAddress(state.address);

            // Move to next step if successful
            setStep(1);
            await validateBalance();

        } catch (error: any) {
            console.error('Connection failed:', error);
            setErrorMessage(error.message || 'Failed to connect wallet');
            setProcessing(false);
        }
    };

    const validateBalance = async () => {
        try {
            console.log('Starting balance validation...');
            const { CONTRACTS } = await import('@/lib/config');
            const { getTCROBalance } = await import('@/lib/wallet');

            // Add timeout protection
            const balancePromise = getTCROBalance(CONTRACTS.agentWallet);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Balance check timed out after 10s')), 10000)
            );

            // Race balance fetching against timeout
            const contractBalance = await Promise.race([balancePromise, timeoutPromise]) as string;
            const balanceNum = parseFloat(contractBalance);

            console.log('Contract balance check:', {
                contract: CONTRACTS.agentWallet,
                balance: balanceNum,
                required: totalAmount
            });

            if (balanceNum < totalAmount) {
                throw new Error(`Insufficient contract balance. Need ${totalAmount.toFixed(2)} TCRO, have ${balanceNum.toFixed(2)} TCRO`);
            }

            // Move to execution step
            setStep(2);

            // Small delay before executing
            setTimeout(() => {
                executeBatchPayments();
            }, 500);

        } catch (error: any) {
            console.error('Balance validation error:', error);
            setErrorMessage(error.message || 'Failed to validate balance');
            setProcessing(false);
            // setStep(0); // Reset to start
        }
    };

    const executeBatchPayments = async () => {
        try {
            console.log('Starting batch payment execution...');
            const { ethers } = await import('ethers');
            const { CONTRACTS } = await import('@/lib/config');
            const { switchToCronosTestnet } = await import('@/lib/wallet');

            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }

            // Ensure we are on the correct network
            await switchToCronosTestnet();

            // Create a Network object for Cronos Testnet and explicitly disable ENS
            // This prevents "network does not support ENS" errors
            const network = new ethers.Network("Cronos Testnet", 338);
            const provider = new ethers.BrowserProvider(window.ethereum, network, {
                staticNetwork: network
            });

            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();
            console.log('Signer:', signerAddress);

            // Validate and format recipients to ensure they are check-summed addresses
            const tcroRecipients = subUsers.filter(user => user.currency === 'TCRO');

            if (tcroRecipients.length === 0) {
                throw new Error('No TCRO recipients found');
            }

            const recipients = [];
            const amounts = [];

            for (const u of tcroRecipients) {
                if (!ethers.isAddress(u.address)) {
                    throw new Error(`Invalid address: ${u.address}`);
                }
                recipients.push(u.address);
                amounts.push(ethers.parseEther(u.amount.toString()));
            }

            // Log for debugging
            console.log('Contract:', CONTRACTS.agentWallet);
            console.log('Recipients:', recipients);
            console.log('Amounts:', amounts.map(a => ethers.formatEther(a)));

            // Contract ABI for batchTransfer
            const contractABI = [
                "function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external",
                "function owner() view returns (address)"
            ];

            const contract = new ethers.Contract(CONTRACTS.agentWallet, contractABI, signer);

            // Verify ownership before sending
            try {
                const owner = await contract.owner();
                if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
                    throw new Error(`Caller is not owner. Owner: ${owner}`);
                }
            } catch (err) {
                console.warn('Could not verify owner, proceeding...', err);
            }

            // Set all as pending
            tcroRecipients.forEach(user => {
                setRecipientStatuses(prev => ({ ...prev, [user.id]: 'pending' }));
            });

            // Estimate gas first
            try {
                await contract.batchTransfer.estimateGas(recipients, amounts);
            } catch (err: any) {
                console.error('Gas estimation failed:', err);
                if (err.message && err.message.includes("Insufficient contract balance")) {
                    throw new Error("Insufficient contract balance (gas estimation failed)");
                }
            }

            // Execute single contract transaction
            console.log('Sending transaction...');
            const tx = await contract.batchTransfer(recipients, amounts);
            console.log('Transaction submitted:', tx.hash);

            setTxHashes([tx.hash]);

            // Wait for confirmation
            console.log('Waiting for confirmation...');
            await tx.wait();
            console.log('Transaction confirmed!');

            // Set all as success
            tcroRecipients.forEach(user => {
                setRecipientStatuses(prev => ({ ...prev, [user.id]: 'success' }));
            });

            // NEW: Record transaction
            if (onTransactionSuccess) {
                const totalEth = amounts.reduce((acc, val) => acc + BigInt(val), 0n);
                onTransactionSuccess(tx.hash, parseFloat(ethers.formatEther(totalEth)), recipients.length);
            }

            setStep(3);

            // Move to complete after brief delay
            setTimeout(() => {
                setStep(4);
                setProcessing(false);
            }, 1500);

        } catch (error: any) {
            console.error('Batch payment error:', error);
            // Parse error message for common issues
            let msg = error.message || 'Batch transfer failed';
            if (msg.includes("user rejected")) msg = "Transaction rejected by user";
            if (msg.includes("Insufficient contract balance")) msg = "Contract has insufficient TCRO";

            setErrorMessage(msg);
            setProcessing(false);
        }
    };

    const runBatchPayment = async () => {
        setProcessing(true);
        setErrorMessage(null);
        setTxHashes([]);
        setRecipientStatuses({});
        calculateTotal();

        // If not connected, stop and let user click 'Connect'
        if (!walletConnected) {
            setStep(0);
            await handleConnectWallet();
        } else {
            setStep(1);
            await validateBalance();
        }
    };

    const handleClose = () => {
        setStep(0);
        setProcessing(false);
        setErrorMessage(null);
        setTxHashes([]);
        setRecipientStatuses({});
    };

    const isCompleted = step === steps.length - 1 && !processing;
    const tcroRecipients = subUsers.filter(user => user.currency === 'TCRO');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
                    <Zap className="mr-2 h-4 w-4" /> Launch Batch Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Batch Payment Execution</DialogTitle>
                    <DialogDescription>
                        Execute TCRO payments to {tcroRecipients.length} recipient{tcroRecipients.length !== 1 ? 's' : ''}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {/* Status Steps */}
                    <div className="flex justify-between items-start relative px-2">
                        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-10" />

                        {steps.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-20">
                                <div className={`
                                    h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-500
                                    ${i <= step ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}
                                    ${i === step && processing ? 'animate-pulse ring-2 ring-emerald-500/50' : ''}
                                `}>
                                    <s.icon className="h-4 w-4" />
                                </div>
                                <span className={`text-[10px] text-center font-medium ${i <= step ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Current Step Detail */}
                    <div className="mt-8 min-h-[100px]">
                        {processing || step > 0 ? (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg text-white mb-1">
                                        {steps[step]?.title || 'Complete'}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {steps[step]?.desc || 'All payments completed!'}
                                    </p>
                                </div>

                                {/* Show recipient statuses during execution */}
                                {step >= 2 && tcroRecipients.length > 0 && (
                                    <div className="bg-slate-900/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                        {tcroRecipients.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between py-1 text-xs">
                                                <span className="text-slate-400 truncate flex-1">
                                                    {user.address.slice(0, 10)}...{user.address.slice(-8)}
                                                </span>
                                                <span className="text-slate-300 mx-2">{user.amount} TCRO</span>
                                                {recipientStatuses[user.id] === 'success' && (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                )}
                                                {recipientStatuses[user.id] === 'pending' && (
                                                    <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                                                )}
                                                {recipientStatuses[user.id] === 'error' && (
                                                    <span className="text-red-400">✗</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Show transaction hashes when complete */}
                                {isCompleted && txHashes.length > 0 && (
                                    <div className="bg-emerald-950 border border-emerald-800 rounded-lg p-3">
                                        <p className="text-xs text-emerald-300 mb-2">
                                            {txHashes.length} transaction{txHashes.length !== 1 ? 's' : ''} confirmed
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {txHashes.map((hash, idx) => (
                                                <a
                                                    key={idx}
                                                    href={`https://cronos.org/explorer/testnet3/tx/${hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                                >
                                                    Tx #{idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center space-y-3">
                                <p className="text-slate-400 text-sm">
                                    Ready to distribute {totalAmount.toFixed(2)} TCRO to {tcroRecipients.length} recipient{tcroRecipients.length !== 1 ? 's' : ''}.
                                </p>
                                {tcroRecipients.length === 0 && (
                                    <p className="text-amber-400 text-xs">
                                        No TCRO recipients found. Add recipients with TCRO currency.
                                    </p>
                                )}
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mt-4 bg-red-950 border border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-300">{errorMessage}</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    {step === 0 && (
                        <Button
                            onClick={handleConnectWallet}
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                            {processing ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                    )}

                    {step === 1 && (
                        <Button disabled className="bg-slate-700 w-full sm:w-auto">
                            <Activity className="mr-2 h-4 w-4 animate-spin" /> Validating Balance...
                        </Button>
                    )}

                    {step === 2 && (
                        <Button
                            onClick={executeBatchPayments}
                            disabled={processing}
                            className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            {processing ? 'Processing...' : 'Confirm Execution'}
                        </Button>
                    )}

                    {step === 3 && (
                        <Button disabled className="bg-emerald-600/50 w-full sm:w-auto">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Confirming...
                        </Button>
                    )}

                    {step === 4 && (
                        <Button
                            onClick={handleClose}
                            className="bg-slate-700 hover:bg-slate-600 w-full sm:w-auto"
                        >
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function AddUserModal({ onAddUser }: { onAddUser: (user: any) => void }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        currency: 'USDC',
        amount: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddUser({
            id: Date.now().toString(),
            ...formData
        });
        setFormData({ name: '', address: '', currency: 'USDC', amount: '' });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Recipient</DialogTitle>
                    <DialogDescription>
                        Add a new user to the distribution list.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Alice (Dev)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Wallet Address</Label>
                            <Input
                                id="address"
                                placeholder="0x..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                            >
                                <SelectTrigger id="currency">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TCRO">TCRO</SelectItem>
                                    <SelectItem value="USDC">USDC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 100.50"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Recipient</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditUserModal({ user, onEditUser, onDeleteUser }: { user: any; onEditUser: (userId: string, updatedUser: any) => void; onDeleteUser: (userId: string) => void }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        address: user.address,
        currency: user.currency || 'USDC',
        amount: user.amount || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onEditUser(user.id, formData);
        setOpen(false);
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to remove ${user.name} from the distribution list?`)) {
            onDeleteUser(user.id);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Recipient</DialogTitle>
                    <DialogDescription>
                        Update recipient information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="e.g. Alice (Dev)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-address">Wallet Address</Label>
                            <Input
                                id="edit-address"
                                placeholder="0x..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-currency">Currency</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                            >
                                <SelectTrigger id="edit-currency">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TCRO">TCRO</SelectItem>
                                    <SelectItem value="USDC">USDC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">Amount</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 100.50"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between items-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DepositModal() {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        currency: 'TCRO',
        amount: ''
    });
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Import wallet utilities at top of file if not already imported
    const connectWallet = async () => {
        try {
            // Dynamic import to avoid SSR issues
            const { connectWallet: connect } = await import('@/lib/wallet');
            const state = await connect();
            setWalletConnected(state.isConnected);
            setWalletAddress(state.address);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to connect wallet');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!walletConnected) {
            setErrorMessage('Please connect your wallet first');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setErrorMessage('Please enter a valid amount');
            return;
        }

        setTxStatus('pending');
        setErrorMessage(null);

        try {
            // Get the agent's contract address from config
            const { CONTRACTS } = await import('@/lib/config');
            const { sendTCRODeposit } = await import('@/lib/wallet');

            const tx = await sendTCRODeposit(CONTRACTS.agentWallet, formData.amount);
            setTxHash(tx.hash);

            // Wait for transaction confirmation
            await tx.wait();
            setTxStatus('success');

            // Reset form after successful deposit
            setTimeout(() => {
                setFormData({ currency: 'TCRO', amount: '' });
                setTxStatus('idle');
                setTxHash(null);
                setOpen(false);
            }, 3000);
        } catch (error: any) {
            console.error('Deposit error:', error);
            setTxStatus('error');
            setErrorMessage(error.message || 'Transaction failed');
        }
    };

    const getExplorerLink = () => {
        if (!txHash) return '#';
        return `https://cronos.org/explorer/testnet3/tx/${txHash}`;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    Deposit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>
                        Add TCRO to this agent's wallet on Cronos Testnet.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {!walletConnected ? (
                            <div className="flex flex-col gap-3">
                                <p className="text-sm text-slate-400">
                                    Connect your wallet to deposit funds
                                </p>
                                <Button type="button" onClick={connectWallet} className="w-full">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Connect Wallet
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                                    <p className="text-xs text-slate-400 mb-1">Connected Wallet</p>
                                    <p className="text-sm font-mono text-emerald-400">
                                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="deposit-currency">Currency</Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                        disabled={txStatus === 'pending'}
                                    >
                                        <SelectTrigger id="deposit-currency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TCRO">TCRO (Testnet)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="deposit-amount">Amount</Label>
                                    <Input
                                        id="deposit-amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 10.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        disabled={txStatus === 'pending'}
                                        required
                                    />
                                </div>

                                {txStatus === 'pending' && (
                                    <div className="rounded-lg bg-blue-950 border border-blue-800 p-3">
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                                            <p className="text-sm text-blue-300">
                                                Transaction pending...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {txStatus === 'success' && txHash && (
                                    <div className="rounded-lg bg-emerald-950 border border-emerald-800 p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <p className="text-sm text-emerald-300">
                                                Deposit successful!
                                            </p>
                                        </div>
                                        <a
                                            href={getExplorerLink()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                                        >
                                            View on Explorer →
                                        </a>
                                    </div>
                                )}

                                {txStatus === 'error' && (
                                    <div className="rounded-lg bg-red-950 border border-red-800 p-3">
                                        <p className="text-sm text-red-300">
                                            {errorMessage || 'Transaction failed'}
                                        </p>
                                    </div>
                                )}

                                {errorMessage && txStatus === 'idle' && (
                                    <div className="rounded-lg bg-red-950 border border-red-800 p-3">
                                        <p className="text-sm text-red-300">{errorMessage}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {walletConnected && (
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={txStatus === 'pending' || txStatus === 'success'}
                                className={txStatus === 'success' ? 'bg-emerald-600' : ''}
                            >
                                {txStatus === 'pending' ? 'Processing...' :
                                    txStatus === 'success' ? 'Deposit Complete' :
                                        'Send Deposit'}
                            </Button>
                        </DialogFooter>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}

function KeysModal({ agent }: { agent: Agent | null }) {
    const [open, setOpen] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const mockPrivateKey = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    <Key className="mr-2 h-3 w-3" /> Keys
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agent Keys</DialogTitle>
                    <DialogDescription>
                        Manage your agent's cryptographic keys.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Public Address</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(agent?.walletAddress || '')}
                            >
                                <Copy className="h-3 w-3 mr-1" /> Copy
                            </Button>
                        </div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
                            <p className="font-mono text-xs text-slate-300 break-all">
                                {agent?.walletAddress || 'Not Deployed'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Private Key</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                                >
                                    {showPrivateKey ? 'Hide' : 'Show'}
                                </Button>
                                {showPrivateKey && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(mockPrivateKey)}
                                    >
                                        <Copy className="h-3 w-3 mr-1" /> Copy
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
                            <p className="font-mono text-xs text-slate-300 break-all">
                                {showPrivateKey ? mockPrivateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500 text-xs">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Never share your private key with anyone!</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [subUsers, setSubUsers] = useState<any[]>([]); // Initialize empty
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tcroBalance, setTcroBalance] = useState<string>('0.00');
    const [balanceLoading, setBalanceLoading] = useState(false);

    // Fetch agent balance
    const fetchBalance = async () => {
        if (!agent) return;

        try {
            setBalanceLoading(true);
            const { CONTRACTS } = await import('@/lib/config');
            const { getTCROBalance } = await import('@/lib/wallet');
            const balance = await getTCROBalance(CONTRACTS.agentWallet);
            setTcroBalance(parseFloat(balance).toFixed(2));
        } catch (error) {
            console.error('Error fetching balance:', error);
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                setLoading(true);
                const data = await agentsApi.getById(params.id);
                setAgent(data);
                // Future: fetch subUsers here if API supports it
            } catch (err: any) {
                setError(err.message || 'Failed to load agent');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchAgent();
        }
    }, [params.id]);

    // Fetch balance when agent is loaded
    useEffect(() => {
        if (agent) {
            fetchBalance();
        }
    }, [agent]);

    // NEW: Load sub-users from localStorage on mount
    useEffect(() => {
        const storedUsers = localStorage.getItem(`syncflow_subusers_${params.id}`);
        if (storedUsers) {
            try {
                setSubUsers(JSON.parse(storedUsers));
            } catch (e) {
                console.error('Failed to parse stored users', e);
            }
        }
    }, [params.id]);

    // NEW: Save sub-users to localStorage whenever they change
    useEffect(() => {
        if (subUsers.length > 0) { // Only save if we have users (or overwrite if empty if that's desired behavior)
            localStorage.setItem(`syncflow_subusers_${params.id}`, JSON.stringify(subUsers));
        } else {
            // Optional: Clear if empty, or keep empty array
            // localStorage.removeItem(`syncflow_subusers_${params.id}`);
        }
    }, [subUsers, params.id]);

    const handleAddUser = (userData: any) => {
        const newUser = {
            id: crypto.randomUUID(),
            ...userData,
            status: 'active'
        };
        const updatedUsers = [...subUsers, newUser];
        setSubUsers(updatedUsers);
        // Direct save to ensure immediate persistence
        localStorage.setItem(`syncflow_subusers_${params.id}`, JSON.stringify(updatedUsers));
    };

    const handleEditUser = (userId: string, updates: any) => {
        const updatedUsers = subUsers.map(user =>
            user.id === userId ? { ...user, ...updates } : user
        );
        setSubUsers(updatedUsers);
        localStorage.setItem(`syncflow_subusers_${params.id}`, JSON.stringify(updatedUsers));
    };

    const handleDeleteUser = (userId: string) => {
        const updatedUsers = subUsers.filter(user => user.id !== userId);
        setSubUsers(updatedUsers);
        localStorage.setItem(`syncflow_subusers_${params.id}`, JSON.stringify(updatedUsers));
    };

    // Transaction state
    const [transactions, setTransactions] = useState<any[]>([]);

    // NEW: Load transactions from localStorage
    useEffect(() => {
        const storedTxs = localStorage.getItem(`syncflow_transactions_${params.id}`);
        if (storedTxs) {
            try {
                setTransactions(JSON.parse(storedTxs));
            } catch (e) {
                console.error('Failed to parse stored transactions', e);
            }
        }
    }, [params.id]);

    // NEW: Function to add transaction
    const addTransaction = (txHash: string, amount: number, recipientsCount: number) => {
        const newTx = {
            id: txHash,
            type: 'Batch Payment',
            status: 'Success',
            amount: `${amount.toFixed(2)} TCRO`,
            date: new Date().toISOString(), // Store actual date
            recipients: recipientsCount
        };
        const updatedTxs = [newTx, ...transactions];
        setTransactions(updatedTxs);
        localStorage.setItem(`syncflow_transactions_${params.id}`, JSON.stringify(updatedTxs));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading agent details...</p>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-destructive">{error || 'Agent not found'}</p>
                <Button asChild>
                    <Link href="/dashboard/agents">Back to Agents</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/agents">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {agent.name}
                        <Badge variant="default" className="ml-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                            {agent.status}
                        </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{agent.id}</span>
                        <span className="text-slate-600">•</span>
                        <Badge variant="outline" className="text-xs bg-slate-900 border-slate-800 capitalize">{agent.type}</Badge>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" /> Pause
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column (Main Config) */}
                <div className="md:col-span-8 space-y-6">

                    {/* Sub Users / Recipients */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-400" />
                                    <CardTitle>Sub Users & Recipients</CardTitle>
                                </div>
                                <AddUserModal onAddUser={handleAddUser} />
                            </div>
                            <CardDescription>Manage recipients for this entity's distributions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Allocation</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                    No recipients added yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            subUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {user.address.substring(0, 6)}...{user.address.substring(user.address.length - 4)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.amount} {user.currency}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <EditUserModal user={user} onEditUser={handleEditUser} />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <div className="h-4 w-4">×</div>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logic Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-400" />
                                <CardTitle>Entity Logic</CardTitle>
                            </div>
                            <CardDescription>Define the conditional logic for this entity.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Save className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Textarea
                                    className="font-mono text-sm min-h-[200px] bg-slate-950 border-slate-800 resize-y"
                                    defaultValue={`// Weekly Payroll Logic
IF (date.day === 'FRIDAY') {
  EXECUTE batchPayment(subUsers, {
    currency: 'eUSDC',
    total_amount: 5000
  });
}`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column (Wallet Info & Actions) */}
                <div className="md:col-span-4 space-y-6">
                    <WalletInfo
                        balance={tcroBalance}
                        address={agent.address}
                        subUsers={subUsers}
                        onTransactionSuccess={addTransaction}
                    />

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {transactions.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No recent activity.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type.includes('Payment') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{tx.type}</p>
                                                    <p className="text-xs text-muted-foreground">{tx.time}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">{tx.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card >
                </div >
            </div >
        </div >
    );
}

function WalletInfo({ balance, address, subUsers, onTransactionSuccess }: {
    balance: string,
    address: string,
    subUsers: any[],
    onTransactionSuccess: (txHash: string, amount: number, recipientsCount: number) => void
}) {
    const [tcroBalance, setTcroBalance] = useState('0.00');
    const [usdcBalance, setUsdcBalance] = useState('0.00');

    useEffect(() => {
        let mounted = true;
        const fetchBalances = async () => {
            try {
                const { CONTRACTS } = await import('@/lib/config');
                const { getTCROBalance } = await import('@/lib/wallet');
                const bal = await getTCROBalance(CONTRACTS.agentWallet);
                if (mounted) {
                    setTcroBalance(parseFloat(bal).toFixed(2));
                }
            } catch (e) {
                console.error("Failed to fetch balance", e);
            }
        };

        fetchBalances();
        // Poll every 30s
        const interval = setInterval(fetchBalances, 30000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <Card className="bg-slate-950 border-slate-800">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-400" />
                        <CardTitle>Wallet Info</CardTitle>
                    </div>
                    <RefreshCw className="h-3 w-3 text-slate-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-slate-400">Total Balance</p>
                        <h2 className="text-3xl font-bold mt-1">$0.00</h2>
                        <div className="flex items-center gap-1 mt-1 text-xs text-emerald-500">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Protected by x402</span>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Smart Address</span>
                            <Copy className="h-3 w-3 text-slate-500 cursor-pointer" />
                        </div>
                        <p className="font-mono text-xs text-slate-300 break-all">
                            {address}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">TCRO Balance</span>
                            <span className="font-mono">{tcroBalance}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">USDC Balance</span>
                            <span className="font-mono">{usdcBalance}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                            <BatchPaymentModal subUsers={subUsers} onTransactionSuccess={onTransactionSuccess} />
                        </div>
                        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
                            Deposit
                        </Button>
                        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
                            <Key className="mr-2 h-3 w-3" /> Keys
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
