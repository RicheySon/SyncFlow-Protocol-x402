'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Bot,
    Workflow,
    Receipt,
    Wrench,
    BookOpen,
    User,
    LogOut,
    MessageSquare,
    Box,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ModeToggle } from '../mode-toggle';
import { UserManager } from '../../lib/api';
import { authApi } from '../../lib/api/auth';
import { getWalletState } from '../../lib/wallet';
import { Wallet } from 'lucide-react';

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents', href: '/dashboard/agents', icon: Bot },
    { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Dev Tools', href: '/dashboard/dev-tools', icon: Wrench },
    { name: 'Documentation', href: '/docs', icon: BookOpen },
];

interface UserData {
    name?: string;
    email: string;
}

export function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        const userData = UserManager.getUser();
        if (userData) {
            setUser(userData);
        }

        // Check wallet state
        const checkWallet = async () => {
            const state = await getWalletState();
            if (state.isConnected) {
                setWalletAddress(state.address);
            }
        };
        checkWallet();

        // Listen for wallet changes
        if (typeof window !== 'undefined' && window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                } else {
                    setWalletAddress(null);
                }
            };
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    const handleLogout = () => {
        authApi.logout();
        router.push('/login');
    };

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 transition-all duration-300">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                <div className="relative h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-lg" />
                    <Box className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">SyncFlow</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-border p-4 space-y-2">
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-muted-foreground font-medium">Theme</span>
                    <ModeToggle />
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium">{user?.name || 'User'}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{user?.email || 'Loading...'}</p>
                        {walletAddress && (
                            <div className="flex items-center gap-1 mt-0.5 text-indigo-400">
                                <Wallet className="h-2 w-2" />
                                <span className="text-[10px] font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                            </div>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
