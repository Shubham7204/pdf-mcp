import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mergePdf } from "../tools/merge.js";

export function registerMergeTools(server: McpServer): void {
  server.registerTool(
    "merge_pdf",
    {
      title: "Merge PDFs",
      description:
        "Merge multiple PDF files into a single PDF. " +
        "Provide absolute paths for all input files and the output file.",
      inputSchema: {
        files: z
          .array(z.string())
          .min(2)
          .describe("Array of absolute paths to PDF files to merge (at least 2)"),
        output: z.string().describe("Absolute path for the merged output PDF"),
      },
    },
    async ({ files, output }) => {
      try {
        const result = await mergePdf({ files, output });
        return { content: [{ type: "text", text: result }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
