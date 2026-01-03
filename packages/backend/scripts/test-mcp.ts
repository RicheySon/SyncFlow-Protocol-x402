import { spawn } from 'child_process';
import path from 'path';

async function main() {
    console.log('🔌 Testing MCP Server Connection...');

    const mcpPath = path.resolve(__dirname, '../../mcp-servers/src/index.ts');

    // Use npx.cmd on Windows, npx on others
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

    // Use tsx to run the MCP server directly
    const mcpProcess = spawn(cmd, ['tsx', mcpPath], {
        cwd: path.resolve(__dirname, '../../mcp-servers'),
        env: { ...process.env, PATH: process.env.PATH },
        stdio: ['pipe', 'pipe', 'inherit'], // pipe stdin/stdout, inherit stderr
        shell: true
    });

    console.log('🚀 MCP Server Process Started');

    mcpProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter((l: string) => l.trim() !== '');
        for (const line of lines) {
            try {
                const msg = JSON.parse(line);
                if (msg.result) {
                    console.log('✅ Received Tool Result:', JSON.stringify(msg.result, null, 2));
                    mcpProcess.kill();
                    process.exit(0);
                }
            } catch (e) {
                // Ignore non-JSON output (like debug logs if any leak to stdout)
                console.log('RAW STDOUT:', line);
            }
        }
    });

    // Wait a bit for startup then send a JSON-RPC request
    setTimeout(() => {
        const listToolsRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
            params: {}
        };

        console.log('📤 Sending list_tools request...');
        mcpProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

        // Also try calling the portfolio tool
        setTimeout(() => {
            const callToolRequest = {
                jsonrpc: "2.0",
                id: 2,
                method: "tools/call",
                params: {
                    name: "get_agent_portfolio",
                    arguments: { agentId: "agent-123" }
                }
            };
            console.log('📤 Sending get_agent_portfolio request...');
            mcpProcess.stdin.write(JSON.stringify(callToolRequest) + '\n');
        }, 1000);

    }, 2000);
}

main().catch(console.error);
