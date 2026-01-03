import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTransactionTools(server: McpServer) {
    server.tool(
        "get_recent_transactions",
        { agentId: z.string().optional() },
        async ({ agentId }) => {
            // Mock Data
            const transactions = [
                { hash: '0x123...', type: 'SWAP', amount: '100 TCRO', status: 'CONFIRMED' },
                { hash: '0x456...', type: 'STAKE', amount: '500 VVS', status: 'PENDING' }
            ];

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(transactions, null, 2)
                }]
            };
        }
    );
}
