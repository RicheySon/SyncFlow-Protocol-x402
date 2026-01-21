'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';

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
        <div style={{ padding: '40px', textAlign: 'center', color: 'white', background: '#000' }}>
            <h1>Something went wrong!</h1>
            <button
                onClick={() => reset()}
                style={{ color: '#7D45FD', background: 'none', border: '1px solid #7D45FD', padding: '10px' }}
            >
                Try again
            </button>
        </div>
    );
}
