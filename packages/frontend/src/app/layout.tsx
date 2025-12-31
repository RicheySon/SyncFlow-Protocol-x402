import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}
