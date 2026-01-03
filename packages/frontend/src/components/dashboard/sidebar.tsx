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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { UserManager } from '@/lib/api';
import { authApi } from '@/lib/api/auth';

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents', href: '/dashboard/agents', icon: Bot },
    { name: 'Workflows', href: '/dashboard/workflows', icon: Workflow },
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

    useEffect(() => {
        const userData = UserManager.getUser();
        if (userData) {
            setUser(userData);
        }
    }, []);

    const handleLogout = () => {
        authApi.logout();
        router.push('/login');
    };

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-muted/30">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                <span className="text-xl font-bold">SyncFlow</span>
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
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                        <p className="truncate text-xs text-muted-foreground">{user?.email || 'Loading...'}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
