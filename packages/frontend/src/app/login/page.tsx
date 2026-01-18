'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Lock,
    Mail,
    User,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi } from '@/lib/api/auth';
import { ModeToggle } from '@/components/mode-toggle';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ email: '', password: '', name: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await authApi.login(loginData);
            router.push('/dashboard/agents');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await authApi.signup(signupData);
            router.push('/dashboard/agents');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Left Column - Hero Image */}
            <div className="hidden lg:flex lg:w-3/5 w-full relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/login-bg.jpg')" }}
                />

                {/* Overlay Gradient - adapts to theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">
                    {/* Top Status */}
                    <div className="flex">
                        <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 backdrop-blur-md">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-mono font-medium text-primary tracking-wider">ENCRYPTED SESSION</span>
                        </div>
                    </div>

                    {/* Bottom Hero Text */}
                    <div className="space-y-6 max-w-2xl">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                            Autonomous <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                Financial Settlement.
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-lg">
                            Enable your AI agents to transact seamlessly on Cronos EVM with x402 protocol. Instant micropayments, zero friction.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Auth Interface */}
            <div className="flex-1 w-full lg:w-2/5 flex flex-col relative bg-card border-l border-border">
                {/* Theme Toggle Positioned */}
                <div className="absolute top-6 right-6 z-20">
                    <ModeToggle />
                </div>

                <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 py-12">
                    <div className="w-full max-w-[400px] mx-auto space-y-8">

                        {/* Header Area */}
                        <div className="space-y-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[1px] shadow-2xl shadow-primary/20">
                                <div className="h-full w-full rounded-2xl bg-background flex items-center justify-center">
                                    <Lock className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-foreground">SyncFlow Protocol</h2>
                                <p className="text-muted-foreground mt-2">Access the autonomous financial settlement platform.</p>
                            </div>
                        </div>

                        {/* Tabs for Login/Sign Up */}
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Login Form */}
                            <TabsContent value="login" className="space-y-4 mt-6">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    {error && (
                                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="agent@syncflow.ai"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Sign Up Form */}
                            <TabsContent value="signup" className="space-y-4 mt-6">
                                <form onSubmit={handleSignup} className="space-y-4">
                                    {error && (
                                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            placeholder="Agent Name"
                                            value={signupData.name}
                                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="agent@syncflow.ai"
                                            value={signupData.email}
                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Must be at least 6 characters
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                        {isLoading ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        {/* Security Footer Card */}
                        <div className="mt-8 rounded-xl bg-muted/50 border border-border p-4 flex gap-4 items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-foreground">x402 Protocol Active</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your AI agents can execute instant, secure micropayments on Cronos EVM blockchain.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
