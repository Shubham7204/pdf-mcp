import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { extractText } from "../tools/extract.js";

export function registerExtractTools(server: McpServer): void {
  server.registerTool(
    "extract_text",
    {
      title: "Extract Text from PDF",
      description:
        "Extract text content from a PDF using OCR. " +
        "If an output path is given, writes the text to that file. " +
        "Otherwise returns the first 2000 characters inline.",
      inputSchema: {
        file: z.string().describe("Absolute path to the source PDF"),
        output: z
          .string()
          .optional()
          .describe("Optional: absolute path to write extracted text (.txt file)"),
      },
    },
    async ({ file, output }) => {
      try {
        const result = await extractText({ file, output });
        return { content: [{ type: "text", text: result }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
