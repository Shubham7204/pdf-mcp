import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { splitPdf } from "../tools/split.js";

export function registerSplitTools(server: McpServer): void {
  server.registerTool(
    "split_pdf",
    {
      title: "Split PDF",
      description:
        "Extract specific pages from a PDF into a new file. " +
        "Pages are 1-indexed (first page = 1).",
      inputSchema: {
        file: z.string().describe("Absolute path to the source PDF"),
        pages: z
          .array(z.number().int().positive())
          .min(1)
          .describe("Array of page numbers to extract (1-indexed)"),
        output: z.string().describe("Absolute path for the output PDF"),
      },
    },
    async ({ file, pages, output }) => {
      try {
        const result = await splitPdf({ file, pages, output });
        return { content: [{ type: "text", text: result }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
