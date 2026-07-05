import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { compressPdf } from "../tools/compress.js";

export function registerCompressTools(server: McpServer): void {
  server.registerTool(
    "compress_pdf",
    {
      title: "Compress PDF",
      description:
        "Reduce the file size of a PDF. " +
        "Quality options: 'low' (max compression), 'medium' (balanced), 'high' (minimal compression, best quality).",
      inputSchema: {
        file: z.string().describe("Absolute path to the source PDF"),
        output: z.string().describe("Absolute path for the compressed output PDF"),
        quality: z
          .enum(["low", "medium", "high"])
          .default("medium")
          .describe("Compression level: low | medium | high (default: medium)"),
      },
    },
    async ({ file, output, quality }) => {
      try {
        const result = await compressPdf({ file, output, quality });
        return { content: [{ type: "text", text: result }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
