import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Mock Data Source (In real app, connect to DB/BlockchainService)
const MOCK_PORTFOLIOS: Record<string, any> = {
    'agent-123': { balance: '100.5 TCRO', positions: [{ symbol: 'USDC', amount: '500' }] },
    'seed-agent': { balance: '10.0 TCRO', positions: [] }
};

export function registerPortfolioTools(server: McpServer) {
    server.tool(
        "get_agent_portfolio",
        { agentId: z.string() },
        async ({ agentId }) => {
            const portfolio = MOCK_PORTFOLIOS[agentId] || MOCK_PORTFOLIOS['seed-agent'];

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(portfolio, null, 2)
                }]
            };
        }
    );

    server.resource(
        "portfolio",
        "syncflow://agents/{agentId}/portfolio",
        async (uri, { agentId }) => {
            const portfolio = MOCK_PORTFOLIOS[agentId] || MOCK_PORTFOLIOS['seed-agent'];
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify(portfolio, null, 2)
                }]
            };
        }
    );
}
