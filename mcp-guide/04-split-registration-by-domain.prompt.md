---
mode: "agent"
description: "04 - Split large files into smaller chunks by domain (project-agnostic)"
---

# 04 — Split Files By Domain

## Problem
The files are getting a bit too big. We want to break them up into smaller
chunks to make them easier for the coding agent to understand.

## Supporting Information

There are two concepts in this repo: **functions** and **tools**.
- functions are the way we connect to the underlying system or library the
  server wraps.
- tools are the things attached to the MCP server. tools contain functions.

We want to break up the large files we have into smaller chunks, using a
file structure that reflects the relationship between tools and functions
— e.g. `src/<functions-dir>/<domain>.ts` for the connection logic, and a
separate registration layer for the MCP-facing `server.registerTool(...)`
calls, grouped the same way by domain.

## Steps To Complete
1. Read the current large file(s) in full before changing anything.
2. Break up the large files into smaller chunks, using the file structure
   above.
3. Each file may contain multiple functions or tools, but they should be
   split by domain, not by arbitrary line count.
4. Preserve every function and tool's name, signature, and behavior exactly
   — this is a structural move, not a rewrite.
5. Ensure all major files are added to
   `.github/instructions/important-files.instructions.md`.
6. Run the build script and confirm nothing's behavior changed.
