import { readdir } from "fs/promises";
import path from "path";
import { resolveSafePath } from "../lib/paths.js";

export interface ListFilesInput {
  directory: string;
  extension?: string; // optional filter e.g. ".pdf"
}

export async function listFiles(input: ListFilesInput): Promise<string> {
  const dirPath = resolveSafePath(input.directory);
  const entries = await readdir(dirPath);
  
  const filtered = input.extension
    ? entries.filter((f) => f.endsWith(input.extension!))
    : entries;

  if (filtered.length === 0) return `No files found in ${dirPath}`;
  
  return filtered.map((f) => path.join(dirPath, f)).join("\n");
}
