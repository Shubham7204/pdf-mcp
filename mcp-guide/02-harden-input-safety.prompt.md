---
mode: "agent"
description: "02 - Harden path safety, exec timeouts, and OCR guards on the PDF MCP server"
---

# 02 — Harden Input Safety

## Problem
Every tool takes raw file paths straight from whatever calls the MCP server
(an LLM client). None of the current tool functions confirm a path stays
inside an allowed directory before reading or writing. `compressPdf` and
`protectPdf` shell out to `qpdf` via `execFile` with no timeout, and
`extractText`'s OCR fallback (`Tesseract.recognize`) has no size limit —
both can hang indefinitely on a hostile or corrupted input.

## Supporting Information

Add a single shared helper, `src/lib/paths.ts`:

```ts
import path from "path";
import { stat } from "fs/promises";

const ALLOWED_ROOT = path.resolve(process.env.PDF_MCP_ROOT ?? process.cwd());

export function resolveSafePath(inputPath: string): string {
  const resolved = path.resolve(inputPath);
  if (!resolved.startsWith(ALLOWED_ROOT + path.sep) && resolved !== ALLOWED_ROOT) {
    throw new Error(
      `Path "${inputPath}" resolves outside the allowed root (${ALLOWED_ROOT}).`
    );
  }
  return resolved;
}

export async function assertFileExists(resolvedPath: string): Promise<void> {
  await stat(resolvedPath); // throws if missing — let the caller catch it
}
```

`PDF_MCP_ROOT` is an optional env var; if unset, the allowed root is the
process's working directory. This must not break any currently-passing
input that already lives under the working directory — it only rejects
paths that escape it (e.g. `../../etc/passwd`).

For `execFile` calls to `qpdf` (in `compress.ts` and `protect.ts`), add a
`timeout` option:

```ts
await execFileAsync("qpdf", [...args], { timeout: 30_000 });
```

For `extractText`'s OCR path (`extract.ts`), add a file-size guard before
calling `Tesseract.recognize` — reject (with a clear error) any input file
over a reasonable threshold (e.g. 20MB) rather than letting it run
unbounded.

## Steps To Complete
1. Create `src/lib/paths.ts` with `resolveSafePath` and `assertFileExists`
   as shown above.
2. In every tool file (`merge.ts`, `split.ts`, `compress.ts`, `extract.ts`,
   `protect.ts`, `listfiles.ts`), replace direct `path.resolve(...)` calls
   on user-supplied `file`/`output`/`directory` params with
   `resolveSafePath(...)`.
3. Add `{ timeout: 30_000 }` to the `execFileAsync("qpdf", ...)` calls in
   `compress.ts` and `protect.ts`.
4. Add a file-size check (via `stat`) before the `Tesseract.recognize` call
   in `extract.ts`; throw a descriptive error if the file exceeds 20MB.
5. Do NOT change any tool's registered name, input schema shape, or
   success-case return string format — only the internal safety checks.
6. Update `.github/instructions/important-files.instructions.md` with a row
   for `src/lib/paths.ts`.
7. Run the build script and manually re-verify each tool still succeeds on
   a valid file inside the working directory (a path-escape rejection is
   the only new failure mode expected).
