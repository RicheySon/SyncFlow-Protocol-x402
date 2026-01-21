'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-[450px] border-destructive/20 bg-destructive/5 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl text-destructive">Something went wrong!</CardTitle>
                    <CardDescription>
                        An unexpected error occurred. Our team has been notified.
                        {error.digest && <span className="block mt-2 font-mono text-xs text-muted-foreground">Error ID: {error.digest}</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={() => reset()} variant="outline" className="gap-2 border-destructive/20 hover:bg-destructive/10">
                        <RefreshCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
