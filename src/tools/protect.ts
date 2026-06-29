import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export interface ProtectInput {
  file: string;
  output: string;
  password: string;
  owner_password?: string;  // optional separate owner/admin password
}

export async function protectPdf(input: ProtectInput): Promise<string> {
  const inputPath = path.resolve(input.file);
  const outputPath = path.resolve(input.output);

  try {
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
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to protect PDF: ${message}`);
  }

  return `Password-protected (AES-256) → ${outputPath}`;
}