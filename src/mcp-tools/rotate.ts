import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { rotatePdf } from "../tools/rotate.js";

export function registerRotateTools(server: McpServer): void {
  server.registerTool(
    "rotate_pdf",
    {
      title: "Rotate PDF Pages",
      description:
        "Rotate specified pages of a PDF by a given angle (90/180/270 degrees) and write the result to a new file. " +
        "Pages are 1-indexed.",
      inputSchema: {
        file: z.string().describe("Absolute path to the source PDF"),
        output: z.string().describe("Absolute path for the output PDF"),
        pages: z
          .array(z.number().int().positive())
          .min(1)
          .describe("Array of page numbers to rotate (1-indexed)"),
        angle: z
          .union([z.literal(90), z.literal(180), z.literal(270)])
          .describe("Rotation angle in degrees: 90 | 180 | 270"),
      },
    },
    async ({ file, output, pages, angle }) => {
      try {
        const result = await rotatePdf({ file, output, pages, angle });
        return { content: [{ type: "text", text: result }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
