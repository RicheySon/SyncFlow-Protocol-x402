/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    transpilePackages: ['syncflow-protocol-sdk-demo'],
    // Disable all static optimization
    output: undefined,
    images: {
        domains: ['localhost'],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        NEXT_PUBLIC_CRONOS_CHAIN_ID: '338',
        NEXT_PUBLIC_CRONOS_RPC_URL: 'https://evm-t3.cronos.org',
        NEXT_PUBLIC_CRONOS_EXPLORER: 'https://cronos.org/explorer/testnet3',
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';",
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    }
                ],
            },
        ];
    },
    webpack: (config, { isServer }) => {
        // Disable Node.js polyfills for client-side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                crypto: false,
                stream: false,
                buffer: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
