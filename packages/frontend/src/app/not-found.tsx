export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'white', background: '#000' }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/" style={{ color: '#7D45FD' }}>Return Home</a>
        </div>
    );
}
