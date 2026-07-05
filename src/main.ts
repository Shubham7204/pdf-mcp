import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

import { registerMergeTools } from "./mcp-tools/merge.js";
import { registerSplitTools } from "./mcp-tools/split.js";
import { registerCompressTools } from "./mcp-tools/compress.js";
import { registerExtractTools } from "./mcp-tools/extract.js";
import { registerProtectTools } from "./mcp-tools/protect.js";
import { registerListFilesTools } from "./mcp-tools/listfiles.js";
import { registerRotateTools } from "./mcp-tools/rotate.js";

const server = new McpServer({
  name: "pdf-mcp-server",
  version: "1.0.0",
});

// Register all tools
registerMergeTools(server);
registerSplitTools(server);
registerCompressTools(server);
registerExtractTools(server);
registerProtectTools(server);
registerListFilesTools(server);
registerRotateTools(server);

// Stdio startup logic
async function startStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PDF MCP Server running on stdio");
}

// SSE startup logic
async function startSse() {
  const app = express();
  let transport: SSEServerTransport | undefined;

  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    if (!transport) {
      res.status(400).json({ error: "No transport" });
      return;
    }
    await transport.handlePostMessage(req, res);
  });

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
  app.listen(PORT, () => {
    console.error(`PDF MCP Server running on SSE (port ${PORT})`);
  });
}

async function main() {
  const isSse = process.env.TRANSPORT === "sse";
  if (isSse) {
    await startSse();
  } else {
    await startStdio();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
