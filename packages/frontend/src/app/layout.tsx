import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
    title: 'SyncFlow Protocol - Autonomous Financial Settlement for AI Agents',
    description: 'Autonomous payment orchestration platform for AI agents on Cronos EVM. Multi-leg workflows, x402 payments, and deep protocol integration.',
    keywords: ['cronos', 'x402', 'ai-agents', 'defi', 'blockchain', 'payments'],
    authors: [{ name: 'SyncFlow Protocol' }],
    openGraph: {
        title: 'SyncFlow Protocol',
        description: 'Autonomous Financial Settlement for AI Agents on Cronos',
        type: 'website',
    },
};

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen relative`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-background to-background pointer-events-none z-[-1]" />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
