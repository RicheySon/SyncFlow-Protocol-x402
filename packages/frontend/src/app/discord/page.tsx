import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiscordLoader } from '@/components/ui/discord-loader';

export default function DiscordPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#010314] text-[#DFE1F4] relative overflow-hidden">
            {/* Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 mt-[-100px]">
                <DiscordLoader />

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7D45FD] to-white">
                        Discord Channel Incoming
                    </h1>
                    <p className="text-[#8890A6] text-lg max-w-md mx-auto">
                        We are preparing the server. Join the community soon to discuss Agentic Finance.
                    </p>
                </div>

                <Button asChild variant="outline" className="border-[#FFFFFF]/10 bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 text-white gap-2">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" /> Return Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
