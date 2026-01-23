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
    Key,
    LogOut
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Progress } from '../../../../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { agentsApi, recipientsApi, type Agent, type Recipient } from '../../../../lib/api/agents';
import { apiClient } from '../../../../lib/api';

// Mock transactions and other data not yet in API can remain as placeholders or empty for now
const mockTransactions: any[] = [];
const mockMcpServers: any[] = [];

// BatchPaymentModal component remains the same
// BatchPaymentModal component
function BatchPaymentModal({ agentAddress, subUsers, onTransactionSuccess }: {
    agentAddress: string,
    subUsers: Recipient[],
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
        { title: 'x402 Handshake', icon: ShieldCheck, desc: 'Requesting settlement quote...' }, // New Step
        { title: 'Validate Balance', icon: Activity, desc: 'Checking sufficient TCRO balance...' },
        { title: 'Execute Payments', icon: Zap, desc: 'Sending TCRO via X402 Protocol...' },
        { title: 'Confirm Transactions', icon: CheckCircle2, desc: 'Waiting for blockchain confirmations...' },
        { title: 'Complete', icon: CheckCircle2, desc: 'All payments processed successfully!' }
    ];

    const calculateTotal = () => {
        const total = subUsers.reduce((sum, user) => {
            const amount = parseFloat(user.amount || '0');
            return sum + (user.currency === 'TCRO' ? amount : 0);
        }, 0);
        setTotalAmount(total);
    };

    // Update total when subUsers change
    useEffect(() => {
        calculateTotal();
    }, [subUsers]);

    const handleConnectWallet = async () => {
        setProcessing(true);
        setErrorMessage(null);
        try {
            console.log('Attempting wallet connection...');
            const { connectWallet } = await import('../../../../lib/wallet');

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

    const [quote, setQuote] = useState<{ id: string; fee: number; validUntil: string } | null>(null);

    const requestX402Quote = async () => {
        try {
            console.log('Initiating X402 Handshake...');
            // Simulate API call to backend X402Handler
            await new Promise(r => setTimeout(r, 1500));

            setQuote({
                id: `q_${Math.random().toString(36).substr(2, 9)}`,
                fee: 0.001, // Mock protocol fee
                validUntil: new Date(Date.now() + 15 * 60000).toLocaleTimeString()
            });

            setStep(2); // Move to Validate Balance
            validateBalance();
        } catch (error) {
            setErrorMessage('Failed to obtain X402 quote');
            setProcessing(false);
        }
    };

    const validateBalance = async () => {
        try {
            console.log('Starting balance validation...');
            const { CONTRACTS } = await import('../../../../lib/config');
            const { getTCROBalance } = await import('../../../../lib/wallet');

            // Add timeout protection
            const balancePromise = getTCROBalance(agentAddress);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Balance check timed out after 10s')), 10000)
            );

            // Race balance fetching against timeout
            const contractBalance = await Promise.race([balancePromise, timeoutPromise]) as string;
            const balanceNum = parseFloat(contractBalance);

            console.log('Contract balance check:', {
                contract: agentAddress,
                balance: balanceNum,
                required: totalAmount
            });

            if (balanceNum < totalAmount) {
                throw new Error(`Insufficient contract balance. Need ${totalAmount.toFixed(2)} TCRO, have ${balanceNum.toFixed(2)} TCRO`);
            }

            // Move to execution step
            setStep(3);
            setProcessing(false); // Enable UI for user confirmation
        } catch (error: any) {
            console.error('Balance validation error:', error);
            setErrorMessage(error.message || 'Failed to validate balance');
            setProcessing(false);
        }
    };

    const [executionStatus, setExecutionStatus] = useState<string>('');

    const executeBatchPayments = async () => {
        try {
            setProcessing(true); // Start processing
            setExecutionStatus('Initializing provider...');
            console.log('Starting batch payment execution...');
            const { ethers } = await import('ethers');
            const { CONTRACTS } = await import('../../../../lib/config');
            const { switchToCronosTestnet } = await import('../../../../lib/wallet');

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
            setExecutionStatus(`Signer: ${signerAddress.slice(0, 6)}...`);

            // Validate and format recipients to ensure they are check-summed addresses
            const tcroRecipients = subUsers.filter(user => user.currency === 'TCRO');

            if (tcroRecipients.length === 0) {
                throw new Error('No TCRO recipients found');
            }

            const recipients = [];
            const amounts = [];

            setExecutionStatus('Preparing transaction data...');
            for (const u of tcroRecipients) {
                if (!ethers.isAddress(u.address)) {
                    throw new Error(`Invalid address: ${u.address}`);
                }
                recipients.push(u.address);
                amounts.push(ethers.parseEther(u.amount.toString()));
            }

            // Log for debugging
            console.log('Contract:', agentAddress);
            console.log('Recipients:', recipients);
            console.log('Amounts:', amounts.map(a => ethers.formatEther(a)));

            // Contract ABI for batchTransfer
            const contractABI = [
                "function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external",
                "function owner() view returns (address)"
            ];

            const contract = new ethers.Contract(agentAddress, contractABI, signer);

            // Verify ownership before sending
            setExecutionStatus('Verifying contract ownership...');
            try {
                const owner = await contract.owner();
                if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
                    throw new Error(`Caller (${signerAddress.slice(0, 6)}...) is not the owner (${owner.slice(0, 6)}...). Transaction will revert.`);
                }
            } catch (err: any) {
                console.error('Ownership validation failed:', err);
                throw err; // Stop execution if ownership check fails
            }

            // Set all as pending
            tcroRecipients.forEach(user => {
                setRecipientStatuses(prev => ({ ...prev, [user.id]: 'pending' }));
            });

            // Estimate gas first
            setExecutionStatus('Estimating gas...');
            try {
                await contract.batchTransfer.estimateGas(recipients, amounts);
            } catch (err: any) {
                console.error('Gas estimation failed:', err);
                let msg = "Gas estimation failed - transaction implies revert.";
                if (err.message && err.message.includes("Insufficient contract balance")) {
                    msg = "Insufficient contract balance for transfer.";
                } else if (err.message && err.message.includes("Caller is not owner")) {
                    msg = "Caller is not contract owner.";
                }
                throw new Error(msg);
            }

            // Execute single contract transaction
            console.log('Sending transaction...');
            setErrorMessage(null); // Clear previous errors

            // Temporary UI feedback for signing
            const originalText = document.getElementById('exec-btn-text')?.innerText;
            // We can't easily change button text from here without state, but we rely on error handling.

            const tx = await contract.batchTransfer(recipients, amounts);
            console.log('Transaction submitted:', tx.hash);

            setTxHashes([tx.hash]);
            setStep(4); // Move to Confirm Transactions (index 4) immediately

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

            setStep(4); // Move to Confirm Transactions (index 4)

            // Move to complete after brief delay
            setTimeout(() => {
                setStep(5); // Move to Complete (index 5)
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
            // Start X402 Handshake
            setStep(1);
            await requestX402Quote();
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
                        Execute TCRO payments to {tcroRecipients.length} recipient{tcroRecipients.length !== 1 ? 's' : ''} from agent {agentAddress.slice(0, 6)}...
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
                                {quote ? (
                                    <div className="bg-indigo-950/50 border border-indigo-900 rounded-lg p-3 text-left space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-indigo-300">Protocol Quote ID</span>
                                            <span className="font-mono text-white">{quote.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-indigo-300">Network Fee Est.</span>
                                            <span className="font-mono text-white">~0.02 TCRO</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-indigo-300">X402 Protocol Fee</span>
                                            <span className="font-mono text-emerald-400">{quote.fee} TCRO</span>
                                        </div>
                                        <div className="border-t border-indigo-900 my-2 pt-2 flex justify-between items-center font-bold">
                                            <span className="text-indigo-200">Total Required</span>
                                            <span className="text-white">{(totalAmount + quote.fee).toFixed(3)} TCRO</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">
                                        Ready to distribute {totalAmount.toFixed(2)} TCRO to {tcroRecipients.length} recipient{tcroRecipients.length !== 1 ? 's' : ''}.
                                    </p>
                                )}

                                <p className="text-xs text-slate-500">
                                    Proceeding will execute a batch transaction via X402 Settlement Protocol on Cronos Testnet.
                                </p>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mt-4 bg-red-950 border border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-300">{errorMessage}</p>
                            </div>
                        )}

                        {processing && executionStatus && (
                            <div className="mt-4 bg-slate-900 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 animate-spin text-emerald-400" />
                                    <p className="text-sm text-emerald-300">{executionStatus}</p>
                                </div>
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
                        <Button disabled className="bg-indigo-600 w-full sm:w-auto">
                            <ShieldCheck className="mr-2 h-4 w-4 animate-pulse" /> Requesting X402 Quote...
                        </Button>
                    )}

                    {step === 2 && (
                        <Button disabled className="bg-slate-700 w-full sm:w-auto">
                            <Activity className="mr-2 h-4 w-4 animate-spin" /> Validating Balance...
                        </Button>
                    )}

                    {step === 3 && (
                        <Button
                            onClick={executeBatchPayments}
                            disabled={processing}
                            className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            {processing ? 'Processing...' : 'Confirm Execution'}
                        </Button>
                    )}

                    {step === 4 && (
                        <Button disabled className="bg-emerald-600/50 w-full sm:w-auto">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Confirming...
                        </Button>
                    )}

                    {step === 5 && (
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
                                    <SelectItem value="devUSDC.e">devUSDC.e</SelectItem>
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
                                    <SelectItem value="devUSDC.e">devUSDC.e</SelectItem>
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

function DepositModal({ agentAddress }: { agentAddress: string }) {
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
            const { connectWallet: connect } = await import('../../../../lib/wallet');
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
            const { CONTRACTS } = await import('../../../../lib/config');
            const { sendTCRODeposit, sendERC20Token } = await import('../../../../lib/wallet');

            let tx;

            if (formData.currency === 'TCRO') {
                tx = await sendTCRODeposit(agentAddress, formData.amount);
            } else if (formData.currency === 'devUSDC.e' || formData.currency === 'USDC') {
                // Deposit USDC to agent wallet
                tx = await sendERC20Token(CONTRACTS.devUSDC, agentAddress, formData.amount);
            } else {
                throw new Error('Unsupported currency');
            }

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
                <Button variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" /> Deposit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>
                        Add TCRO to this agent&apos;s wallet on Cronos Testnet.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {!walletConnected ? (
                            <div className="flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Connect your wallet to deposit funds
                                </p>
                                <Button type="button" onClick={connectWallet} className="w-full">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Connect Wallet
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg bg-muted p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
                                    <p className="text-sm font-mono text-primary">
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
                                            <SelectItem value="devUSDC.e">devUSDC.e</SelectItem>
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
                        Manage your agent&apos;s cryptographic keys.
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
                                        onClick={() => copyToClipboard(agent?.walletPrivateKey || '')}
                                    >
                                        <Copy className="h-3 w-3 mr-1" /> Copy
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
                            <p className="font-mono text-xs text-slate-300 break-all">
                                {showPrivateKey ? (agent?.walletPrivateKey || 'Not Available') : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
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
        if (!agent || !agent.walletAddress) return;

        try {
            setBalanceLoading(true);
            const { getTCROBalance } = await import('../../../../lib/wallet');
            const balance = await getTCROBalance(agent.walletAddress);
            setTcroBalance(parseFloat(balance).toFixed(2));
        } catch (error) {
            console.error('Error fetching balance:', error);
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            try {
                setLoading(true);
                const [agentData, recipientsData] = await Promise.all([
                    agentsApi.getById(params.id),
                    recipientsApi.getAll(params.id)
                ]);
                setAgent(agentData);
                setSubUsers(recipientsData);
            } catch (err: any) {
                setError(err.message || 'Failed to load agent data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    // Fetch balance when agent is loaded
    useEffect(() => {
        if (agent) {
            fetchBalance();
        }
    }, [agent]);

    // Removed localStorage effects

    const handleAddUser = async (userData: any) => {
        try {
            const newUser = await recipientsApi.create(params.id, userData);
            setSubUsers(prev => [...prev, newUser]);
        } catch (error: any) {
            alert(`Failed to add recipient: ${error.message}`);
        }
    };

    const handleEditUser = async (recipientId: string, updates: any) => {
        try {
            const updated = await recipientsApi.update(params.id, recipientId, updates);
            setSubUsers(prev => prev.map(u => u.id === recipientId ? updated : u));
        } catch (error: any) {
            alert(`Failed to update recipient: ${error.message}`);
        }
    };

    const handleDeleteUser = async (recipientId: string) => {
        if (!confirm('Are you sure you want to remove this recipient?')) return;
        try {
            await recipientsApi.delete(params.id, recipientId);
            setSubUsers(prev => prev.map(u => u.id === recipientId ? { ...u, status: 'deleted' } as any : u).filter(u => u.id !== recipientId));
        } catch (error: any) {
            alert(`Failed to delete recipient: ${error.message}`);
        }
    };

    // Transaction state
    const [transactions, setTransactions] = useState<any[]>([]);

    // NEW: Load transactions from API
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!params.id) return;
            try {
                const data = await apiClient<any[]>(`/transactions/agent/${params.id}`);
                const formattedTxs = data.map((tx: any) => ({
                    id: tx.id,
                    type: tx.type,
                    status: tx.status,
                    amount: `${tx.amount} ${tx.token || 'TCRO'}`,
                    date: tx.createdAt,
                    recipients: 1
                }));
                setTransactions(formattedTxs);
            } catch (err) {
                console.error('Failed to load transactions:', err);
            }
        };
        fetchTransactions();
    }, [params.id]);

    // NEW: Function to add transaction
    const addTransaction = async (txHash: string, amount: number, recipientsCount: number) => {
        try {
            await apiClient('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    txHash,
                    amount,
                    agentId: params.id,
                    type: recipientsCount > 1 ? 'Batch Payment' : 'Payment',
                    status: 'success',
                    token: 'TCRO'
                }),
            });
            // Refresh transactions list
            const updatedTxs = await apiClient<any[]>(`/transactions/agent/${params.id}`);
            const formattedTxs = updatedTxs.map((tx: any) => ({
                id: tx.id,
                type: tx.type,
                status: tx.status,
                amount: `${tx.amount} ${tx.token}`,
                date: tx.createdAt,
                recipients: 1 // Simplified
            }));
            setTransactions(formattedTxs);
        } catch (error) {
            console.error('Failed to save transaction:', error);
        }
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
                        <span className="font-mono text-xs text-slate-500" title="Internal ID">{agent.id}</span>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-indigo-400 font-mono" title="Agent Smart Wallet">
                            <Wallet className="h-2.5 w-2.5" />
                            <span>{agent.walletAddress || 'Not Deployed'}</span>
                            <Copy
                                className="h-2.5 w-2.5 ml-1 cursor-pointer hover:text-white transition-colors"
                                onClick={() => {
                                    if (agent.walletAddress) {
                                        navigator.clipboard.writeText(agent.walletAddress);
                                        alert('Address copied!');
                                    }
                                }}
                            />
                        </div>
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
                            <CardDescription>Manage recipients for this entity&apos;s distributions.</CardDescription>
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
                                                        <EditUserModal user={user} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} />
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
                        address={agent.walletAddress || ''}
                        subUsers={subUsers}
                        agent={agent}
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

function WalletInfo({ balance, address, subUsers, agent, onTransactionSuccess }: {
    balance: string,
    address: string,
    subUsers: any[],
    agent: Agent | null,
    onTransactionSuccess: (txHash: string, amount: number, recipientsCount: number) => void
}) {
    const [tcroBalance, setTcroBalance] = useState('0.00');
    const [usdcBalance, setUsdcBalance] = useState('0.00');
    const [agentWalletAddress, setAgentWalletAddress] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [totalUsd, setTotalUsd] = useState('0.00');

    const fetchBalances = async () => {
        if (!address) return;
        try {
            const { CONTRACTS } = await import('../../../../lib/config');
            const { getTCROBalance, getERC20Balance } = await import('../../../../lib/wallet');

            // Parallel fetch
            const [tcroBal, usdcBal] = await Promise.all([
                getTCROBalance(address),
                getERC20Balance(CONTRACTS.devUSDC, address)
            ]);

            setTcroBalance(parseFloat(tcroBal).toFixed(2));
            setUsdcBalance(parseFloat(usdcBal).toFixed(2));
            setAgentWalletAddress(address);

            // Calculate Total USD (Mock prices)
            const tcroPrice = 0.053; // Mock TCRO price
            const usdcPrice = 1.0;
            const total = (parseFloat(tcroBal) * tcroPrice) + (parseFloat(usdcBal) * usdcPrice);
            setTotalUsd(total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        } catch (e) {
            console.error("Failed to fetch balance", e);
        }
    };

    useEffect(() => {
        fetchBalances();
        // Poll every 30s
        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchBalances();
        // Minimal delay to show spinner
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <CardTitle>Wallet Info</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh}>
                        <RefreshCw className={`h-3 w-3 text-muted-foreground ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Balance (Est.)</p>
                        <h2 className="text-3xl font-bold mt-1">${totalUsd}</h2>
                        <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Protected by x402</span>
                        </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Smart Address</span>
                            <Copy
                                className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(agentWalletAddress);
                                    alert('Agent wallet address copied!');
                                }}
                            />
                        </div>
                        <p className="font-mono text-xs text-foreground break-all">
                            {agentWalletAddress || 'Loading...'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">TCRO Balance</span>
                            <span className="font-mono">{tcroBalance}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">devUSDC.e Balance</span>
                            <span className="font-mono">{usdcBalance}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                            <BatchPaymentModal
                                agentAddress={address}
                                subUsers={subUsers}
                                onTransactionSuccess={onTransactionSuccess}
                            />
                        </div>
                        <DepositModal agentAddress={address} />
                        <KeysModal agent={agent} />
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                            if (confirm('To disconnect completely, please also disconnect in your MetaMask extension. Reloading now...')) {
                                window.location.reload();
                            }
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Disconnect Wallet
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
