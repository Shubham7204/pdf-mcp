
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { mergePdf } from "./tools/merge.js";
import { splitPdf } from "./tools/split.js";
import { compressPdf } from "./tools/compress.js";
import { extractText } from "./tools/extract.js";
import { protectPdf } from "./tools/protect.js";
import { listFiles } from "./tools/listfiles.js";

// ─── CRITICAL: Never use console.log() in an MCP stdio server. ──────────────
// It writes to stdout, which corrupts the JSON-RPC message stream.
// Use console.error() for all logs — it goes to stderr and is safe.
// ─────────────────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "pdf-mcp-server",
  version: "1.0.0",
});

// ─── Tool 1: merge_pdf ───────────────────────────────────────────────────────
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

// ─── Tool 2: split_pdf ───────────────────────────────────────────────────────
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

// ─── Tool 3: compress_pdf ────────────────────────────────────────────────────
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

// ─── Tool 4: extract_text ────────────────────────────────────────────────────
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

// ─── Tool 5: protect_pdf ─────────────────────────────────────────────────────
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

// ─── Tool 6: list_files ─────────────────────────────────────────────────────
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

// ─── Start server ─────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PDF MCP Server running on stdio"); // stderr = safe
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});