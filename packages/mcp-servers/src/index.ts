import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPortfolioTools } from "./servers/PortfolioServer.js";
import { registerTransactionTools } from "./servers/TransactionMonitorServer.js";
import { registerIndexerTools } from "./servers/ProtocolIndexerServer.js";
import { registerMarketTools } from "./servers/MarketDataBridgeServer.js";

// Create an MCP server
const server = new McpServer({
    name: "SyncFlow Protocol",
    version: "1.0.0"
});

// Register tools and resources
registerPortfolioTools(server);
registerTransactionTools(server);
registerIndexerTools(server);
registerMarketTools(server);

// Start the server using stdio transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SyncFlow MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
