import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        cronosTestnet: {
            url: 'https://evm-t3.cronos.org',
            chainId: 338,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 5000000000000, // 5000 gwei
        },
        cronosMainnet: {
            url: 'https://evm.cronos.org',
            chainId: 25,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 5000000000000,
        },
    },
    etherscan: {
        apiKey: {
            cronosTestnet: process.env.CRONOS_EXPLORER_API_KEY || '',
            cronosMainnet: process.env.CRONOS_EXPLORER_API_KEY || '',
        },
        customChains: [
            {
                network: 'cronosMainnet',
                chainId: 25,
                urls: {
                    apiURL: 'https://api.cronoscan.com/api',
                    browserURL: 'https://cronos.org/explorer',
                },
            },
            {
                network: 'cronosTestnet',
                chainId: 338,
                urls: {
                    apiURL: 'https://explorer-api.cronos.org/testnet/api/v1',
                    browserURL: 'https://cronos.org/explorer/testnet3',
                },
            },
        ],
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS === 'true',
        currency: 'USD',
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
};

export default config;
