import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listFiles } from "../tools/listfiles.js";

export function registerListFilesTools(server: McpServer): void {
  server.registerTool(
    "list_files",
    {
      title: "List Files",
      description:
        "List files in a local directory. Optionally filter by extension like .pdf",
      inputSchema: {
        directory: z.string().describe("Absolute path to the directory"),
        extension: z
          .string()
          .optional()
          .describe("Optional file extension filter e.g. .pdf"),
      },
    },
    async ({ directory, extension }) => {
      try {
        const result = await listFiles({ directory, extension });
        return { content: [{ type: "text", text: result }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
