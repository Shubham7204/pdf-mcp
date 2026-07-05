---
mode: "agent"
description: "01 - Bootstrap any new MCP server from an empty directory (project-agnostic base)"
---

# 01 — Set Up New MCP Server

## Problem
We want to set up a new MCP server, written in TypeScript, for:
**{{describe the project idea here — e.g. "a PDF toolkit", "a Notion
wrapper", "a weather lookup service"}}**.

We are starting from an empty directory, working in VS Code with GitHub
Copilot, so recording the important files in
`.github/instructions/important-files.instructions.md` is important.

We need to set up the basic file system for the project, install the
necessary dependencies, and set up the project structure — no domain logic
yet, just the skeleton and one demo tool to prove the server runs.

## Supporting Information

### Tools
Use `pnpm` as the package manager.

### File structure

**`.github/instructions/important-files.instructions.md`**
A file that lists the important files for the project, applied to every
Copilot request in this workspace. Use this frontmatter:

```
---
applyTo: "**"
description: "Map of files in the project"
---

...content goes here...
```

Add a directive at the end of the file that whenever a new file is added
under `src/`, it should be added to this table.

**`package.json`**

Scripts:
- `build`: `tsc`
- `dev`: `tsx watch src/main.ts`

Dependencies:
- `@modelcontextprotocol/sdk` — pin to the current latest version (check
  before installing, don't assume a number from memory)
- `zod` — pin to the current latest version

Dev dependencies:
- `tsx`
- `typescript`
- `@types/node`

`bin` should be set to `dist/main.js`.
`type` should be set to `module`.

**`tsconfig.json`**

A strict, modern baseline config for a Node/TypeScript MCP server:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "module": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,

    "declaration": true,

    "lib": ["es2022"]
  },
  "include": ["src"]
}
```

**`src/main.ts`**
The entry point, with a single demo tool to confirm the server boots before
any real domain logic is added:

```ts
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "{{project-name}}",
  version: "1.0.0",
});

// Demo tool — replace once the first real tool for this project lands.
server.registerTool(
  "ping",
  {
    title: "Ping",
    description: "Health check — echoes back a message.",
    inputSchema: { message: z.string() },
  },
  async ({ message }) => ({
    content: [{ type: "text", text: `pong: ${message}` }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("{{project-name}} MCP Server running on stdio");
```

**`.gitignore`**
A file listing files to ignore. `dist`, `node_modules`, and `.env` should
all be ignored — the last of these matters as soon as any tool needs a
credential.

## Steps To Complete
1. Create `package.json` with the recommended scripts and dependencies.
2. Use `pnpm add <pkg>@<version>` for every dependency, pinned to the
   current resolved version. Do NOT use `latest` or a bare unpinned range.
3. Install the dependencies.
4. Create `tsconfig.json` with the configuration above.
5. Create `src/main.ts`, `.gitignore`, and
   `.github/instructions/important-files.instructions.md` as described.
6. Run `pnpm build` to confirm the project compiles.

---
*Once this establishes the base, project-specific hardening/refactor/feature
prompts (02+) get written against whatever exists here — they should not be
authored generically, since they depend on the actual domain logic added
after this step.*
