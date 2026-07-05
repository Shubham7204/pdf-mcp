import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { protectPdf } from "../tools/protect.js";

export function registerProtectTools(server: McpServer): void {
  server.registerTool(
    "protect_pdf",
    {
      title: "Password-Protect PDF",
      description:
        "Encrypt a PDF with AES-256 and set a user password. " +
        "An optional owner_password can restrict editing/printing.",
      inputSchema: {
        file: z.string().describe("Absolute path to the source PDF"),
        output: z.string().describe("Absolute path for the protected output PDF"),
        password: z.string().min(1).describe("Password required to open the PDF"),
        owner_password: z
          .string()
          .optional()
          .describe("Optional owner/admin password (defaults to user password)"),
      },
    },
    async ({ file, output, password, owner_password }) => {
      try {
        const result = await protectPdf({ file, output, password, owner_password });
        return { content: [{ type: "text", text: result }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
