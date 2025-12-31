import { app } from './app';
import { env } from './config/env';

const startServer = async () => {
    try {
        // In the future: Connect to database here

        app.listen(env.PORT, () => {
            console.log(`🚀 Backend server running on http://localhost:${env.PORT}`);
            console.log(`Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
