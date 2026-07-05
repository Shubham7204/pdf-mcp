import path from "path";
import { stat } from "fs/promises";
import fs from "fs";

// Establish allowed roots to prevent path traversal while remaining functional
const allowedRoots: string[] = [];

// 1. If explicit env variable is set, use it
if (process.env.PDF_MCP_ROOT) {
  allowedRoots.push(path.resolve(process.env.PDF_MCP_ROOT));
}

// 2. Add current working directory
allowedRoots.push(path.resolve(process.cwd()));

// 3. Add user profile directory (to allow Downloads, Documents, etc.)
if (process.env.USERPROFILE) {
  allowedRoots.push(path.resolve(process.env.USERPROFILE));
} else if (process.env.HOME) {
  allowedRoots.push(path.resolve(process.env.HOME));
}

// 4. Add the workspace / project root explicitly
allowedRoots.push(path.resolve("D:/kpmg/pdf-mcp"));

export function resolveSafePath(inputPath: string): string {
  let resolved = path.resolve(inputPath);
  
  // If the input path is relative, resolve against non-system allowed roots to find matches
  if (!path.isAbsolute(inputPath)) {
    let foundPath = false;
    for (const root of allowedRoots) {
      const lowerRoot = root.toLowerCase();
      // Skip resolving relative to system folders like system32
      if (lowerRoot.includes("system32") || lowerRoot === "c:\\windows") {
        continue;
      }
      const candidate = path.resolve(root, inputPath);
      if (fs.existsSync(candidate)) {
        resolved = candidate;
        foundPath = true;
        break;
      }
    }

    // If not found, default to resolving against a preferred user/workspace root
    if (!foundPath) {
      const preferredRoot = allowedRoots.find((root) => {
        const lowerRoot = root.toLowerCase();
        return !lowerRoot.includes("system32") && lowerRoot !== "c:\\windows";
      });
      if (preferredRoot) {
        resolved = path.resolve(preferredRoot, inputPath);
      }
    }
  }

  // Check if the resolved path starts with any of the allowed roots
  const isAllowed = allowedRoots.some((root) => {
    return resolved.startsWith(root + path.sep) || resolved === root;
  });

  if (!isAllowed) {
    throw new Error(
      `Path "${inputPath}" resolves outside the allowed roots. Allowed locations include the user profile and project workspace directories.`
    );
  }
  return resolved;
}

export async function assertFileExists(resolvedPath: string): Promise<void> {
  await stat(resolvedPath); // throws if missing — let the caller catch it
}
