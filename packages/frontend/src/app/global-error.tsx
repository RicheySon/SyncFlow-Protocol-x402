'use client';

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
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Something went wrong!</h2>
                    <p className="text-muted-foreground mb-8">Global Error</p>
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white px-4 py-2"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
