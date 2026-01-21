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
            <body style={{ padding: '40px', textAlign: 'center', color: 'white', background: '#000' }}>
                <h1>Global Application Error</h1>
                <button onClick={() => reset()}>Try again</button>
            </body>
        </html>
    );
}
