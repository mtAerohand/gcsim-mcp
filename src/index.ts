#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { initConfig } from "./config.js";
import { executeGcsimCommand } from "./tools/gcsim.js";

/**
 * Create an MCP server
 */
const server = new Server(
  {
    name: "gcsim-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available tools.
 * Exposes a single "run_gcsim" tool that lets clients run gcsim simulations.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "run_gcsim",
        description: "Run gcsim simulation with provided config",
        inputSchema: {
          type: "object",
          properties: {
            config: {
              type: "string",
              description: "gcsim config file content"
            },
            // options: {
            //   type: "object",
            //   properties: {
            //     substatOptimFull: {
            //       type: "boolean",
            //       description: "Run with substat optimization"
            //     }
            //     // 他のオプションも必要に応じて追加
            //   },
            //   description: "Simulation options"
            // }
          },
          required: ["config"]
        }
      }
    ]
  };
});

/**
 * Handler for the run_gcsim tool.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "run_gcsim") {
    throw new Error("Unknown tool");
  }

  const configContent = String(request.params.arguments?.config);
  // const options = request.params.arguments?.options || {};

  // configファイルの一時保存と実行
  return await executeGcsimCommand(configContent);
});

/**
 * Handler for listing available resources.
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: []
  };
});

/**
 * Handler that lists available prompts.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: []
  };
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  // MCPホストから渡されたコマンドライン引数を取得
  initConfig(process.argv);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
