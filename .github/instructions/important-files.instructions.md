---
applyTo: "**"
description: "Map of files in the project"
---

# Project File Map

Below is the directory map of the PDF MCP server project:

| File Path | Description |
|---|---|
| `package.json` | Project scripts, dependencies (express, pdf-lib, tesseract.js, qpdf), metadata |
| `tsconfig.json` | strict TypeScript configuration for NodeNext / ES Modules |
| `src/main.ts` | Entry point. Starts Stdio or SSE transport depending on `TRANSPORT` environment variable and runs tool registration |
| `src/lib/paths.ts` | Shared paths safety helper checking path traversal constraints using `PDF_MCP_ROOT` |
| `src/tools/compress.ts` | Function logic to compress PDFs via `qpdf` command with 30s timeout |
| `src/tools/extract.ts` | Function logic to extract text from PDF (native text extraction) or Images (OCR via Tesseract, with 20MB limit) |
| `src/tools/listfiles.ts` | Function logic to list files in a local directory with extension filters |
| `src/tools/merge.ts` | Function logic to merge multiple PDFs into a single file using `pdf-lib` |
| `src/tools/protect.ts` | Function logic to encrypt PDFs with AES-256 via `qpdf` command with 30s timeout |
| `src/tools/split.ts` | Function logic to extract pages from a PDF using `pdf-lib` |
| `src/tools/rotate.ts` | Function logic to rotate pages of a PDF by 90/180/270 degrees using `pdf-lib` |
| `src/mcp-tools/compress.ts` | MCP server tool registration logic for `compress_pdf` |
| `src/mcp-tools/extract.ts` | MCP server tool registration logic for `extract_text` |
| `src/mcp-tools/listfiles.ts` | MCP server tool registration logic for `list_files` |
| `src/mcp-tools/merge.ts` | MCP server tool registration logic for `merge_pdf` |
| `src/mcp-tools/protect.ts` | MCP server tool registration logic for `protect_pdf` |
| `src/mcp-tools/split.ts` | MCP server tool registration logic for `split_pdf` |
| `src/mcp-tools/rotate.ts` | MCP server tool registration logic for `rotate_pdf` |
| `src/types/pdf-parse.d.ts` | Ambient TypeScript typings for `pdf-parse` library |

> [!IMPORTANT]
> Whenever a new file is added or modified under `src/`, please ensure this table is updated to reflect the new structure.
