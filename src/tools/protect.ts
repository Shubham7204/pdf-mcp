import { execFile } from "child_process";
import { promisify } from "util";
import { resolveSafePath, assertFileExists } from "../lib/paths.js";

const execFileAsync = promisify(execFile);

export interface ProtectInput {
  file: string;
  output: string;
  password: string;
  owner_password?: string;  // optional separate owner/admin password
}

export async function protectPdf(input: ProtectInput): Promise<string> {
  const inputPath = resolveSafePath(input.file);
  const outputPath = resolveSafePath(input.output);

  try {
    await assertFileExists(inputPath);
    await execFileAsync("qpdf", [
      "--encrypt",
      input.password,
      input.owner_password ?? input.password,
      "256",
      "--print=none",
      "--modify=none",
      "--extract=n",
      "--annotate=n",
      "--",
      inputPath,
      outputPath,
    ], { timeout: 30_000 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to protect PDF: ${message}`);
  }

  return `Password-protected (AES-256) → ${outputPath}`;
}