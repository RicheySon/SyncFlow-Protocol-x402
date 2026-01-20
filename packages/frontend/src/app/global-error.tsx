'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                    <div className="text-center space-y-6 max-w-md px-4">
                        <h2 className="text-4xl font-bold text-foreground">Something went wrong!</h2>
                        <p className="text-muted-foreground">
                            {error.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
