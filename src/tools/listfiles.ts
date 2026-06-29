import { readdir, stat } from "fs/promises";
import path from "path";

export interface ListFilesInput {
  directory: string;
  extension?: string; // optional filter e.g. ".pdf"
}

export async function listFiles(input: ListFilesInput): Promise<string> {
  const dirPath = path.resolve(input.directory);
  const entries = await readdir(dirPath);
  
  const filtered = input.extension
    ? entries.filter((f) => f.endsWith(input.extension!))
    : entries;

  if (filtered.length === 0) return `No files found in ${dirPath}`;
  
  return filtered.map((f) => path.join(dirPath, f)).join("\n");
}
