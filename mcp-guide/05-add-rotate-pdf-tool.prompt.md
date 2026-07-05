---
mode: "agent"
description: "05 - Add a rotate_pdf tool using the patterns established in steps 01-04"
---

# 05 — Add `rotate_pdf` Using Established Patterns

## Problem
Add a new tool, `rotate_pdf`, that rotates specified pages of a PDF by a
given angle (90/180/270 degrees) and writes the result to a new file. This
step exists to confirm the structure from steps 01–04 actually holds up for
new work, not just the refactor itself.

## Supporting Information

**Before writing anything**, read:
1. `.github/instructions/important-files.instructions.md` for the current
   file map.
2. `src/tools/split.ts` — closest existing operation (page-indexed,
   `pdf-lib`-based) to copy the shape from.
3. `src/lib/paths.ts` — use `resolveSafePath`/`assertFileExists`, don't
   inline a new path-resolution approach.
4. `src/mcp-tools/split.ts` (or wherever split's registration ended up
   after step 04) — copy the registration shape.

`pdf-lib` rotation API:

```ts
import { degrees } from "pdf-lib";

page.setRotation(degrees(angle));
```

## Steps To Complete
1. Add `rotatePdf` to `src/tools/rotate.ts`:
   - Input: `{ file: string; output: string; pages: number[]; angle: 90 | 180 | 270 }`
   - Use `resolveSafePath` on `file` and `output`, `assertFileExists` on the
     resolved input path.
   - Load with `pdf-lib`, rotate the specified 1-indexed pages by `angle`,
     save to the resolved output path.
   - Return a string in the same style as `splitPdf`'s return value.
   - Wrap filesystem/library errors and re-throw as a message-only `Error`.
2. Add `src/mcp-tools/rotate.ts` with `registerRotateTools(server)`,
   registering `rotate_pdf` with a real `title`/`description`, a Zod schema
   matching the input above, and the same try/catch → `isError` pattern
   used by every other tool.
3. Call `registerRotateTools(server)` from `main.ts` alongside the other
   `register<Domain>Tools` calls.
4. Add a row for both new files in
   `.github/instructions/important-files.instructions.md`.
5. Do not modify any existing tool's file, name, schema, or behavior in
   this step.
6. Run the build script and confirm `rotate_pdf` is registered without
   affecting any other tool.
