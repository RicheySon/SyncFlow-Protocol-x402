import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { BlockchainService } from '../services/blockchain.service';

export class DevToolsController {
    static async getStatus(req: Request, res: Response) {
        try {
            // Check Database
            await prisma.$queryRaw`SELECT 1`;

            // Check Blockchain
            let blockchainStatus = 'pending';
            try {
                const blockNumber = await BlockchainService.getBlockNumber();
                blockchainStatus = `connected (Block: ${blockNumber})`;
            } catch (e) {
                blockchainStatus = 'error';
            }

            res.json({
                status: 'operational',
                services: {
                    database: 'connected',
                    api: 'running',
                    blockchain_rpc: blockchainStatus
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(503).json({
                status: 'degraded',
                services: {
                    database: 'disconnected',
                    api: 'running'
                },
                error: (error as Error).message
            });
        }
    }

    static getConfig(req: Request, res: Response) {
        res.json({
            chainId: env.CRONOS_CHAIN_ID,
            rpcUrl: env.CRONOS_RPC_URL,
            env: env.NODE_ENV
        });
    }
}
