'use client';

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-background text-foreground min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Critical Application Error</h1>
                    <p className="text-muted-foreground">The application encountered a critical error.</p>
                    <Button onClick={() => reset()} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Reload Application
                    </Button>
                </div>
            </body>
        </html>
    );
}
