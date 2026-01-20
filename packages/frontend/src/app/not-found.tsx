export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <div className="text-center space-y-6 max-w-md px-4">
                <h2 className="text-6xl font-bold text-foreground">404</h2>
                <h3 className="text-2xl font-semibold text-foreground">Page Not Found</h3>
                <p className="text-muted-foreground">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <a
                    href="/"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
