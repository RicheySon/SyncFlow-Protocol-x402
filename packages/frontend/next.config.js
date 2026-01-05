/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    images: {
        domains: ['localhost'],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        NEXT_PUBLIC_CRONOS_CHAIN_ID: '338',
        NEXT_PUBLIC_CRONOS_RPC_URL: 'https://evm-t3.cronos.org',
        NEXT_PUBLIC_CRONOS_EXPLORER: 'https://cronos.org/explorer/testnet3',
    },
};

module.exports = nextConfig;
