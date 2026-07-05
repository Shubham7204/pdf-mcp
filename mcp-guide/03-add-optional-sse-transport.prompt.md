---
mode: "agent"
description: "03 - Add an optional SSE transport alongside stdio, defaulting to stdio"
---

# 03 — Add Optional Remote Transport

## Problem
The server currently only works over stdio, which is fine for local
Cursor/VS Code use but means it can't be run as a remote/shared service.
Add an SSE transport as an *option*, selected by an environment variable,
without changing the default local behavior.

## Supporting Information

```ts
import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = express();
let transport: SSEServerTransport | undefined;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (!transport) {
    res.status(400).json({ error: "No transport" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

app.listen(8080, () => console.error("MCP Server (SSE) on port 8080"));
```

`pnpm add express@5.1.0` (and `@types/express` as a dev dependency if using
strict TS).

Transport selection: read `process.env.TRANSPORT` (`"stdio"` default,
`"sse"` opt-in). If unset or anything other than `"sse"`, behavior must be
byte-for-byte identical to today — same `StdioServerTransport` connect call
already in `main.ts`.

## Steps To Complete
1. Install `express` as shown, pinned to the exact version.
2. Extract the current stdio startup logic in `main.ts` into a
   `startStdio(server)` function; do not change what it does.
3. Add a `startSse(server)` function implementing the Express/SSE pattern
   above.
4. At the bottom of `main.ts`, branch on `process.env.TRANSPORT === "sse"`
   to call `startSse` instead of `startStdio` — default (unset or any other
   value) must call `startStdio`.
5. Do NOT remove or alter the stdio path. Do NOT change any tool
   registration.
6. Update `.github/instructions/important-files.instructions.md` if any new
   file was created (e.g. `src/server/sse.ts` if you split it out rather
   than inlining in `main.ts`).
7. Run the build script, then run the server with no `TRANSPORT` env var
   set and confirm it starts on stdio exactly as before.
