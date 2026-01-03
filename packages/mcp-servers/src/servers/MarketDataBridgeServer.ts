import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMarketTools(server: McpServer) {
    server.tool(
        "get_token_price",
        { symbol: z.string() },
        async ({ symbol }) => {
            // Mock Market Data (In real app: Call CoinGecko/Cronos Oracle)
            const PRICES: Record<string, number> = {
                'CRO': 0.10,
                'WCRO': 0.10,
                'USDC': 1.00,
                'ETH': 3000.00,
                'BTC': 60000.00,
                'VVS': 0.000004
            };

            const price = PRICES[symbol.toUpperCase()] || 0.0;

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ symbol: symbol.toUpperCase(), price_usd: price, source: 'SyncFlow Oracle Bridge' }, null, 2)
                }]
            };
        }
    );
}
